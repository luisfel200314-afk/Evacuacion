from django.db import models

class PuntoEncuentro(models.Model):
    nombre = models.CharField(max_length=150, verbose_name="Nombre del Punto")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción / Ubicación")
    latitud = models.FloatField(verbose_name="Latitud")
    longitud = models.FloatField(verbose_name="Longitud")
    capacidad = models.IntegerField(default=50, verbose_name="Capacidad Máxima")
    activo = models.BooleanField(default=True, verbose_name="¿Activo?")
    creado = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Registro")

    class Meta:
        verbose_name = "Punto de Encuentro"
        verbose_name_plural = "Puntos de Encuentro"
        ordering = ['-creado']

    def __str__(self):
        return f"{self.nombre} - {'Activo' if self.activo else 'Inactivo'}"


class SismoReporte(models.Model):
    magnitud = models.FloatField(verbose_name="Magnitud")
    lugar = models.CharField(max_length=200, verbose_name="Ubicación del Sismo")
    fecha_sismo = models.DateTimeField(verbose_name="Fecha y Hora del Sismo")
    profundidad = models.CharField(max_length=50, blank=True, null=True, verbose_name="Profundidad")
    registrado_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reporte Sísmico"
        verbose_name_plural = "Reportes Sísmicos"
        ordering = ['-fecha_sismo']

    def __str__(self):
        return f"M {self.magnitud} - {self.lugar}"