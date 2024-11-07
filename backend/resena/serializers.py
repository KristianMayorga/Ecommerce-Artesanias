from rest_framework import serializers
from .models import Resena

class ResenaSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)  # Mostrar el nombre del usuario.

    class Meta:
        model = Resena
        fields = ['id', 'producto', 'usuario', 'contenido', 'calificacion', 'fecha']
        read_only_fields = ['usuario', 'fecha']