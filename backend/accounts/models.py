from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class MetodoDePago(models.Model):
    nombre = models.CharField(max_length=50)
    detalles = models.TextField()

    def __str__(self):
        return self.nombre

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Crea y retorna un usuario con un email."""
        if not email:
            raise ValueError('El campo del email no debe estar vacio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crea y retorna un super usuario con un email."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    # Campos personalizados
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    numero_de_celular = models.CharField(max_length=20,default='0000000000')
    rol = models.CharField(max_length=20, default="cliente")  # Puede ser "cliente", "empleado" o "administrador"

    username = None

    # se establece el email como el campo principal para la autenticación
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UsuarioManager()

    def __str__(self):
        return self.email

class Cliente(Usuario):
    metodo_de_pago = models.ForeignKey('MetodoDePago', on_delete=models.SET_NULL, null=True, blank=True)

    fecha_nacimiento = models.DateField()

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
    def __str__(self):
        return f'{self.nombre} - Cliente'


class Empleado(Usuario):
    class Meta:
        verbose_name = 'Empleado'
        verbose_name_plural = 'Empleados'

class Administrador(Usuario):
    class Meta:
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'
