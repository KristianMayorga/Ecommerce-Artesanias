from django.urls import path, include
from .views import RegisterView, LoginView, ProductoView, CarroCompraView, CrearPagoView, AprobarPagoView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    path('productos/', ProductoView.as_view(), name='listar_productos'),
    path('productos/crear/', ProductoView.as_view(), name='crear_producto'),
    path('productos/<int:producto_id>/actualizar/', ProductoView.as_view(), name='actualizar_producto'),
    path('productos/<int:producto_id>/eliminar/', ProductoView.as_view(), name='eliminar_producto'),

    path('carrito/', CarroCompraView.as_view(), name='carro-compra'),
    path('carrito/<int:producto_id>/', CarroCompraView.as_view(), name='eliminar-producto-carrito'),

    
]