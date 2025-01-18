from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from productos.models import Producto
from .models import CarroCompra, CarroProducto
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import CarroCompraSerializer
from .paypal_config import paypalrestsdk
from django.conf import settings

@login_required

def agregar_producto_carrito(request, producto_id, cantidad=1):

    # Producto en la bd
    producto = get_object_or_404(Producto, id=producto_id)

    # Carrito del usuario
    carrito, created = CarroCompra.objects.get_or_create(cliente=request.user.cliente)

    try:
        carrito.agregar_producto(producto, cantidad)
        return JsonResponse({'success': True, 'message': 'Producto agregado al carrito con éxito.'})
    
    except ValueError as e:
        # Si no hay suficiente stock
        return JsonResponse({'success': False, 'message': 'No hay suficiente stock para este producto.'}, status=400)


class CarroCompraView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtenemos el carrito de compras del usuario actual."""
        try:
            carrito = CarroCompra.objects.get(cliente=request.user)
            serializer = CarroCompraSerializer(carrito)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CarroCompra.DoesNotExist:
            return Response({"detail": "Carrito no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        """Agregamos producto al carrito del usuario actual."""
        producto_id = request.data.get("producto_id")
        cantidad = request.data.get("cantidad", 1)

        try:
            producto = Producto.objects.get(id=producto_id)
            
            # Verificar stock
            if producto.stock < cantidad:
                return Response({"detail": "No hay suficiente stock disponible."}, status=status.HTTP_400_BAD_REQUEST)
            
            carrito, created = CarroCompra.objects.get_or_create(cliente=request.user)
            
            # Verificar producto carrito
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
            return Response({"message": "Pago realizado con éxito"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": pago.error}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  