from django.contrib import admin
from .models import Usuario,Cliente,Empleado,Administrador,MetodoDePago

# Register your models here.
admin.site.register(Usuario)
admin.site.register(Cliente)
admin.site.register(Empleado)
admin.site.register(Administrador)
admin.site.register(MetodoDePago)
