# GANADERA RFID - MVP ENTERPRISE

## Prompt Maestro para Agente de Coding

Quiero que actúes como un Staff Software Engineer especializado en productos SaaS agropecuarios enterprise.

Tu tarea es diseñar y generar un MVP funcional, escalable y mantenible para un sistema de gestión ganadera con RFID, geolocalización y control de stock animal.

La prioridad es:

1. Simplicidad operativa para usuarios rurales con bajo conocimiento técnico.
2. Excelente UX mobile-first.
3. Arquitectura limpia y escalable.
4. RFID como núcleo operativo.
5. MVP usable rápidamente.

---

# CONTEXTO DEL NEGOCIO

El sistema será utilizado en establecimientos ganaderos de cría y recría bovina.

Problemas principales:

* Falta de control individual animal.
* Pérdidas/robos de animales.
* Mala trazabilidad.
* Gestión manual.
* Necesidad de controlar movimientos y stock por parcela/potrero.

El sistema debe funcionar principalmente:

* desde celular
* tablet
* y eventualmente escritorio.

Usuarios rurales con baja experiencia informática.

RFID debe simplificar procesos.

---

# OBJETIVO DEL MVP

Construir una plataforma web responsive que permita:

* Gestión multi-establecimiento.
* Gestión de animales individual y por lote.
* Integración RFID TrueTest vía Bluetooth.
* Gestión geográfica de potreros/parcialidades.
* Control de stock animal.
* Detección de faltantes.
* Registro completo de eventos productivos.
* Dashboard operativo.
* Roles y autenticación.
* Historial auditable simple.

---

# STACK TECNOLÓGICO

## Backend

* Python
* Django
* Django Rest Framework
* PostgreSQL
* PostGIS
* Django Simple JWT
* Django Channels (si hace falta realtime Bluetooth)
* Celery + Redis para tareas async
* GeoDjango

## Frontend

* React
* Vite
* TypeScript
* TailwindCSS
* shadcn/ui
* TanStack Query
* React Router
* React Hook Form
* Zod
* Leaflet

## Infraestructura

* Docker
* docker-compose
* nginx
* Deploy target:

  * DigitalOcean App Platform o Droplet

---

# ARQUITECTURA

## Tipo

Monolito modular enterprise-ready.

Separar claramente:

* dominio
* aplicación
* infraestructura
* API

No generar spaghetti code.

Aplicar:

* services
* repositories
* serializers
* domain separation

---

# ESTRUCTURA GENERAL

/backend
/apps
/accounts
/farms
/locations
/animals
/rfid
/movements
/lots
/health
/reproduction
/weights
/finance
/dashboard
/audit
/frontend
/docs
/docker

---

# AUTENTICACIÓN

Implementar:

* JWT auth
* refresh tokens
* login responsive
* recuperación futura preparada

Roles:

* admin
* operator
* readonly

Permisos:

* Admin:
  todo
* Operator:
  operación diaria
* Readonly:
  dashboards y lectura

---

# MULTI-ESTABLECIMIENTO

Cada usuario puede pertenecer a múltiples establecimientos.

Modelo:

* Farm
* Membership
* Roles por establecimiento

Toda query debe respetar tenancy.

---

# MODELO GEOGRÁFICO

Usar PostGIS.

Entidad Location:

* id
* farm
* name
* type:

  * paddock
  * corral
  * manga
  * temporary_plot
  * custom
* polygon (nullable)
* manual_area_hectares (nullable)
* calculated_area_hectares
* active

Reglas:

* Si existe polygon:
  calcular hectáreas automáticamente.
* Si no existe:
  usar manual_area_hectares.

Frontend:

* Leaflet map
* dibujo de polígonos
* edición
* visualización stock

NO implementar GIS complejo todavía.

---

# MODELO ANIMAL

Animal debe soportar:

* individual
* lote
* trazabilidad histórica

Campos:

* id
* farm
* internal_number
* rfid
* visual_tag
* species
* category
* sex
* birth_date
* status:

  * active
  * sold
  * dead
  * missing
* current_location
* current_lot
* mother
* notes
* created_by
* updated_by
* timestamps

RFID debe ser único.

Mantener:

* current state
* historical events

---

# CONFIGURACIÓN DE ESPECIES Y CATEGORÍAS

Admin puede configurar:

* especies
* categorías
* estados personalizados

No hardcodear bovinos.

---

# LOTES

Lotes son agrupaciones lógicas temporales.

Modelo:

* Lot
* LotMembership

Animales pueden entrar/salir.

Mantener historial.

---

# RFID

RFID es núcleo central del sistema.

Compatibilidad:

* TrueTest
* Bluetooth
* WiFi

IMPORTANTE:
Usuarios NO deben importar archivos manualmente.

