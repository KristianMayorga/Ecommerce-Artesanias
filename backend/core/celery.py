from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('ARTESANIASBGA')

app.config_from_object('django.conf:settings', namespace='CELERY')

# Cargar tareas de todos los módulos de aplicación registrados
app.autodiscover_tasks()
