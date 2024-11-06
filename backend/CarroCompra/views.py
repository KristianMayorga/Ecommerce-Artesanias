from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from productos.models import Producto
from .models import CarroCompra
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse 

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
    