Implementar arquitectura preparada para:

* sincronización automática
* lectura en tiempo real

Crear módulo desacoplado:

* rfid gateway/service

Preparar:

* adapters
* device abstraction

MVP:

* conexión Bluetooth desde frontend web responsive.
* sincronización automática.
* cola local temporal.
* persistencia backend.

Investigar compatibilidad Web Bluetooth API.

Si navegador no soporta:

* fallback future-ready.

---

# FLUJOS RFID

## Conteo

* Escaneo animales
* Asociar a ubicación
* Comparar stock esperado vs leído
* Generar alertas faltantes

## Movimiento

* Escanear animales
* Elegir destino
* Confirmar
* Actualizar ubicación

## Sanidad

* Escaneo masivo
* Aplicar tratamiento

## Pesaje

* Preparar estructura

---

# CONTROL DE FALTANTES

Sistema debe detectar:

1. Diferencia entre stock esperado y conteo.
2. Animales no leídos hace X días.

Modelo MissingAlert:

* animal
* location
* detected_at
* resolved
* resolved_at

Dashboard debe mostrar:

* faltantes activos
* historial

---

# EVENTOS

Crear sistema genérico de eventos.

AnimalEvent:

* animal
* type
* timestamp
* metadata JSON
* user

Tipos:

* birth
* movement
* vaccination
* treatment
* service
* calving
* weaning
* weighing
* death
* sale
* count
* missing

No hardcodear lógica repetida.

---

# SANIDAD

Implementar:

* tratamientos individuales
* tratamientos por lote
* calendario sanitario

Modelos:

* Vaccine
* Treatment
* HealthProtocol
* ScheduledHealthEvent

Permitir:

* alertas futuras

---

# MOVIMIENTOS

Movimiento:

* origen
* destino
* fecha
* animales
* usuario
* tipo

Actualizar:

* ubicación actual
* historial

---

# AUDITORÍA

Guardar:

* created_by
* updated_by
* timestamps

NO implementar event sourcing completo.

---

# DASHBOARD MVP

Prioritarios:

1. Stock total
2. Stock por ubicación
3. Faltantes
4. Movimientos recientes
5. Gastos
6. Carga animal por parcela

Diseño:

* mobile first
* simple
* muy visual

---

# UX/UI

CRÍTICO.

Usuarios rurales con baja experiencia técnica.

Requisitos:

* botones grandes
* navegación clara
* pocos pasos
* alto contraste
* flujos rápidos
* minimizar tipeo

Crear sección especial:
"Operación RFID"

Optimizada para:

* manga
* corrales
* trabajo rápido

---

# FRONTEND

Usar:

* feature based folders
* reusable components
* typed API client
* loading states
* optimistic updates cuando tenga sentido

Responsive FULL.

Debe funcionar perfectamente en:

* Android Chrome
* tablets

---

# API

Construir API REST limpia.

Versionar:

* /api/v1/

Usar:

* DRF ViewSets
* filtros
* paginación

Documentar:

* OpenAPI / Swagger

---

# BASE DE DATOS

Usar:

* UUIDs
* índices correctos
* constraints
* soft delete donde tenga sentido

Optimizar:

* RFID lookups
* movimientos
* stock queries

---

# DOCKER

Crear:

* docker-compose.dev.yml
* docker-compose.prod.yml

Servicios:

* backend
* frontend
* postgres
* redis
* nginx

---

# TESTING

Implementar:

* pytest backend
* testing-library frontend

Mínimos:

* auth
* RFID
* movimientos
* stock
* faltantes

---

# SEGURIDAD

Implementar:

* JWT
* CORS
* rate limiting básico
* validaciones
* permissions
* environment variables

---

# ROADMAP

Generar:

* roadmap.md

Fases futuras:

* integración balanzas
* app offline
* PWA
* notificaciones push
* analytics avanzados
* IoT
* GPS
* reportes exportables

---

# ENTREGABLES

Generar:

1. Arquitectura completa
2. Modelos
3. API
4. Frontend base
5. Docker setup
6. Bluetooth RFID integration strategy
7. PostGIS setup
8. Seed data
9. Swagger docs
10. README enterprise
11. roadmap.md
12. scripts de desarrollo

---

# CRITERIOS IMPORTANTES

NO hacer:

* sobreingeniería innecesaria
* microservicios
* CQRS complejo
* event sourcing completo

SÍ hacer:

* código limpio
* modularidad
* tipado
* escalabilidad razonable
* excelente DX
* excelente UX

---

# PRIORIDAD ABSOLUTA

El sistema debe sentirse:

* simple
* rápido
* usable
* robusto

aunque internamente sea enterprise-ready.

Primero funcionalidad y experiencia operativa.
Luego sofisticación.