from django.db import models
from CarroCompra.models import CarroCompra 
# Create your models here.
class Pedido(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('procesando', 'Procesando'),
        ('enviado', 'Enviado'),
        ('entregado', 'Entregado'),
        ('cancelado', 'Cancelado'),
    ]

    id = models.AutoField(primary_key=True)
    carro = models.OneToOneField(CarroCompra, on_delete=models.CASCADE)  # Cada pedido está vinculado a un solo carro
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    direccion = models.CharField(max_length=255)
    fecha_compra = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido {self.id} - Estado: {self.estado}"