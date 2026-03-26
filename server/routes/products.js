const express = require('express');
const https = require('https');
const crypto = require('crypto');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const { dbRun, dbGet, dbAll } = require('../config/database');
const { generateResponse } = require('../services/ai');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const router = express.Router();

router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const products = await dbAll('SELECT * FROM products WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
  res.json({ products });
});

router.post('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }
  const result = await dbRun(
    'INSERT INTO products (tenant_id, name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.tenantId, name, description || '', price, category || '', image_url || '', stock || 0]
  );
  const product = await dbGet('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);
  res.json({ product });
});

router.put('/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, price, category, image_url, stock, active } = req.body;
  const existing = await dbGet('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });
  await dbRun(
    'UPDATE products SET name=?, description=?, price=?, category=?, image_url=?, stock=?, active=? WHERE id=? AND tenant_id=?',
    [name ?? existing.name, description ?? existing.description, price ?? existing.price,
     category ?? existing.category, image_url ?? existing.image_url, stock ?? existing.stock,
     active ?? existing.active, Number(req.params.id), req.tenantId]
  );
  const product = await dbGet('SELECT * FROM products WHERE id = ?', [Number(req.params.id)]);
  res.json({ product });
});

router.delete('/:id', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const product = await dbGet('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  // Delete image from S3 if it's ours
  const awsUrl = process.env.AWS_URL || '';
  if (product.image_url && product.image_url.startsWith(awsUrl)) {
    try {
      const key = product.image_url.replace(awsUrl, '');
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key }));
    } catch (e) { console.error('Error deleting S3 image:', e.message); }
  }

  await dbRun('DELETE FROM products WHERE id = ? AND tenant_id = ?', [Number(req.params.id), req.tenantId]);
  res.json({ success: true });
});

// Check if user has a Gemini key for image generation
router.get('/can-generate-image', authMiddleware, requireTenant, async (req, res) => {
  const geminiKey = await dbGet(
    "SELECT id FROM ai_keys WHERE tenant_id = ? AND provider = 'gemini' LIMIT 1",
    [req.tenantId]
  );
  res.json({ available: !!geminiKey });
});

// Upload product image to S3
router.post('/upload-image', authMiddleware, adminOnly, requireTenant, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se envio imagen' });

    const ext = req.file.mimetype === 'image/jpeg' ? 'jpg' : req.file.mimetype === 'image/webp' ? 'webp' : 'png';
    const key = `sellmate/products/uploaded/${crypto.randomUUID()}.${ext}`;
    const bucket = process.env.AWS_BUCKET;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    }));

    const imageUrl = `${process.env.AWS_URL}${key}`;
    res.json({ image_url: imageUrl });
  } catch (e) {
    console.error('Error uploading image:', e.message);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

// Import image from external URL — downloads and re-uploads to S3
router.post('/import-image', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url?.trim()) return res.status(400).json({ error: 'URL requerida' });

    // Download the image
    const imageBuffer = await new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : require('http');
      client.get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          // Follow redirect
          const rClient = response.headers.location.startsWith('https') ? https : require('http');
          rClient.get(response.headers.location, (rRes) => {
            const chunks = [];
            rRes.on('data', chunk => chunks.push(chunk));
            rRes.on('end', () => resolve(Buffer.concat(chunks)));
            rRes.on('error', reject);
          }).on('error', reject);
          return;
        }
        if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`));
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });

    if (imageBuffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Imagen demasiado grande (max 5MB)' });
    }

    // Detect content type from URL or default to png
    let contentType = 'image/png';
    let ext = 'png';
    if (url.match(/\.jpe?g/i)) { contentType = 'image/jpeg'; ext = 'jpg'; }
    else if (url.match(/\.webp/i)) { contentType = 'image/webp'; ext = 'webp'; }
    else if (url.match(/\.gif/i)) { contentType = 'image/gif'; ext = 'gif'; }

    const key = `sellmate/products/uploaded/${crypto.randomUUID()}.${ext}`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      ACL: 'public-read'
    }));

    const imageUrl = `${process.env.AWS_URL}${key}`;
    res.json({ image_url: imageUrl });
  } catch (e) {
    console.error('Error importing image:', e.message);
    res.status(500).json({ error: 'Error al importar imagen' });
  }
});

// AI-generate product details from just a name
router.post('/generate', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nombre del producto requerido' });

    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
    if (!settings || !settings.ai_api_key) {
      return res.status(400).json({ error: 'Configura tu proveedor de IA primero' });
    }

    // Get existing categories for context
    const existing = await dbAll(
      'SELECT DISTINCT category FROM products WHERE tenant_id = ? AND category IS NOT NULL AND category != "" AND active = 1',
      [req.tenantId]
    );
    const existingCategories = existing.map(r => r.category);

    // Get business info for context
    const business = await dbGet('SELECT name, description FROM business_info WHERE tenant_id = ?', [req.tenantId]);

    const systemPrompt = `Eres un asistente experto en catalogos de productos para negocios.
