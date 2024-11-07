from django.urls import path
from .views import ProductoView

urlpatterns = [
    path('productos/', ProductoView.as_view(), name='listar_productos'),
    path('productos/crear/', ProductoView.as_view(), name='crear_producto'),
    path('productos/<int:producto_id>/actualizar/', ProductoView.as_view(), name='actualizar_producto'),
    path('productos/<int:producto_id>/eliminar/', ProductoView.as_view(), name='eliminar_producto'),
]