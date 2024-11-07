from django.urls import path
from .views import CarroCompraView, CrearPagoView, AprobarPagoView

urlpatterns = [
    path('carrito/', CarroCompraView.as_view(), name='ver-carro-compra'),  
    path('carrito/agregar/', CarroCompraView.as_view(), name='agregar-producto-carrito'),  
    path('carrito/eliminar/<int:producto_id>/', CarroCompraView.as_view(), name='eliminar-producto-carrito'),  

    path('pagos/crear/', CrearPagoView.as_view(), name='crear_pago'),
    path('pagos/aprobar/', AprobarPagoView.as_view(), name='aprobar_pago'),
]