# 🧺 Dónde Comemos Hoy – Backend API para recomendaciones familiares 🍽️👶🌳

¡Hola! Bienvenido al backend de **Dónde Comemos Hoy**, una API pensada para ayudar a familias con hijos a encontrar restaurantes tranquilos, accesibles y adaptados para niños pequeños.

Este repositorio contiene una **API REST** construida con tecnologías modernas y pensada para integrarse fácilmente en aplicaciones web o móviles.

---

## 🚀 ¿Qué hace esta API?

Esta API permite:

- 📍 Buscar restaurantes según filtros familiares (zona amplia, parque cercano, tronas, cambiador, sin pantallas, menú infantil, etc.).
- 📝 Recibir sugerencias públicas de nuevos restaurantes.
- 🛡️ Gestionar sug3erencias desde un panel de administración (en desarrollo).
- 🔐 Proteger rutas con autenticación JWT.
- 📚 Documentar automáticamente la API con Swagger.

Además, su arquitectura es **reutilizable** como base para otros proyectos similares:

- Plataformas de catálogos geolocalizados
- Sistemas de sugerencias
- Dashboards administrativos, etc.

---

## 🛠️ Tecnologías principales

- **Node.js** + **Express**
- **Prisma ORM** + **PostgreSQL**
- **JWT** para autenticación
- **Swagger ** para documentación
- **Helmet** y **CORS** para seguridad
- **bcrypt** para cifrado de contraseñas
- **Winston** para logging profesional

---

## 📦 Instalación y puesta en marcha

### 1. Clonar el repositorio

git clone <URL-del-repo>
cd backend

### 2. Instalar dependencias

npm install

### 3. Configurar variables de entorno

Copia el archivo .env.example a .env y rellena con tus datos:

DATABASE_URL=postgresql://usuario:password@localhost:5432/tu_base_de_datos
JWT_SECRET=tu_clave_secreta_para_jwt
PORT=3000

### 4. Aplicar migraciones de Prisma

npx prisma migrate dev --name init
Esto generará las tablas necesarias en la base de datos.

### 5. Levantar el servidor en modo desarrollo

npm run dev
Accede a la API en:
http://localhost:3000

### 📄Documentación Swagger

Puedes explorar y probar todos los endpoints desde:
🔗 http://localhost:3000/api/docs

### 🔐 Autenticación para rutas protegidas

Realiza un login con:
pgsql
POST /api/admin/login
Content-Type: application/json

{
"email": "admin@example.com",
"password": "tu_contraseña"
}
Copia el token JWT recibido.

En Postman (o similar), ve a la pestaña “Authorization”, elige “Bearer Token” e introduce el token.

Ya puedes acceder a rutas protegidas (POST, PUT, DELETE, etc.).

### 📬 Ejemplos de endpoints

Obtener todos los restaurantes (público)
GET /api/restaurantes

Crear un restaurante (admin)

POST /api/restaurantes
Headers:
Authorization: Bearer <tu-token>
Content-Type: application/json
Body ejemplo:

{
"nombre": "Restaurante Ejemplo",
"direccion": "Calle Falsa 123",
"descripcion": "Un lugar genial",
"zonaAmplia": true,
"parqueCercano": false,
"tronaDisponible": true,
"activo": true,
"verificado": false
}
Actualizar restaurante (admin)

PUT /api/restaurantes/{id}

Eliminar restaurante (admin)

DELETE /api/restaurantes/{id}

### 💡 ¿Por qué usar este backend?

Este backend no es solo funcional, también demuestra buenas prácticas de desarrollo profesional:

Arquitectura limpia y modular.

Seguridad desde el diseño.

Preparado para escalar y adaptarse a nuevas apps.

Documentado y fácil de mantener.

### 🔁 Puedes reutilizarlo como base para:

Apps para gestión de locales/sugerencias.

Plataformas de recomendaciones moderadas.

Dashboards administrativos.

Cualquier sistema con Node.js + JWT + Prisma.

⭐ ¿Te ha sido útil?

Si te ha parecido útil este proyecto, dale una estrella ⭐ al repo.
También puedes clonarlo, adaptarlo a tus ideas y mencionarme si te sirvió de ayuda.
¡Gracias por visitar Dónde Comemos Hoy! 🙌

---

📘 Licencia

MIT © 2025 [**Manu Saquero**](https://www.linkedin.com/in/manuel-mart%C3%ADnez-saquero-a0a90011b/)

---

📬 Contacto

💼 Proyecto creado por [Manu Saquero](https://www.linkedin.com/in/manuel-mart%C3%ADnez-saquero-a0a90011b/)

🧠 DevOps + Backend Developer | Apasionado por crear productos útiles

📩 ¿Quieres colaborar o contratarme? ¡Estoy abierto a nuevas oportunidades profesionales y colaboraciones con impacto!

---
