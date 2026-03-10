
# 🧭 Sistema de Control de Reuniones y Evidencias
### 📊 Dashboard · 📅 Calendario · 📸 Evidencias · 👥 Asistencias · 🔳 QR

---

## 🚀 Descripción del Proyecto

Este proyecto es una **plataforma web para la gestión y seguimiento de reuniones**, diseñada para registrar agendas, evidencias digitales, asistencia de personas y análisis de impacto.

El sistema permite controlar **todo el flujo de una reunión** desde su creación hasta su cierre final mediante **6 fases operativas**.

El objetivo principal es tener **trazabilidad completa de cada reunión** para auditoría, control territorial y análisis estratégico.

---

# 🧠 Arquitectura General

El sistema está construido con una arquitectura moderna basada en:

| Capa | Tecnología |
|-----|------------|
| Frontend | React + TypeScript |
| UI | Material UI |
| Routing | React Router |
| Estado | Hooks / Services |
| API | REST |
| Backend | API externa |
| Diseño | Responsive UI |
| Iconografía | Material Icons |

---

# 📁 Estructura del Proyecto

src/
│
├── components/
│   ├── calendar/
│   ├── meetings/
│   └── ui/
│
├── models/
│
├── pages/
│   ├── dashboard/
│   └── meetings/
│
├── services/
│
├── utils/
│
└── layouts/

---

# 🏠 Dashboard

El **Dashboard** muestra un resumen global del sistema.

## 📊 KPIs Principales

| KPI | Descripción |
|----|-------------|
| 📋 Total de reuniones | Todas las agendas registradas |
| 🧭 En proceso | Reuniones que aún no terminan |
| ✅ Completadas | Reuniones finalizadas |
| 🚫 Canceladas | Reuniones canceladas |

---

## 📊 Ejemplo visual

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ En proceso   │ Completadas  │ Canceladas   │
│      5       │      3       │      0       │      2       │
└──────────────┴──────────────┴──────────────┴──────────────┘

---

# 📅 Calendario de Reuniones

El dashboard incluye un calendario que permite visualizar:

- reuniones por fecha
- actividad territorial
- seguimiento de agenda

Cuando el usuario selecciona una fecha se muestran las **reuniones registradas ese día**.

---

# 📌 Próximas Reuniones

El sistema muestra las **20 reuniones más cercanas** ordenadas por fecha.

Las reuniones se muestran **paginadas de 5 en 5**.

Esto permite identificar rápidamente:

- eventos próximos
- reuniones del día
- actividad territorial

---

# 🧾 Flujo de Reuniones

Cada reunión sigue un flujo de **6 fases**.

---

## 🧾 Fase 1 · Alta de reunión

Se registra:

- Tipo de reunión
- Fecha
- Ubicación
- Sección
- Organizador
- Enlace

---

## 📸 Fase 2 · Evidencias iniciales

Se suben capturas de:

- Facebook
- Youtube
- Whatsapp

Estas evidencias muestran **difusión previa del evento**.

---

## 👥 Fase 3 · Registro de asistentes

Se registran:

- adultos
- menores

Esto permite medir el **impacto real de la reunión**.

---

## 📷 Fase 4 · Foto grupal

Se registra evidencia fotográfica del evento.

Sirve para validar que **la reunión se llevó a cabo**.

---

## 📸 Fase 5 · Evidencias finales

Se registran capturas posteriores al evento:

- Facebook
- Youtube
- Whatsapp

Esto permite medir **difusión final**.

---

## 📊 Fase 6 · Comparación y cierre

Se comparan:

- evidencias iniciales
- evidencias finales
- asistencia registrada

Después se marca la reunión como **finalizada**.

---

# 🚫 Cancelación de Agenda

El sistema permite cancelar una reunión.

Esto ocurre cuando:

- la reunión no se realizó
- el evento fue suspendido
- hubo problemas logísticos

La reunión pasa al estado:

Cancelada 🚫

---

# 📸 Evidencias

Las evidencias almacenadas pueden ser:

| Tipo | Plataforma |
|----|----|
| Inicial | Facebook |
| Inicial | Youtube |
| Inicial | Whatsapp |
| Final | Facebook |
| Final | Youtube |
| Final | Whatsapp |
| Foto grupal | Física |

Las imágenes se consultan mediante:

/api/getImage?url=...

---

# 🔳 QR de reuniones

Cada reunión genera un **QR único**.

Este QR puede ser utilizado para:

- control de asistencia
- verificación del evento
- acceso rápido a la reunión

---

# 📊 Métricas del sistema

Cada reunión tiene métricas calculadas:

adultos  
menores  
total asistentes  
evidencias registradas  
fecha de última actualización  

---

# 🧩 Servicios principales

Los servicios se encuentran en:

src/services

Principales funciones:

| Servicio | Función |
|-------|--------|
listMeetings | listar reuniones |
getMeeting | obtener reunión |
createMeeting | crear reunión |
updateMeeting | editar reunión |
cancelMeeting | cancelar agenda |

---

# 🎨 UI / Componentes

Componentes importantes:

| Componente | Uso |
|---------|------|
PageHeader | encabezado |
StatCard | KPIs |
MeetingCard | tarjeta de reunión |
MeetingStepper | fases |
ConfirmDialog | modales |
EmptyState | estados vacíos |

---

# 📱 Responsive Design

El sistema es completamente responsive.

### 🖥 Desktop
4 tarjetas en una fila

### 💻 Tablet
2 tarjetas por fila

### 📱 Mobile
1 tarjeta por fila

Esto permite utilizar el sistema desde:

- computadoras
- tablets
- celulares

---

# 🔐 Seguridad

El sistema utiliza autenticación basada en **JWT**.

La sesión incluye:

token  
usuario  
fecha de expiración  

Al cerrar sesión:

localStorage.clear()

---

# 🚀 Instalación

npm install  
npm run dev

---

# 🧑‍💻 Desarrollo

Modo desarrollo

npm run dev

Build producción

npm run build

---

# 🌎 Objetivo del sistema

✔ registrar reuniones  
✔ validar evidencias  
✔ medir impacto territorial  
✔ tener trazabilidad de eventos  

---

# ✨ Sistema de gestión territorial
