import paypalrestsdk
from django.conf import settings

# Configurar el SDK de PayPal
paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_SECRET
})

#https://sandbox.paypal.com
#Cliente  email: sb-iq47vg33847352@personal.example.com   password: A/1sryAL
#business email: sb-93qgx33847502@business.example.com    password: ArLg;?8i