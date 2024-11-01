from rest_framework import serializers
from accounts.models import Usuario
from productos.models import Resena, Producto
from CarroCompra.models import CarroCompra, CarroProducto

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'email', 'password', 'numero_de_celular', 'rol']

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario.objects.create_user(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

class ResenaSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)  # Mostrar el nombre del usuario.

    class Meta:
        model = Resena
        fields = ['id', 'producto', 'usuario', 'contenido', 'calificacion', 'fecha']
        read_only_fields = ['usuario', 'fecha']

class ProductoSerializer(serializers.ModelSerializer):
    reseñas = ResenaSerializer(many=True, read_only=True)  # Mostrar todas las reseñas del producto.

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'categoria', 'stock', 'precio', 'imagen', 'reseñas']

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