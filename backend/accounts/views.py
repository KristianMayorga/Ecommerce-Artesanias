from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .serializers import UsuarioSerializer

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
                'role': str(user.rol),
                'nombre': str(user.nombre),
            })
        return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)


class Usuarios(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.rol != 'admin':
            return Response({"detail": "No tiene permiso para agregar usuarios."}, status=status.HTTP_403_FORBIDDEN)
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, usuario_id=None):

        if not usuario_id:
            return Response({"detail": "No se ha especificado un usuario."}, status=status.HTTP_400_BAD_REQUEST)

        usuario = get_object_or_404(Usuario, id=usuario_id)
        if request.user.rol not in ['admin']:
            return Response({"detail": "No tiene permiso para modificar al usuario."}, status=status.HTTP_403_FORBIDDEN)


        serializer = UsuarioSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, usuario_id=None):
        if not usuario_id:
            return Response({"detail": "No se ha especificado un usuario."}, status=status.HTTP_400_BAD_REQUEST)

        usuario = get_object_or_404(Usuario, id=usuario_id)
        if request.user.rol != 'admin':
            return Response({"detail": "No tiene permiso para eliminar usuarios."}, status=status.HTTP_403_FORBIDDEN)
        usuario.delete()
        return Response({"detail": "Usuario eliminado."}, status=status.HTTP_204_NO_CONTENT)
