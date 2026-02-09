# 📅🗳️ Sistema de Reuniones & Agenda con Auditoría

¡Bienvenido! 👋  
Este proyecto implementa una **plataforma web integral** para el **registro, seguimiento y auditoría de reuniones**, con control por fases, evidencias digitales, asistencia de personas (incluyendo menores) y generación de QR únicos.

---

## 🚀 Objetivo del Sistema
🎯 Digitalizar y auditar reuniones de manera **trazable**, **ordenada** y **segura**, garantizando:

- 🧾 Registro estructurado de reuniones
- 📸 Evidencias digitales y físicas
- 👥 Control de asistentes (adultos y menores)
- 🔳 Generación de QR único por reunión
- 📊 Evaluación del impacto mediante fases

---

## 🧠 ¿Qué problema resuelve?
❌ Antes:
- Información dispersa
- Evidencias sin control
- Difícil auditoría

✅ Ahora:
- Flujo claro por **FASES**
- Evidencia centralizada
- Auditoría visual y verificable

---

## 🧩 Arquitectura General
🖥️ **Frontend (este repositorio)**
- React + Vite ⚡
- MUI (Material UI) 🎨
- Leaflet (mapas) 🗺️
- Dayjs (fechas) 📆

🌐 **Backend (futuro / mock actual)**
- APIs REST
- Catálogos (municipios, secciones, etc.)
- OCR INE/IFE

---

## 🔄 Flujo de una Reunión (FASES)

### 🧾 FASE 1 – Alta de Reunión
- Tipo (Asamblea / Evento)
- Fecha 📅
- Sede 🏢
- Organizador / Enlace 👤
- Distritos 🗳️
- Municipio + Sección (autocomplete)
- Dirección 🏠
- Ubicación GPS 📍 (mapa interactivo)
- 🔳 Generación automática de QR

---

### 📸 FASE 2 – Evidencia Inicial Digital
- Captura de redes sociales:
  - YouTube 🎬
  - Facebook 📘
- Estado **ANTES** de la reunión

---

### 👥 FASE 3 – Asistencias
#### 👨‍👩‍👧‍👦 Adultos
- Nombre
- Teléfono (opcional)

#### 🧒 Menores (>= 17)
- CURP (validada) 🆔
- Nombre y apellidos
- Edad (>=17) ✅
- Domicilio 🏠
- Teléfono 📞

---

### 📷 FASE 4 – Fotografía Grupal
- Captura o carga de foto grupal
- Evidencia física final

---

### 📸 FASE 5 – Evidencia Final Digital
- Captura de redes sociales:
  - YouTube 🎬
  - Facebook 📘
- Estado **DESPUÉS** de la reunión

---

### 🧪 FASE 6 – Comparación & Auditoría
- Comparación:
  - Inicial vs Final
- Validación visual 🔍
- Foto grupal 📷
- Cierre de reunión ✅

---

## 🪪 Módulo Futuro – Escaneo INE/IFE
🚧 **Placeholder listo**
- Subir frente y reverso 📸
- Simulación OCR (mock) 🧪
- Resultado JSON
- Preparado para conectar API real 🔌

---

## 🗺️ Mapa y Geolocalización
✨ Funcionalidades:
- Buscar dirección 🔎
- Click en mapa para mover pin 📍
- Arrastrar marcador 🧲
- Editar lat/lng manualmente ✍️

---

## ▶️ Cómo correr el proyecto

### 1️⃣ Requisitos
- Node.js >= 18 🟢
- npm o yarn 📦

### 2️⃣ Instalación
```bash
npm install
```

### 3️⃣ Ejecutar en desarrollo
```bash
npm run dev
```

🌐 Abre: http://localhost:5173

---

## 🛠️ Scripts disponibles
- `npm run dev` ⚡ Desarrollo
- `npm run build` 🏗️ Build producción
- `npm run preview` 👀 Preview build

---

## 🎨 Estilo & UX
- Totalmente **responsive** 📱💻
- Diseño institucional elegante
- Feedback visual por fases
- Validaciones claras ⚠️

---

## 🔮 Roadmap
- 🔌 Conexión APIs reales
- 📊 Dashboard de métricas
- 📄 Exportación PDF
- 🔐 Roles y permisos

---

## 🤝 Autor
👨‍💻 **Ricardo Orlando Castillo Olivera**  
💑 Hecho con dedicación, café ☕ y muchos emojis 😄

---

## 🧠 Nota Final
Este proyecto está diseñado para **crecer sin romperse**.  
Los mocks actuales permiten avanzar hoy y conectar APIs mañana sin rehacer la UI.

🚀 ¡Listo para producción cuando tú lo decidas!