Genera los detalles de un producto basandote solo en su nombre.
Responde UNICAMENTE con un JSON valido, sin markdown, sin backticks, sin texto adicional.

El JSON debe tener esta estructura exacta:
{"description":"descripcion breve y atractiva del producto en 1-2 oraciones","category":"categoria del producto","price":0,"stock":10}

Reglas:
- La descripcion debe ser en español, comercial y concisa
- El precio debe ser un numero razonable en dolares (sin simbolo)
- El stock debe ser un numero entero razonable (entre 1 y 100)
${existingCategories.length > 0 ? `- Categorias existentes del negocio: ${existingCategories.join(', ')}. Usa una existente si aplica, o sugiere una nueva si no encaja.` : '- Sugiere una categoria apropiada para el producto.'}
${business?.name ? `- Este producto es de: ${business.name}${business?.description ? ` — ${business.description}` : ''}` : ''}`;

    const messages = [
      { role: 'user', content: `Genera los detalles para este producto: "${name}"` }
    ];

    const aiResult = await generateResponse(req.tenantId, systemPrompt, messages, settings);
    const rawText = String(aiResult?.response || aiResult || '').trim();

    // Parse JSON — strip any markdown fencing
    const jsonStr = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const result = JSON.parse(jsonStr);

    res.json({
      description: result.description || '',
      category: result.category || '',
      price: Number(result.price) || 0,
      stock: Number(result.stock) || 10
    });
  } catch (e) {
    console.error('Error generating product details:', e.message);
    res.status(500).json({ error: 'Error al generar detalles del producto' });
  }
});

// Generate product image using Gemini Imagen
router.post('/generate-image', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { productName, description } = req.body;
    if (!productName?.trim()) return res.status(400).json({ error: 'Nombre del producto requerido' });

    // Find a Gemini key from the user's ai_keys
    const geminiKey = await dbGet(
      "SELECT * FROM ai_keys WHERE tenant_id = ? AND provider = 'gemini' LIMIT 1",
      [req.tenantId]
    );
    if (!geminiKey) {
      return res.status(400).json({ error: 'Necesitas agregar una llave de Gemini en Ajustes de IA para generar imagenes' });
    }

    const prompt = `Professional product photo of "${productName}"${description ? `, ${description}` : ''}. Clean white background, studio lighting, commercial photography, high quality, no text.`;

    const apiKey = geminiKey.api_key;
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    });

    const result = await new Promise((resolve, reject) => {
      const reqOpts = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/nano-banana-pro-preview:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const httpReq = https.request(reqOpts, (httpRes) => {
        let data = '';
        httpRes.on('data', chunk => data += chunk);
        httpRes.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));

            const parts = parsed.candidates?.[0]?.content?.parts || [];
            const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
            if (!imagePart) return reject(new Error('No se genero imagen'));

            resolve({
              base64: imagePart.inlineData.data,
              mimeType: imagePart.inlineData.mimeType
            });
          } catch (e) { reject(e); }
        });
      });

      httpReq.on('error', reject);
      httpReq.write(postData);
      httpReq.end();
    });

    // Upload to S3
    const ext = result.mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const key = `sellmate/products/generated/${crypto.randomUUID()}.${ext}`;
    const bucket = process.env.AWS_BUCKET;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(result.base64, 'base64'),
      ContentType: result.mimeType,
      ACL: 'public-read'
    }));

    const imageUrl = `${process.env.AWS_URL}${key}`;
    res.json({ image_url: imageUrl });
  } catch (e) {
    console.error('Error generating product image:', e.message);
    res.status(500).json({ error: e.message || 'Error al generar imagen' });
  }
});

module.exports = router;
