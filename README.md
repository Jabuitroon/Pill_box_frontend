# 💊 PillBox - Gestión de Medicamentos y Recordatorios por WhatsApp

[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs)](https://nestjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169e1?logo=postgresql)](https://www.postgresql.org)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-4-ec4899?logo=zustand)](https://zustand-demo.pmnd.rs/)
[![WhatsApp Cloud API](https://img.shields.io/badge/WhatsApp-Cloud%20API-25d366?logo=whatsapp)](https://developers.facebook.com/docs/whatsapp)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com)

## 📖 Descripción
PillBox es una aplicación web compacta desarrollada como **trabajo freelance** para la gestión de medicamentos en pacientes con hipertensión. Permite a un administrador/fisioterapeuta registrar pacientes, asociar medicamentos (pills) y recetas (prescriptions) con horarios de toma, y automatiza el envío de **recordatorios personalizados por WhatsApp** en el momento exacto en que el paciente debe tomar su medicación.

El proyecto se dividió en dos repositorios (backend y frontend) y se desplegó en un entorno de producción real utilizando **Vercel** (frontend) y **Supabase** (base de datos PostgreSQL alojada), integrando además la **API de mensajería de Meta (WhatsApp Cloud API)** para el envío de plantillas de mensajes.

Desarrollé tanto la API REST como la interfaz de usuario, enfocándome en la robustez del modelo de datos (relaciones paciente–fisioterapeuta, receta–recordatorio), la seguridad mediante autenticación JWT y control de roles, y la automatización de tareas programadas (cron jobs) para el disparo de recordatorios.

## ✨ Características Principales
- 👥 **Gestión de Pacientes**: Registro y administración de pacientes, con relación jerárquica paciente–fisioterapeuta.
- 💊 **Catálogo de Medicamentos (Pills)**: CRUD de medicamentos disponibles para prescribir.
- 📋 **Recetas (Prescriptions)**: Asignación de medicamentos a pacientes con horario (mañana/tarde/noche), frecuencia diaria y múltiples horas de toma.
- ⏰ **Recordatorios Automáticos**: Cron job que revisa cada minuto (zona horaria `America/Bogota`) los recordatorios pendientes y dispara el envío por WhatsApp.
- 📲 **Integración WhatsApp Cloud API**: Envío de mensajes por plantilla (template) con parámetros dinámicos (nombre del paciente, medicamento, hora) vía Meta Graph API.
- 🔐 **Autenticación y Roles**: JWT + Guards con roles `ADMIN`, `PHYSIOTHERAPIST` y `PATIENT`, registro de administradores protegido con clave secreta.
- 📑 **Documentación de API**: Swagger/OpenAPI con autenticación Bearer persistente para probar los endpoints.
- 🖥️ **Dashboard Web**: Panel para gestionar pacientes, medicamentos, recetas y recordatorios, con rutas protegidas por JWT.
- ✅ **Validación de Datos**: DTOs con `class-validator`/`class-transformer` en el backend y Zod para variables de entorno.

## 🛠️ Tecnologías y Stack

### Backend
| Categoría | Tecnologías |
|-----------|-------------|
| **Framework** | NestJS 11 |
| **Lenguaje** | TypeScript |
| **Base de Datos** | PostgreSQL (alojada en Supabase) |
| **ORM** | Prisma 7 (`@prisma/adapter-pg`) |
| **Autenticación** | JWT (`@nestjs/jwt`, `passport-jwt`), bcrypt para hashing |
| **Validación** | class-validator, class-transformer, Zod (env vars) |
| **Tareas Programadas** | `@nestjs/schedule` (Cron) |
| **Mensajería** | WhatsApp Cloud API (Meta Graph API) vía `@nestjs/axios` |
| **Documentación** | Swagger / OpenAPI (`@nestjs/swagger`) |
| **Calidad** | ESLint, Prettier |
| **Testing** | Jest (unit + e2e), Supertest |

### Frontend
| Categoría | Tecnologías |
|-----------|-------------|
| **Framework** | React 18 + Vite |
| **Enrutamiento** | React Router DOM 6 |
| **Estado** | Zustand (con persistencia de sesión JWT en `localStorage`) |
| **Estilos** | Tailwind CSS 3 |
| **Iconos** | Lucide React |
| **API** | Cliente HTTP centralizado propio (`ApiClient`) con inyección automática de Bearer token y logout automático en 401 |

## 📁 Estructura del Proyecto

### Backend (`pill_box`)
```
pillbox-backend/
├── src/
│   ├── auth/             # Login, registro, guards (JWT), roles y decoradores
│   ├── users/             # CRUD de usuarios (pacientes/fisios/admins)
│   ├── pills/              # CRUD de medicamentos
│   ├── prescriptions/      # Recetas: medicamento + paciente + horario
│   ├── reminder/            # Lógica de recordatorios (creación, envío, estado)
│   ├── whatsapp/            # Servicio de integración con WhatsApp Cloud API
│   ├── cron/                 # Endpoint/trigger del job de recordatorios
│   ├── prisma/                # Servicio y módulo de conexión a Prisma
│   ├── common/                  # Decoradores e interfaces compartidas (@Public, roles, etc.)
│   ├── config/                    # Validación de variables de entorno (Zod)
│   └── generated/prisma/            # Cliente Prisma autogenerado
├── prisma/
│   ├── schema.prisma      # Modelos: User, Pill, Prescription, Reminder, PrescriptionTime
│   └── migrations/         # Migraciones SQL versionadas
├── test/                      # Pruebas e2e
└── nest-cli.json
```

### Frontend (`pillbox-frontend`)
```
pillbox-frontend/
├── src/
│   ├── api/            # Cliente HTTP centralizado (client.js) con auth Bearer
│   ├── components/      # Navbar, Modal, Toast, PillCapsule, ProtectedRoute
│   ├── pages/             # Login, Dashboard, Patients, PatientDetail, Pills, Prescriptions, Reminders
│   ├── store/               # authStore.js (Zustand + persist)
│   ├── App.jsx                 # Definición de rutas (públicas y protegidas)
│   └── main.jsx
├── index.html
├── tailwind.config.js
└── vite.config.js
```

## 🗄️ Modelo de Datos
El esquema (Prisma sobre PostgreSQL) gira en torno a 5 entidades principales:
- **User**: pacientes, fisioterapeutas y administradores (rol vía enum `UserRole`), con relación autorreferenciada `physiotherapist ↔ patients`.
- **Pill**: catálogo de medicamentos.
- **Prescription**: receta que vincula un `Pill` a un `User` (paciente), con horario (`TimeOfDay`), frecuencia diaria y lista de horas (`PrescriptionTime`).
- **Reminder**: recordatorio puntual asociado a una receta, con hora programada y estado de envío (`sent`, `sentAt`).
- **PrescriptionTime**: horas específicas de toma dentro de una receta (soporta múltiples tomas al día).

## 🚀 Instalación y Uso

### Requisitos
- Node.js 20+
- pnpm (package manager usado en ambos repos)
- Cuenta de Supabase (o instancia PostgreSQL propia)
- Cuenta de Meta for Developers con acceso a WhatsApp Cloud API

### 1. Backend

```bash
cd pillbox-backend
pnpm install
```

Configura las variables de entorno (`.env`):
```
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=postgresql://usuario:password@host:5432/db   # Supabase connection string
JWT_SECRET=tu-secret
JWT_EXPIRES_IN=1d
ADMIN_REGISTRATION_KEY=clave-secreta-registro-admin
WHATSAPP_TOKEN=token-de-meta-graph-api
WHATSAPP_PHONE_ID=id-del-numero-de-whatsapp
```

Ejecuta las migraciones y levanta el servidor:
```bash
pnpm prisma generate
pnpm prisma migrate deploy
pnpm start:dev
```

Documentación interactiva de la API (Swagger): `http://localhost:3000/api`

### 2. Frontend

```bash
cd pillbox-frontend
pnpm install
```

Configura `.env`:
```
VITE_API_URL=http://localhost:3000
```

Ejecuta en desarrollo:
```bash
pnpm dev
```
Abre [http://localhost:5173](http://localhost:5173)

### 3. Build y Producción
```bash
# Backend
pnpm build
pnpm start:prod

# Frontend
pnpm build
pnpm preview
```

## ☁️ Despliegue
- **Frontend**: desplegado en **Vercel**, con build automático desde el repositorio.
- **Base de datos**: alojada en **Supabase** (PostgreSQL gestionado), conectada al backend vía `DATABASE_URL`.
- **Recordatorios**: el cron job del backend corre cada minuto verificando la hora actual (zona horaria Colombia) contra los recordatorios pendientes en base de datos.
- **Mensajería**: los recordatorios se envían mediante plantillas de **WhatsApp Cloud API** (Meta Graph API `v20.0`), autenticadas con un token de acceso y un `phone_number_id` propios de la cuenta de WhatsApp Business.

## 📚 Aprendizajes Clave
- Comprensión de un **entorno de producción real** end-to-end: despliegue de frontend en Vercel y base de datos gestionada en Supabase.
- Integración con **APIs externas de terceros** (Meta/WhatsApp Cloud API) para mensajería personalizada mediante plantillas con parámetros dinámicos.
- Diseño de un modelo de datos relacional para un dominio de salud (paciente–receta–recordatorio) con Prisma ORM sobre PostgreSQL.
- Implementación de autenticación JWT con control de roles y protección de rutas tanto en backend (Guards) como en frontend (`ProtectedRoute`).
- Automatización de tareas programadas (cron) para disparar acciones externas (envío de mensajes) según el estado de la base de datos.

## ✅ Buenas Prácticas Aplicadas
- **Arquitectura Modular**: separación por dominio en NestJS (auth, users, pills, prescriptions, reminder, whatsapp, cron).
- **Type Safety**: TypeScript en backend, DTOs validados con `class-validator`, validación de variables de entorno con Zod.
- **Seguridad**: contraseñas hasheadas con bcrypt, JWT con expiración configurable, CORS restringido por origen permitido, registro de administradores protegido con clave secreta.
- **Cliente HTTP Centralizado**: manejo uniforme de headers, inyección de token y logout automático ante `401` en el frontend.
- **Documentación de API**: Swagger configurado con autenticación persistente para facilitar pruebas manuales.
