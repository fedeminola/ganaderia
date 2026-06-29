# GANADERA RFID - MVP ENTERPRISE

This is an enterprise-ready MVP for a livestock management system using RFID, geolocation, and animal stock control.

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Development

To get the development environment up and running, use the following command:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

The backend will be available at `http://localhost:8000` and the frontend at `http://localhost:3000`.

### Production

To build and run the production environment, use the following command:

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

The application will be available at `http://localhost`.

## Tech Stack

- **Backend**: Python, Django, Django Rest Framework, PostgreSQL, PostGIS, Celery, Redis
- **Frontend**: React, Vite, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, React Router, React Hook Form, Zod, Leaflet
- **Infrastructure**: Docker, docker-compose, nginx

## API Documentation

The API documentation is available at `http://localhost:8000/api/v1/schema/swagger-ui/` when the development server is running.
