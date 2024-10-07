# Usar la imagen base de Python
FROM python:3.11.9

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de requerimientos
COPY requirements.txt .

# Instalar dependencias
RUN pip install -r requirements.txt

# Copiar el código del proyecto
COPY . .

# Ejecutar las migraciones y el servidor
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
