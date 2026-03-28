# NexusApp 🏢

> Sistema de gestión de espacios de coworking en producción — administra clientes, espacios y reservas desde una sola plataforma.

![En Producción](https://img.shields.io/badge/Estado-En%20Producción-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

🌐 **Demo en vivo:** [nexus-app-ashen.vercel.app](https://nexus-app-ashen.vercel.app)

---

## 🚀 Sobre el proyecto

NexusApp es una aplicación web full-stack desarrollada para y utilizada activamente por una **empresa de coworking real** en su operativa diaria. No es un proyecto de práctica — está en producción, gestionando clientes y espacios de trabajo reales.

---

## ✨ Características

- 🔐 **Autenticación segura** con JWT (login / registro / rutas protegidas)
- 🏠 **Gestión de espacios** — crear, editar, eliminar y visualizar espacios disponibles
- 👥 **Gestión de clientes** — registro y administración completa de clientes
- 📋 **CRUD completo** en espacios y clientes
- 📱 **Interfaz responsive** adaptada a distintos dispositivos
- ☁️ **Frontend en Vercel** + **Backend en Render** con integración continua

---

## 🛠 Tech Stack

| Capa | Tecnología |
|---|---|
| Frontend | React · CSS |
| Backend | Node.js · Express |
| Base de datos | MongoDB |
| Autenticación | JWT |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

---

## 🏗 Arquitectura

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│                 │  HTTP  │                 │Mongoose │                 │
│  React (Vercel) │◄──────►│ Node.js (Render)│◄───────►│  MongoDB Atlas  │
│                 │  JWT   │                 │         │                 │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

---

## 🚀 Instalación local

### Prerequisitos
- Node.js >= 18
- MongoDB (local o Atlas)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/jantons25/NexusApp.git
cd NexusApp

# 2. Instalar dependencias del backend
npm install

# 3. Instalar dependencias del frontend
cd client
npm install
cd ..

# 4. Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales
```

### Variables de entorno

```env
MONGO_URI=tu_conexion_de_mongodb
JWT_SECRET=tu_clave_secreta
PORT=4000
```

### Ejecutar en desarrollo

```bash
# Backend (desde la raíz)
npm run dev

# Frontend (desde /client)
cd client
npm run dev
```

---

## 📁 Estructura del proyecto

```
NexusApp/
├── client/          # Frontend React
│   ├── src/
│   └── ...
├── src/             # Backend Node.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── ...
├── .env.example
└── package.json
```

---

## 👤 Autor

**Juan José Antón Silva**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/juanantonsilva)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/jantons25)

---

## 📄 Licencia

Este proyecto es de uso privado y comercial. Desarrollado a medida para cliente.
