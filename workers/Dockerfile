# Usar la imagen base de Python
FROM python:3.9-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo de requerimientos
COPY requirements.txt .

# Instalar las dependencias
RUN pip install -r requirements.txt

# Copiar el código de los workers de Celery
COPY . .

# Ejecutar Celery como trabajador
CMD ["celery", "-A", "core", "worker", "--loglevel=info"]
