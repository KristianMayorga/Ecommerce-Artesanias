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
    
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  # Solo usuarios autenticados pueden modificar.

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def agregar_resena(self, request, pk=None):
        """Agrega una reseña al producto especificado."""
        producto = self.get_object()
        serializer = ResenaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(producto=producto, usuario=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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