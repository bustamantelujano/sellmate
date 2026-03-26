# SellMate

**Asistente de ventas autonomo por WhatsApp, potenciado con IA para pequenos negocios.**

SellMate conecta tu negocio con tus clientes a traves de WhatsApp, automatizando conversaciones, pedidos, citas y seguimiento con inteligencia artificial. Multi-tenant, modular y open source.

---

## Funcionalidades

- **Bot de WhatsApp con IA** - Responde automaticamente a tus clientes usando OpenAI, Anthropic, Google Gemini o cualquier API compatible
- **Multi-tenant** - Sirve multiples negocios desde una sola instancia, cada uno con datos aislados
- **Sistema de modulos** - Activa/desactiva funcionalidades segun tu tipo de negocio (pedidos, citas, cotizaciones, productos, fidelizacion, generacion de imagenes)
- **Wizard de configuracion** - Onboarding guiado para configurar tu negocio en minutos
- **Tipos de negocio soportados** - Restaurantes, barberias, consultorios, tiendas, servicios profesionales y mas
- **Dashboard en tiempo real** - Metricas y estadisticas con Socket.IO
- **Gestion de conversaciones** - Modos bot/humano/cerrado con transicion fluida
- **Gestion de clientes** - Creacion automatica de contactos desde WhatsApp
- **Tracking de uso de IA** - Estimacion de costos por proveedor y modelo
- **Integracion MCP** - Herramientas externas via Model Context Protocol (stdio/SSE)
- **Modo Copiloto** - Sugerencias de IA para agentes humanos
- **Control de presencia** - Marca tu WhatsApp como online/offline desde el dashboard
- **Dark mode** - Interfaz con soporte completo de tema oscuro
- **Vision de imagenes** - Analiza imagenes enviadas por clientes
- **Automatizacion de seguimiento** - Fidelizacion automatica de clientes

## Capturas de pantalla

> _Proximamente_

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| **Backend** | Express.js, MariaDB (mysql2), Socket.IO |
| **WhatsApp** | Baileys (WhatsApp Web API) |
| **Frontend** | Vue 3, Vite, Tailwind CSS, Pinia |
| **IA** | OpenAI, Anthropic, Google Gemini, Custom (OpenAI-compatible) |
| **Deploy** | Heroku con JawsDB Maria (o cualquier MariaDB/MySQL) |

## Prerequisitos

- **Node.js** 18+ (recomendado 22.x)
- **MariaDB** o **MySQL** 5.7+
- Una API key de un proveedor de IA (OpenAI, Anthropic, Google Gemini, etc.)
- Un numero de telefono con WhatsApp

## Inicio rapido

### 1. Clonar el repositorio

```bash
git clone https://github.com/cebasic/sellmate.git
cd sellmate
```

### 2. Instalar dependencias

```bash
npm install
```

Esto tambien instala las dependencias del cliente automaticamente (`postinstall`).

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
PORT=3000
JWT_SECRET=cambia-esto-por-algo-seguro
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu-password
DB_NAME=sellmate

# IA (se puede configurar despues desde el wizard)
AI_PROVIDER=openai
AI_API_KEY=tu-api-key
AI_MODEL=gpt-4o-mini
```

### 4. Crear la base de datos

```bash
mysql -u root -p -e "CREATE DATABASE sellmate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Las tablas se crean automaticamente al iniciar el servidor.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Esto inicia el servidor backend y el cliente Vite en paralelo:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### 6. Configurar tu negocio

Abre `http://localhost:5173` en tu navegador. La primera vez te pedira crear una cuenta de administrador y te guiara por el wizard de configuracion.

## Variables de entorno

| Variable | Descripcion | Requerida | Default |
|----------|------------|-----------|---------|
| `PORT` | Puerto del servidor | No | `3000` |
| `JWT_SECRET` | Clave secreta para tokens JWT | Si | - |
| `NODE_ENV` | Entorno (`development` / `production`) | No | `development` |
| `DB_HOST` | Host de MariaDB/MySQL | Si | `localhost` |
| `DB_PORT` | Puerto de MariaDB/MySQL | No | `3306` |
| `DB_USER` | Usuario de base de datos | Si | - |
| `DB_PASSWORD` | Password de base de datos | Si | - |
| `DB_NAME` | Nombre de la base de datos | Si | `sellmate` |
| `JAWSDB_MARIA_URL` | URL de conexion JawsDB (Heroku) | No | - |
| `AI_PROVIDER` | Proveedor de IA: `openai`, `anthropic`, `gemini`, `custom` | No | `openai` |
| `AI_API_KEY` | API key del proveedor de IA | No | - |
| `AI_MODEL` | Modelo de IA a usar | No | `gpt-4o-mini` |
| `AI_CUSTOM_ENDPOINT` | Endpoint para proveedores custom | No | - |

