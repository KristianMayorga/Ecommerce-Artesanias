from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import action
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .serializers import UsuarioSerializer, ResenaSerializer, ProductoSerializer, CarroCompraSerializer, CarroProductoSerializer
from accounts.models import Usuario
from productos.models import Resena, Producto
from CarroCompra.models import CarroCompra, CarroProducto



# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuario registrado exitosamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    
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

class CarroCompraView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtiene el carrito de compras del usuario actual."""
        try:
            carrito = CarroCompra.objects.get(cliente=request.user)
            serializer = CarroCompraSerializer(carrito)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CarroCompra.DoesNotExist:
            return Response({"detail": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Agrega un producto al carrito del usuario actual."""
        producto_id = request.data.get("producto_id")
        cantidad = request.data.get("cantidad", 1)

        try:
            producto = Producto.objects.get(id=producto_id)
            carrito, created = CarroCompra.objects.get_or_create(cliente=request.user)
            carrito.agregar_producto(producto)
            carrito_producto = CarroProducto.objects.get(carro=carrito, producto=producto)
            carrito_producto.cantidad = cantidad
            carrito_producto.save()
            carrito.calcular_total()
            return Response({"detail": "Producto agregado al carrito"}, status=status.HTTP_201_CREATED)
        except Producto.DoesNotExist:
            return Response({"detail": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, producto_id=None):
        """Elimina un producto del carrito del usuario actual."""
        try:
            carrito = CarroCompra.objects.get(cliente=request.user)
            producto = Producto.objects.get(id=producto_id)
            carrito.eliminar_producto(producto)
            return Response({"detail": "Producto eliminado del carrito"}, status=status.HTTP_204_NO_CONTENT)
        except CarroCompra.DoesNotExist:
            return Response({"detail": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Producto.DoesNotExist:
            return Response({"detail": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)