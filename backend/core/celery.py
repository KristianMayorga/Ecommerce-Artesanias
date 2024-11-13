
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Configuración predeterminada de Django para Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# Cargar configuración desde settings.py, usando un prefijo CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks en cada aplicación de Django
app.autodiscover_tasks()