> La configuracion de IA tambien se puede gestionar desde la interfaz web (Ajustes o Wizard).

## Deploy en Heroku

### 1. Crear la app

```bash
heroku create tu-sellmate
```

### 2. Agregar MariaDB

```bash
heroku addons:create jawsdb-maria:kitefin
```

Heroku configurara automaticamente `JAWSDB_MARIA_URL`.

### 3. Configurar variables

```bash
heroku config:set JWT_SECRET=tu-clave-super-secreta
heroku config:set NODE_ENV=production
heroku config:set AI_PROVIDER=openai
heroku config:set AI_API_KEY=tu-api-key
heroku config:set AI_MODEL=gpt-4o-mini
```

### 4. Deploy

```bash
git push heroku main
```

El build del frontend se ejecuta automaticamente via `heroku-postbuild`.

### 5. Abrir la app

```bash
heroku open
```

## Sistema de modulos

SellMate usa un sistema modular que permite activar/desactivar funcionalidades segun las necesidades de cada negocio.

| Modulo | Descripcion | Restaurante | Barberia | Consultorio | Tienda | Servicios |
|--------|------------|:-----------:|:--------:|:-----------:|:------:|:---------:|
| **Productos** | Catalogo con precios e imagenes | Si | Si | - | Si | Si |
| **Pedidos** | Recibir y gestionar pedidos | Si | - | - | Si | Si |
| **Citas** | Agendar citas desde WhatsApp | - | Si | Si | - | Si |
| **Fidelizacion** | Seguimiento automatico | Si | Si | Si | Si | Si |
| **Copiloto IA** | Sugerencias para agentes | Si | Si | Si | Si | Si |
| **Respuesta automatica** | Bot responde automaticamente | Si | Si | Si | Si | Si |

Los modulos se configuran durante el wizard inicial o desde la seccion de Ajustes.

## Arquitectura

```
sellmate/
├── server/
│   ├── index.js                # Entry point (Express + Socket.IO + static serving)
│   ├── config/
│   │   └── database.js         # MySQL pool, schema init, auto-migrations
│   ├── db/
│   │   └── schema.sql          # Full schema (22 tables, multi-tenant)
│   ├── middleware/
│   │   └── auth.js             # JWT auth, tenant context, role checks
│   ├── services/
│   │   ├── ai.js               # Multi-provider AI abstraction + tool calling loops
│   │   ├── bot.js              # Message handling, system prompt builder
│   │   ├── whatsapp.js         # Baileys manager (per-tenant connections)
│   │   ├── mcp.js              # Model Context Protocol (stdio/SSE)
│   │   ├── socket.js           # Real-time event hub
│   │   ├── followups.js        # Cron job: loyalty messaging (hourly)
│   │   └── dbAuthState.js      # WhatsApp session persistence in DB
│   └── routes/
│       ├── auth.js             # Register, login, agents CRUD
│       ├── conversations.js    # Chat history, delete, clear
│       ├── products.js         # Catalog CRUD
│       ├── clients.js          # Contact database
│       ├── orders.js           # Order lifecycle management
│       ├── appointments.js     # Calendar + public confirmation links
│       ├── followups.js        # Loyalty rules engine
│       ├── settings.js         # Bot config, AI keys CRUD, test-ai
│       ├── business.js         # Business info management
│       ├── modules.js          # Feature flags + presets
│       ├── copilot.js          # AI suggestions for human agents
│       └── usage.js            # Token tracking + cost analytics
├── client/
│   ├── src/
│   │   ├── App.vue             # Root (Sidebar + TopBar layout)
│   │   ├── router/index.js     # 18 routes
│   │   ├── views/              # Pages
│   │   │   ├── Landing.vue     # Public marketing page
│   │   │   ├── Login.vue       # Auth
│   │   │   ├── SetupWizard.vue # Onboarding wizard
│   │   │   ├── Dashboard.vue   # Metrics overview
│   │   │   ├── ChatView.vue    # Live chat (bot/human modes)
│   │   │   ├── Conversations.vue
│   │   │   ├── Clients.vue     # Contact CRM
│   │   │   ├── Orders.vue      # Order management
│   │   │   ├── Appointments.vue # Calendar (day/week/month)
│   │   │   ├── Settings.vue    # All settings + AI key management
│   │   │   ├── AIUsage.vue     # Token analytics dashboard (chart.js)
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── Sidebar.vue
│   │   │   ├── TopBar.vue
│   │   │   └── calendar/       # Day, Week, Month, DetailModal
│   │   ├── stores/             # Pinia (auth, theme, settings, notifications)
│   │   ├── composables/        # useSocket.js
│   │   └── lib/                # Utilities (api.js, phone.js)
│   ├── vite.config.js          # Proxy /api + /socket.io to backend
│   └── tailwind.config.js
├── Procfile                    # web: node server/index.js
├── .env.example
└── package.json                # Root + postinstall + dev scripts
```

