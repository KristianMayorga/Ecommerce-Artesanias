from rest_framework import serializers
from .models import CarroCompra, CarroProducto

class CarroProductoSerializer(serializers.ModelSerializer):
    producto = serializers.StringRelatedField()

    class Meta:
        model = CarroProducto
        fields = ['producto', 'cantidad']

class CarroCompraSerializer(serializers.ModelSerializer):
    productos = CarroProductoSerializer(source='carroproducto_set', many=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CarroCompra
        fields = ['cliente', 'productos', 'total']