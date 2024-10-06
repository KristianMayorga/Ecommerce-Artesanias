# Usar la imagen oficial de Node.js
FROM node:14

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de configuración de npm
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el código del proyecto
COPY . .

# Ejecutar la aplicación en modo desarrollo
CMD ["npm", "start"]
