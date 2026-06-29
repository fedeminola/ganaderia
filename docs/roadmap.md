# Roadmap

## Fase 1: MVP - Lógica de Negocio y CRUDs Fundamentales

Esta fase se centra en construir las APIs y la lógica de negocio principales para que el sistema sea funcional.

- **[ ] 1. Backend: CRUD de Ubicaciones (Locations)**
    - [ ] Crear API endpoints (`/api/v1/locations/`) para ABM de potreros, corrales, etc.
    - [ ] Implementar lógica en el modelo para calcular `calculated_area_hectares` automáticamente si se provee un `polygon`.
    - [ ] Añadir validaciones y permisos por `farm`.

- **[ ] 2. Backend: CRUD de Animales (Animals)**
    - [ ] Crear API endpoints (`/api/v1/animals/`) para ABM de animales.
    - [ ] Implementar la lógica para el manejo de `status` (activo, vendido, muerto, etc.).
    - [ ] Asegurar que el `rfid` sea único por `farm`.
    - [ ] Crear el sistema de `AnimalEvent` para registrar un historial de cambios.

- **[ ] 3. Backend: Lógica de Negocio de Lotes (Lots)**
    - [ ] Crear API endpoints (`/api/v1/lots/`) para crear y gestionar lotes.
    - [ ] Implementar endpoints para añadir y quitar animales de un lote (`/api/v1/lots/<id>/add_animals/`).
    - [ ] Registrar cada membresía de lote en el historial del animal.

- **[ ] 4. Backend: Lógica de Negocio de Movimientos (Movements)**
    - [ ] Crear un endpoint (`/api/v1/movements/`) que reciba un origen, un destino y una lista de animales.
    - [ ] Implementar la lógica para actualizar la `current_location` de cada animal.
    - [ ] Registrar un evento de `movement` para cada animal movido.

- **[ ] 5. Backend: CRUD de Sanidad (Health)**
    - [ ] Crear API endpoints para gestionar `Vaccine`, `Treatment` y `HealthProtocol`.
    - [ ] Implementar un endpoint para aplicar un tratamiento a un animal o a un lote (`/api/v1/health/apply-treatment/`).
    - [ ] Registrar eventos de `vaccination` y `treatment`.

- **[ ] 6. Backend: CRUD de Finanzas (Finance)**
    - [ ] Diseñar y crear modelos iniciales para `Transaction` (ingresos/egresos) asociados a animales, lotes o a la `farm`.
    - [ ] Crear API endpoints básicos para registrar y listar transacciones.

- **[ ] 7. Frontend: Vistas de Gestión**
    - [ ] Crear las vistas en React para realizar el CRUD de cada una de las entidades (Locations, Animals, Lots).
    - [ ] Desarrollar formularios con `React Hook Form` y `Zod` para validaciones.

## Fase 2: Integración RFID y Flujos Operativos

Con los CRUDs listos, esta fase se enfoca en la experiencia de campo.

- **[ ] 1. Frontend: Refinar Hook `useRfidReader`**
    - [ ] Mejorar la estabilidad de la conexión Bluetooth.
    - [ ] Añadir feedback visual claro para el usuario (conectado, escaneando, error, etc.).
    - [ ] Implementar la cola local de `scannedTags` para resiliencia a la conectividad.

- **[ ] 2. Backend: Procesamiento Asíncrono de RFID**
    - [ ] Implementar el endpoint `/api/v1/rfid/sync/` que acepte diferentes acciones (`count`, `movement`, `apply_treatment`).
    - [ ] Crear las tareas de Celery (`process_rfid_sync`) que procesen los datos en segundo plano.
    - [ ] Implementar la lógica para cada acción (ej: para `count`, comparar con el stock actual y generar `MissingAlerts`).

- **[ ] 3. Frontend: UI de Operaciones RFID**
    - [ ] Diseñar una sección "Operación RFID" mobile-first con botones grandes y flujos simples.
    - [ ] Implementar el flujo de "Conteo en Potrero": conectar lector, escanear y sincronizar.
    - [ ] Implementar el flujo de "Mover Lote": seleccionar animales (vía RFID), elegir destino y sincronizar.
    - [ ] Implementar el flujo de "Tratamiento Sanitario": seleccionar animales (vía RFID), elegir tratamiento y sincronizar.

## Fase 3: Dashboard, Reportes y Funciones Avanzadas

- **[ ] 1. Dashboard**
    - [ ] Implementar los widgets del dashboard definidos en el `project_scope`.
    - [ ] Conectar los widgets a la API para mostrar datos en tiempo real.

- **[ ] 2. Funciones Avanzadas**
    - [ ] Integración con balanzas para registro de peso (`weighing`).
    - [ ] Inicio de desarrollo de PWA para funcionalidades offline.
    - [ ] Sistema de notificaciones para alertas importantes.

- **[ ] 3. Reportes**
    - [ ] Permitir la exportación de datos clave a formatos como CSV o PDF.