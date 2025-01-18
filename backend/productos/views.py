from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .serializers import ProductoSerializer
from .models import Producto

# Create your views here.

class ProductoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, producto_id=None):
        """Obtiene la lista de productos o un producto específico."""
        if producto_id:
            producto = get_object_or_404(Producto, id=producto_id)
            serializer = ProductoSerializer(producto)
            return Response(serializer.data, status=status.HTTP_200_OK)
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Permite al administrador agregar un nuevo producto."""
        if request.user.rol != 'administrador':
            return Response({"detail": "No tiene permiso para agregar productos."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, producto_id=None):
        """Permite al administrador y al empleado modificar un producto existente."""
        producto = get_object_or_404(Producto, id=producto_id)
        if request.user.rol not in ['administrador', 'empleado']:
            return Response({"detail": "No tiene permiso para modificar productos."}, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductoSerializer(producto, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, producto_id=None):
        """Permite al administrador eliminar un producto."""
        producto = get_object_or_404(Producto, id=producto_id)
        if request.user.rol != 'administrador':
            return Response({"detail": "No tiene permiso para eliminar productos."}, status=status.HTTP_403_FORBIDDEN)
        producto.delete()
        return Response({"detail": "Producto eliminado."}, status=status.HTTP_204_NO_CONTENT)