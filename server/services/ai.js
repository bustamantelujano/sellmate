const https = require('https');
const { dbRun } = require('../config/database');

/**
 * Configurable AI provider abstraction.
 * Supports: openai, anthropic, custom (OpenAI-compatible endpoint)
 * Now with tool calling loop for MCP integration.
 */

const MAX_TOOL_ROUNDS = 5; // Max tool-use iterations to prevent infinite loops

// ────────────────── Usage Tracking ──────────────────

async function trackUsage(tenantId, provider, model, inputTokens, outputTokens, requestType = 'chat') {
  const totalTokens = inputTokens + outputTokens;
  // Rough cost estimates per 1M tokens
  const costs = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
    'claude-haiku-4-5': { input: 0.80, output: 4.00 },
  };
  const rate = costs[model] || { input: 1.00, output: 3.00 };
  const costEstimate = (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;

  try {
    await dbRun(
      'INSERT INTO ai_usage (tenant_id, provider, model, input_tokens, output_tokens, total_tokens, cost_estimate, request_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, provider, model, inputTokens, outputTokens, totalTokens, costEstimate, requestType]
    );
  } catch (e) {
    console.error('Error tracking AI usage:', e.message);
  }
}

function buildRequestOptions(settings) {
  const provider = settings.ai_provider || 'openai';
  const apiKey = settings.ai_api_key || process.env.AI_API_KEY;
  const model = settings.ai_model || process.env.AI_MODEL || 'gpt-4o-mini';

  if (provider === 'openai') {
    return {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      model
    };
  }
  if (provider === 'anthropic') {
    return {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      model
    };
  }
  // Custom (OpenAI-compatible)
  const url = new URL(settings.ai_custom_endpoint || 'https://api.openai.com/v1/chat/completions');
  return {
    hostname: url.hostname,
    path: url.pathname,
    port: url.port || 443,
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    model
  };
}

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: options.hostname,
      port: options.port || 443,
      path: options.path,
      method: 'POST',
      headers: options.headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`AI response parse error: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Parse a structured JSON response from the AI.
 */
function parseStructuredResponse(text) {
  const defaultResult = { response: text, topic: null, emoji_reaction: null, appointment: null };
  if (!text) return defaultResult;

  try {
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed.response === 'string') {
      return {
        response: parsed.response,
        topic: parsed.topic || null,
        emoji_reaction: parsed.emoji_reaction || null,
        appointment: parsed.appointment || null
      };
    }
  } catch (e) { /* not valid JSON */ }
  return defaultResult;
}

/**
 * Generate a response, optionally using MCP tools.
 *
 * @param {string} systemPrompt
 * @param {Array} chatHistory - [{role, content}]
 * @param {object} settings - DB settings row
 * @param {object} [toolCtx] - Optional MCP tool context
 * @param {Array} [toolCtx.openaiTools] - OpenAI-format tools
 * @param {Array} [toolCtx.anthropicTools] - Anthropic-format tools
 * @param {Map}   [toolCtx.toolMap] - qualifiedName → {serverId, toolName}
 * @param {function} [toolCtx.executeTool] - async (name, args, toolMap) => string
 */
async function generateResponse(tenantId, systemPrompt, chatHistory, settings, toolCtx) {
  const provider = settings.ai_provider || 'openai';

  if (provider === 'anthropic') {
    return _anthropicLoop(tenantId, systemPrompt, chatHistory, settings, toolCtx);
  }
  // OpenAI / Custom (OpenAI-compatible)
  return _openaiLoop(tenantId, systemPrompt, chatHistory, settings, toolCtx);
}

// ────────────────── OpenAI Tool Calling Loop ──────────────────

async function _openaiLoop(tenantId, systemPrompt, chatHistory, settings, toolCtx) {
  const opts = buildRequestOptions(settings);
  const provider = settings.ai_provider || 'openai';
  const hasTools = toolCtx && toolCtx.openaiTools && toolCtx.openaiTools.length > 0;
  const hasImages = chatHistory.some(m => Array.isArray(m.content));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const body = {
      model: opts.model,
      max_tokens: hasImages ? 1000 : 600,
      messages
    };
    if (hasTools && round < MAX_TOOL_ROUNDS - 1) {
      body.tools = toolCtx.openaiTools;
      body.tool_choice = 'auto';
    }

    const result = await makeRequest(opts, body);
    if (result.error) throw new Error(result.error.message);

    // Track usage for each round
    if (tenantId && result.usage) {
      const inputTokens = result.usage.prompt_tokens || 0;
      const outputTokens = result.usage.completion_tokens || 0;
      trackUsage(tenantId, provider, opts.model, inputTokens, outputTokens, 'chat').catch(() => {});
    }

    const choice = result.choices?.[0];
    if (!choice) throw new Error('No response from AI');

    const msg = choice.message;

    // If there are tool calls, execute them and feed results back
    if (msg.tool_calls && msg.tool_calls.length > 0 && hasTools) {
      // Add assistant message with tool_calls to conversation
      messages.push(msg);

      for (const tc of msg.tool_calls) {
        let toolResult;
        try {
          const args = typeof tc.function.arguments === 'string'
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments;
          toolResult = await toolCtx.executeTool(tc.function.name, args, toolCtx.toolMap);
        } catch (err) {
          toolResult = `Error: ${err.message}`;
        }

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
        });
      }
      // Continue loop — AI will generate another response using tool results
      continue;
    }

    // No tool calls — we have a final text response
    const rawText = msg.content || 'Lo siento, no pude generar una respuesta.';
    return parseStructuredResponse(rawText);
  }

  // Safety: if we exhaust rounds, return last known content
  return parseStructuredResponse('Lo siento, hubo un problema procesando tu solicitud.');
}

// ────────────────── Anthropic Tool Calling Loop ──────────────────

async function _anthropicLoop(tenantId, systemPrompt, chatHistory, settings, toolCtx) {
  const opts = buildRequestOptions(settings);
  const hasTools = toolCtx && toolCtx.anthropicTools && toolCtx.anthropicTools.length > 0;
  const hasImages = chatHistory.some(m => Array.isArray(m.content));

  // Transform image content from OpenAI format to Anthropic format before cleaning
  const transformedHistory = chatHistory.map(m => {
    if (Array.isArray(m.content)) {
      const content = m.content.map(part => {
        if (part.type === 'image_url' && part.image_url?.url) {
          const dataUri = part.image_url.url;
          const matches = dataUri.match(/^data:(image\/[^;]+);base64,(.+)$/);
          if (matches) {
            return {
              type: 'image',
              source: {
                type: 'base64',
                media_type: matches[1],
                data: matches[2]
              }
            };
          }
        }
        return part;
      });
      return { role: m.role, content };
    }
    return m;
  });

  // Clean messages for Anthropic (alternate user/assistant, start with user)
  const messages = _cleanAnthropicMessages(transformedHistory);

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const body = {
      model: opts.model,
      max_tokens: hasImages ? 1000 : 600,
      system: systemPrompt,
      messages
    };
    if (hasTools && round < MAX_TOOL_ROUNDS - 1) {
      body.tools = toolCtx.anthropicTools;
    }

    const result = await makeRequest(opts, body);
    if (result.error) throw new Error(result.error.message);

    // Track usage for each round
    if (tenantId && result.usage) {
      const inputTokens = result.usage.input_tokens || 0;
      const outputTokens = result.usage.output_tokens || 0;
      trackUsage(tenantId, 'anthropic', opts.model, inputTokens, outputTokens, 'chat').catch(() => {});
    }

    const content = result.content;
    if (!content || !Array.isArray(content)) {
      throw new Error('Unexpected Anthropic response format');
    }

    // Check for tool_use blocks
    const toolUseBlocks = content.filter(b => b.type === 'tool_use');
    const textBlocks = content.filter(b => b.type === 'text');

    if (toolUseBlocks.length > 0 && hasTools) {
      // Add assistant response to messages
      messages.push({ role: 'assistant', content });

      // Build tool results
      const toolResults = [];
      for (const tu of toolUseBlocks) {
        let toolResult;
        try {
          toolResult = await toolCtx.executeTool(tu.name, tu.input, toolCtx.toolMap);
        } catch (err) {
          toolResult = `Error: ${err.message}`;
        }
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
        });
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // No tool use — extract final text
    const rawText = textBlocks.map(b => b.text).join('\n') || 'Lo siento, no pude generar una respuesta.';
    return parseStructuredResponse(rawText);
  }

  return parseStructuredResponse('Lo siento, hubo un problema procesando tu solicitud.');
}

/**
 * Clean messages for Anthropic API: must alternate user/assistant, start with user.
 */
function _cleanAnthropicMessages(chatHistory) {
  const cleaned = [];
  for (const msg of chatHistory) {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';
    const content = msg.content;
    if (cleaned.length === 0 && role !== 'user') continue;
    if (cleaned.length > 0 && cleaned[cleaned.length - 1].role === role) {
      // Merge same-role consecutive messages
      const prev = cleaned[cleaned.length - 1];
      if (typeof prev.content === 'string' && typeof content === 'string') {
        prev.content += '\n' + content;
      } else {
        // Convert both to arrays and concatenate (handles vision content arrays)
        const prevArr = Array.isArray(prev.content) ? prev.content : [{ type: 'text', text: prev.content }];
        const msgArr = Array.isArray(content) ? content : [{ type: 'text', text: content }];
        prev.content = [...prevArr, ...msgArr];
      }
    } else {
      cleaned.push({ role, content });
    }
  }
  return cleaned.length > 0 ? cleaned : [{ role: 'user', content: 'Hola' }];
}

// ────────────────── Image Generation (DALL-E) ──────────────────

async function generateImage(tenantId, prompt, settings, size = '1024x1024') {
  if (settings.ai_provider !== 'openai' && settings.ai_provider !== 'custom') {
    throw new Error('La generación de imágenes solo está disponible con OpenAI');
  }

  const apiKey = settings.ai_api_key;
  const endpoint = settings.ai_provider === 'custom' ? settings.ai_custom_endpoint : 'https://api.openai.com';

  return new Promise((resolve, reject) => {
    const url = new URL(endpoint + '/v1/images/generations');
    const postData = JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      response_format: 'url'
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));

          // Track usage (DALL-E pricing is per image, not tokens)
          trackUsage(tenantId, 'openai', 'dall-e-3', 0, 0, 'image_generation').catch(() => {});

          resolve(parsed.data[0]);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = { generateResponse, parseStructuredResponse, generateImage };
