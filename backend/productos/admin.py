from django.contrib import admin

# Register your models here.
from .models import Producto, Resena

admin.site.register(Producto)
admin.site.register(Resena)