from django.urls import path, include
from .views import RegisterView, LoginView, ProductoViewSet, CarroCompraView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('productos/', ProductoViewSet.as_view({'get': 'list', 'post': 'create'}), name='productos'),

    path('carrito/', CarroCompraView.as_view(), name='carro-compra'),
    path('carrito/<int:producto_id>/', CarroCompraView.as_view(), name='eliminar-producto-carrito'),
    
]