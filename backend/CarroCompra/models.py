from django.db import models
from accounts.models import Cliente
from productos.models import Producto



class CarroCompra(models.Model):
    
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    productos = models.ManyToManyField(Producto, through='CarroProducto')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def agregar_producto(self, producto):
        carro_producto, created = CarroProducto.objects.get_or_create(carro=self, producto=producto)
        if not created:
            carro_producto.cantidad += 1
        carro_producto.save()
        self.calcular_total()

    def eliminar_producto(self, producto):
        try:
            carro_producto = CarroProducto.objects.get(carro=self, producto=producto)
            carro_producto.delete()
            self.calcular_total()
        except CarroProducto.DoesNotExist:
            pass  

    def calcular_total(self):
   
        self.total = sum(item.producto.precio * item.cantidad for item in self.carroproducto_set.all())
        self.save()

    def __str__(self):
        return f"Carro de {self.cliente.nombre} Total {self.total}"  

class CarroProducto(models.Model):
    
    carro = models.ForeignKey(CarroCompra, on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} en {self.carro}"