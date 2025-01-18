from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'email', 'password', 'numero_de_celular']

    def create(self, validated_data):
        validated_data['rol'] = 'cliente'  # Se establece el rol como 'cliente'
        usuario = Usuario.objects.create_user(**validated_data)
        return usuario