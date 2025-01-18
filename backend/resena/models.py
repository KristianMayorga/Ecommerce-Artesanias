from django.db import models
from django.conf import settings
from productos.models import Producto
from django.core.validators import MinValueValidator, MaxValueValidator


class Resena(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='resenas')
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contenido = models.TextField()
    calificacion = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['producto', 'usuario'], name='unique_resena_producto_usuario')
        ]
        indexes = [
            models.Index(fields=['producto']),  # Índice para búsquedas por producto
            models.Index(fields=['usuario']),   # Índice para búsquedas por usuario
        ]
    
    def __str__(self):
        return f'Reseña de {self.usuario} para {self.producto}'