### Flujo de un mensaje

```
WhatsApp → Baileys → bot.js → ai.js → [OpenAI/Anthropic/Gemini]
                                           ↓
                                    JSON estructurado
                                    {response, topic, emoji, order?, appointment?}
                                           ↓
                        ┌──────────────────┼──────────────────┐
                        ↓                  ↓                  ↓
                  Envia respuesta    Crea orden/cita    Clasifica topic
                  por WhatsApp       en la DB           en conversacion
                        ↓
                  Socket.IO → Dashboard actualizado en tiempo real
```

### Multi-tenant

Cada tenant (negocio) tiene datos completamente aislados:
- Su propia conexion WhatsApp (instancia Baileys independiente)
- Sus propios productos, conversaciones, clientes, ordenes
- Sus propias API keys de IA y configuracion
- JWT tokens incluyen `tenant_id` para filtrar todo

### Base de datos

22 tablas en MariaDB/MySQL con migraciones automaticas al iniciar:

| Tabla | Descripcion |
|-------|------------|
| `tenants` | Negocios registrados |
| `users` | Usuarios con roles (admin, agent, super_admin) |
| `settings` | Config del bot y IA activa por tenant |
| `business_info` | Datos del negocio (nombre, horario, direccion) |
| `products` | Catalogo con precios, stock, imagenes |
| `conversations` | Conversaciones WhatsApp (status: bot/human/closed) |
| `messages` | Historial de mensajes con soporte de imagenes |
| `clients` | Base de contactos con tags y metricas |
| `orders` | Pedidos con ciclo de vida completo |
| `appointments` | Citas con tokens de confirmacion publica |
| `follow_up_rules` | Reglas de fidelizacion automatica |
| `ai_keys` | Multiples API keys por tenant |
| `ai_usage` | Tracking de tokens y costos por request |
| `tenant_modules` | Feature flags por negocio |
| `mcp_servers` | Servidores MCP configurados |
| `wa_auth_state` | Sesion WhatsApp persistida en DB |
| ... | Y mas |

### API REST

Todos los endpoints requieren JWT (`Authorization: Bearer <token>`) y estan scoped por tenant.

| Grupo | Endpoints principales |
|-------|----------------------|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Conversations** | `GET /api/conversations`, `GET /api/conversations/:id/messages` |
| **Products** | CRUD en `/api/products` |
| **Clients** | CRUD en `/api/clients` |
| **Orders** | CRUD + `PUT /api/orders/:id/status` |
| **Appointments** | CRUD + `GET /api/cita/:token` (publico) |
| **Settings** | `GET/PUT /api/settings`, CRUD `/api/settings/ai-keys`, `POST /api/settings/test-ai` |
| **AI Usage** | `GET /api/usage`, `GET /api/usage/detailed`, `GET /api/usage/by-provider` |
| **Modules** | `GET /api/modules`, `PUT /api/modules/:key` |

## Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/mi-feature`)
3. Haz commit de tus cambios (`git commit -m 'Agrega mi feature'`)
4. Push a la rama (`git push origin feature/mi-feature`)
5. Abre un Pull Request

### Reportar bugs

Abre un [issue](https://github.com/cebasic/sellmate/issues) describiendo el problema, pasos para reproducirlo y el comportamiento esperado.

## Licencia

Este proyecto esta bajo la licencia [MIT](LICENSE).

---

Hecho con IA - SellMate
