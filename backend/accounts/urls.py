from django.urls import path
from .views import RegisterView, LoginView, Usuarios

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('usuarios', Usuarios.as_view(), name='usuarios'),
    path('usuarios/<int:usuario_id>', Usuarios.as_view(), name='actualizar-usuario')
]