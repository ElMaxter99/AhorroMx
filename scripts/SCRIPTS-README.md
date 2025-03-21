# Scripts de Inicialización de la Base de Datos

Este directorio contiene scripts para inicializar y administrar la base de datos de la aplicación.

## **Scripts Disponibles**

### **Seed MongoDB (`seed.js`)
Este script inicializa la base de datos con datos de prueba, creando usuarios, grupos y categorías.

#### **Uso**
```sh
node scripts/seed.js [opciones]
```

#### **Opciones**
- `--no-clean`: Evita borrar la base de datos antes de la inserción de datos.
- `--log-only`: Muestra el changelog sin modificar la base de datos.
- `--users-only`: Solo crea los usuarios, sin afectar grupos ni categorías.
- `--groups-only`: Solo crea los grupos, sin afectar usuarios ni categorías.
- `--categories-only`: Solo crea las categorías, sin afectar usuarios ni grupos.

#### **Ejemplos**

- Ejecutar el script normalmente:
  ```sh
  node scripts/seed.js
  ```

- Ejecutar sin limpiar la base de datos:
  ```sh
  node scripts/seed.js --no-clean
  ```

- Mostrar solo el changelog:
  ```sh
  node scripts/seed.js --log-only
  ```

- Solo insertar usuarios:
  ```sh
  node scripts/seed.js --users-only
  ```

- Solo insertar grupos:
  ```sh
  node scripts/seed.js --groups-only
  ```

- Solo insertar categorías:
  ```sh
  node scripts/seed.js --categories-only
  ```

---

Este `README.md` se actualizará conforme se añadan nuevos scripts o funcionalidades.

