# syntax=docker/dockerfile:1

FROM python:3.10-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies, including curl for the healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgdal-dev curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/

# The default command to run (will be passed to the entrypoint)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
