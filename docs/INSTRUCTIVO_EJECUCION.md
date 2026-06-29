# INSTRUCTIVO DE EJECUCIÓN - GANADERA RFID

Este documento detalla los pasos necesarios para desplegar y operar el MVP del sistema **GANADERA RFID** en un entorno enterprise.

## 1. Requisitos Previos

*   **Docker** y **docker-compose** instalados.
*   Dispositivo móvil con soporte para **Web Bluetooth API** (Chrome en Android, Bluefy en iOS).
*   Lector RFID Bluetooth compatible (ej: Allflex, Tru-Test, o emulador genérico).

## 2. Despliegue del Sistema

### Entorno de Desarrollo
Para iniciar el sistema en modo desarrollo con recarga automática:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Entorno de Producción
Para un despliegue optimizado:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Inicialización de Base de Datos
Una vez que los contenedores estén corriendo, ejecuta las migraciones y crea un superusuario:

```bash
# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear administrador
docker-compose exec backend python manage.py createsuperuser

# Cargar datos base (Especies y Categorías por defecto)
docker-compose exec backend python manage.py loaddata initial_data.json
```

## 3. Configuración Inicial

1.  Accede a `http://localhost:3000` (o la IP del servidor).
2.  Inicia sesión con las credenciales de administrador.
3.  Crea una **Finca (Farm)**.
4.  Configura las **Ubicaciones (Locations)** dibujando los polígonos en el mapa para el cálculo automático de hectáreas.
5.  Define las **Especies** y **Categorías** si las por defecto no son suficientes.

## 4. Operación RFID en Campo

1.  Asegúrate de que el Bluetooth esté activo en tu dispositivo móvil.
2.  Navega a la sección **Operaciones RFID**.
3.  Haz clic en **Conectar Lector** y selecciona tu dispositivo.
4.  Comienza a escanear los animales. Los tags aparecerán en tiempo real en la pantalla.
5.  Selecciona la acción (**Conteo** o **Movimiento**) y la ubicación correspondiente.
6.  Presiona **Sincronizar**.

### Modo Offline
Si pierdes la conexión a internet en el campo:
*   El sistema guardará automáticamente las lecturas en una cola local.
*   Recibirás una notificación de "Sin conexión".
*   Los datos se sincronizarán con el servidor una vez que recuperes el acceso y vuelvas a intentar la sincronización.

## 6. Solución de Problemas (Troubleshooting)

### Web Bluetooth API no disponible
La API de Bluetooth requiere un **contexto seguro** (HTTPS o localhost). Si accedes desde una IP externa por HTTP:
1.  En **Chrome (Android/Desktop)**: 
    *   Ve a `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
    *   Añade la URL/IP de tu servidor (ej: `http://192.168.1.50:3000`).
    *   Cambia a "Enabled" y reinicia el navegador.
2.  En **iOS**: Usa el navegador **Bluefy** que soporta Web Bluetooth nativamente sobre HTTP.

## 7. Tareas de Segundo Plano

El sistema utiliza **Celery** para procesar las lecturas RFID de forma asíncrona. Esto permite:
*   Registro de animales nuevos encontrados.
*   Generación masiva de eventos de movimiento.
*   Detección de animales faltantes (Missing) en conteos de inventario.

Puedes monitorear estas tareas en los logs del contenedor `worker`:
```bash
docker-compose logs -f worker
```
