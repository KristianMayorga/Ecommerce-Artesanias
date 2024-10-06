# ArtesaniasBGA

# Plataforma E-commerce para Artesanías Bogotá

## Descripción del Proyecto
Este proyecto consiste en una plataforma e-commerce que permite a los usuarios comprar productos en línea, mientras se integran los inventarios con puntos de venta físicos y se analiza el comportamiento de los clientes. La arquitectura del sistema está basada en **eventos** y organizada por **capas**.

### Arquitectura y Herramientas

#### **Capas:**
1. **Capa de Presentación (Frontend)**: Usamos **React** para construir una interfaz de usuario dinámica y responsiva, que interactúa con el backend a través de una API REST.
   
2. **Capa de Negocio (Backend)**: Usamos **Django** para gestionar la lógica de negocio y coordinar la respuesta a eventos. En esta capa, la lógica del negocio (pedidos, inventario) genera y responde a eventos que se gestionan de forma asíncrona.

3. **Capa de Persistencia (Base de Datos)**: **PostgreSQL** se usa para almacenar datos estructurados como inventarios, pedidos y usuarios. Los eventos que se disparan en la capa de negocio pueden actualizar la base de datos cuando se procesan.

#### **Eventos (RabbitMQ + Celery):**
- La arquitectura está centrada en **eventos**, lo que significa que cada vez que ocurre una acción importante (como un pedido realizado o una actualización de inventario), se genera un **evento**. 
- Estos eventos son gestionados por **RabbitMQ**, que actúa como el **broker de mensajes**.
- Los trabajadores de **Celery** procesan los eventos asíncronamente, lo que permite que el sistema siga funcionando sin bloquear las operaciones principales.

4. **Capa de Integración (Mensajería - RabbitMQ):**
   - **RabbitMQ** gestiona la cola de eventos. Cada evento generado en la capa de negocio es enviado a RabbitMQ, donde los **workers** (trabajadores de Celery) los procesan en segundo plano. Esto permite que las tareas de larga duración no bloqueen el flujo principal de la aplicación.
   
#### **Herramientas:**
- **Frontend:** React
  - Herramienta para construir interfaces de usuario dinámicas y reactivas.
- **Backend:** Django
  - Framework para gestionar la lógica de negocio y manejar APIs.
- **Celery:** 
  - Sistema para manejar tareas asíncronas, como la actualización de inventarios y pedidos.
- **RabbitMQ:** 
  - Sistema de mensajería para manejar eventos distribuidos entre los diferentes componentes.
- **Base de Datos:** PostgreSQL
  - Almacén relacional de datos, ideal para manejar grandes volúmenes de información estructurada.

### Estructura del Proyecto
- **/backend/**: Código del backend (Django/Flask), modelos de datos, vistas y API.
- **/frontend/**: Código del frontend (React), componentes y páginas.
- **/workers/**: Código para los trabajadores de Celery, que manejan tareas asíncronas disparadas por eventos.
- **docker-compose.yml**: Configuración de Docker para desplegar la aplicación.
