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
from .paypal_config import paypalrestsdk
from django.conf import settings

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
        """Obtemos el carrito de compras del usuario actual."""
        try:
            carrito = CarroCompra.objects.get(cliente=request.user)
            serializer = CarroCompraSerializer(carrito)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CarroCompra.DoesNotExist:
            return Response({"detail": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Agregamps producto al carrito del usuario actual."""
        producto_id = request.data.get("producto_id")
        cantidad = request.data.get("cantidad", 1)

        try:
            producto = Producto.objects.get(id=producto_id)
            
            # Verificar stock
            if producto.stock < cantidad:
                return Response({"detail": "No hay suficiente stock disponible."}, status=status.HTTP_400_BAD_REQUEST)
            
            carrito, created = CarroCompra.objects.get_or_create(cliente=request.user)
            
            # Verificar produucto carrito
            carrito_producto, creado = CarroProducto.objects.get_or_create(carro=carrito, producto=producto)
            
            if not creado:  # Si ya esta actualizamos la cantidad
                carrito_producto.cantidad += cantidad
            else:
                carrito_producto.cantidad = cantidad
            
            # Verificar que el stock actualizado sea suficiente
            if producto.stock < carrito_producto.cantidad:
                return Response({"detail": "No hay suficiente stock disponible."}, status=status.HTTP_400_BAD_REQUEST)
            
            carrito_producto.save()
            
            # Calcular el total del carrito
            carrito.calcular_total()

            # Restar el stock disponible del producto
            producto.stock -= cantidad
            producto.save()
            
            return Response({"detail": "Producto agregado al carrito"}, status=status.HTTP_201_CREATED)
        
        except Producto.DoesNotExist:
            return Response({"detail": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, producto_id=None):
        """Elimina un producto del carrito del usuario actual."""
        try:
            carrito = CarroCompra.objects.get(cliente=request.user)
            producto = Producto.objects.get(id=producto_id)
            carrito_producto = CarroProducto.objects.get(carro=carrito, producto=producto)
            
            # Volver a sumar el stock al eliminar el producto del carrito
            producto.stock += carrito_producto.cantidad
            producto.save()

            carrito_producto.delete()  # Eliminar el producto del carrito

            # Calcular el total del carrito después de la eliminación
            carrito.calcular_total()

            return Response({"detail": "Producto eliminado del carrito"}, status=status.HTTP_204_NO_CONTENT)
        except CarroCompra.DoesNotExist:
            return Response({"detail": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Producto.DoesNotExist:
            return Response({"detail": "Producto no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except CarroProducto.DoesNotExist:
            return Response({"detail": "El producto no está en el carrito"}, status=status.HTTP_404_NOT_FOUND)
        
class CrearPagoView(APIView):
    def post(self, request):
        """Crea un pago en PayPal para el carrito de compras."""
        carro = CarroCompra.objects.get(cliente=request.user)
        total_cop = carro.total

        # Convierte el total de COP a USD
        total_usd = total_cop * settings.EXCHANGE_RATE_COP_TO_USD
        total_usd = f"{total_usd:.2f}" 

        pago = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{settings.SITE_URL}/api/pagos/aprobar/",
                "cancel_url": f"{settings.SITE_URL}/api/pagos/cancelar/"
            },
            "transactions": [{
                "amount": {
                    "total": total_usd,
                    "currency": "USD"
                },
                "description": f"Compra en {settings.SITE_NAME}."
            }]
        })

        # Creación y redirección a PayPal
        if pago.create():
            for link in pago.links:
                if link.method == "REDIRECT":
                    redirect_url = link.href
                    return Response({"url": redirect_url}, status=status.HTTP_200_OK)
        else:
            return Response({"error": pago.error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class AprobarPagoView(APIView):
    def get(self, request):
        """Procesa la aprobación de un pago realizado en PayPal."""
        pago_id = request.GET.get("paymentId")
        payer_id = request.GET.get("PayerID")

        pago = paypalrestsdk.Payment.find(pago_id)
        if pago.execute({"payer_id": payer_id}):
            # Aquí puedes actualizar el estado del carrito a "pagado" o crear una orden.
            return Response({"message": "Pago realizado con éxito"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": pago.error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)