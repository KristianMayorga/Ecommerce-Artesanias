from rest_framework import serializers
from .models import Producto
from resena.serializers import ResenaSerializer


class ProductoSerializer(serializers.ModelSerializer):
    reseñas = ResenaSerializer(many=True, read_only=True)  # Mostrar todas las reseñas del producto.

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'categoria', 'stock', 'precio', 'imagen', 'reseñas']