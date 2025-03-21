# Splitflow
Enfocado en la gestión de finanzas personales y ahorro.

> Splitflow es una API RESTful construida con Node.js, Express.js y MongoDB, diseñada para ProyectoDAW.

## Características principales
TODO
* Lista de las funcionalidades más importantes de tu API.
* Por ejemplo: Autenticación de usuarios con JWT.
* Gestión de [entidad 1], [entidad 2], etc.
* Validación de datos de entrada.
* Manejo de errores centralizado.

### Descripción detallada de directorios

```plaintext
splitflow/
│── config/
│── src/
│   ├── config/            # Configuraciones (DB, variables de entorno)
│   ├── controllers/       # Solo maneja requests y responses
│   ├── bll/               # Capa de lógica de negocio (antes en controllers)
│   ├── models/            # Modelos de Mongoose
│   ├── routes/            # Rutas Express separadas por entidad
│   ├── middlewares/       # Middlewares para autenticación, validación, etc.
│   ├── services/          # Lógica independiente de Express (envíos de correo, cálculos, etc.)
│   ├── utils/             # Funciones auxiliares
│   ├── app.js             # Configuración de Express
│── .env                   # Variables de entorno
│── server.js              # Punto de entrada
│── package.json           # Dependencias y scripts
```

* **`src/`**: Contiene el código fuente principal de la aplicación.
    * **`config/`**: Archivos de configuración para la base de datos, variables de entorno, JWT, etc.
    * **`controllers/`**: Lógica de negocio para cada entidad (usuarios, roles, etc.).
    * **`models/`**: Definiciones de los modelos de datos utilizando Mongoose.
    * **`routes/`**: Definición de las rutas de la API utilizando Express.js.
    * **`middlewares/`**: Funciones middleware para autenticación, autorización, validación y otras tareas.
    * **`services/`**: Lógica de negocio independiente del framework Express.js (envío de emails, acceso a Storage, etc.).
    * **`utils/`**: Funciones auxiliares y utilidades reutilizables.
    * **`app.js`**: Configuración principal de la aplicación Express.js.
* **`.env`**: Archivo para almacenar variables de entorno sensibles.
* **`server.js`**: Punto de entrada de la aplicación.
* **`package.json`**: Archivo que contiene las dependencias del proyecto y los scripts de npm.

## Requisitos previos

* Node.js 22
* npm (o yarn)
* MongoDB
* Servidor SMTP (configurado en `.env`)
* Opcional: Cuenta de Cloud Storage (S3, Firebase, etc.)

## Instalación

1.  Clona el repositorio:

    ```bash
    git clone [tu-repositorio-git]
    ```

2.  Instala las dependencias:

    ```bash
    npm install
    ```

3.  Configura las variables de entorno:
    * Copia el archivo `.env.example` (si lo tienes) o crea un archivo `.env` en la raíz del proyecto.
    * Actualiza las variables con tus valores:

    ```
    PORT=5000
    MONGO_URI=mongodb://192.168.1.100:27017/splitflow
    JWT_SECRET=supersecretkey
    JWT_EXPIRATION=7d
    SALT_ROUNDS=10

    SEED_SCRIPT_ADMIN_EMAIL=admin@example.com
    SEED_SCRIPT_ADMIN_USERNAME=adminSplitFlow
    SEED_SCRIPT_ADMIN_PASSWORD=1mi2Pass3!4
    SEED_SCRIPT_USER_EMAIL=user@example.com
    SEED_SCRIPT_USER_USERNAME=userSplitFlow
    SEED_SCRIPT_USER_PASSWORD=pokeM0n!4321
    SEED_SCRIPT_USERADMIN_EMAIL=useradmin@example.com
    SEED_SCRIPT_USERADMIN_USERNAME=useradminSplitFlow
    SEED_SCRIPT_USERADMIN_PASSWORD=wa11Y.87943!

    EMAIL_HOST=smtp.tudominio.com
    EMAIL_PORT=587
    EMAIL_USER=tuemail@tudominio.com
    EMAIL_PASS=tucontraseña

    FRONTEND_URL=[https://tudominio.com](https://tudominio.com)

    STORAGE_BUCKET=tu-bucket
    STORAGE_REGION=us-east-1
    STORAGE_ACCESS_KEY=tu-access-key
    STORAGE_SECRET_KEY=tu-secret-key
    ```

4.  Ejecuta el script de seed (para inicializar la bda de "serie"):

    ```bash
    npm run seed
    ```

5.  Inicia el servidor:

    ```bash
    npm start
    ```

## Endpoints de la API
TODO
* `/users`: Gestión de usuarios (GET, POST, PUT, DELETE).
* `/roles`: Gestión de roles (GET, POST, PUT, DELETE).
* `/auth/login`: Autenticación de usuarios.
* `/auth/register`: Registro de usuarios.
* `/auth/me`: Obtiene la información del usuario autenticado.
* Otros endpoints específicos de tus flujos de trabajo.

## Contribución

Si deseas contribuir a este proyecto, por favor sigue estas pautas:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama con tu funcionalidad o corrección de errores.
3.  Realiza tus cambios y haz commit con mensajes descriptivos.
4.  Envía un pull request a la rama `main`.

## Licencia

[Tipo de licencia]

## Contacto

* [Tu nombre/organización]
* [Tu correo electrónico]
* [Tu GitHub]
