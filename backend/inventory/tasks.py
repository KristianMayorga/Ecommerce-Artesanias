from celery import shared_task
from productos.models import Producto


@shared_task
def actualizar_inventario(producto_id, cantidad):
    try:
        producto = Producto.objects.get(id=producto_id)
        producto.stock -= cantidad  
        producto.save()
        return f"Inventario actualizado para el producto {producto.nombre}"
    except Producto.DoesNotExist:
        return "Producto no encontrado"
