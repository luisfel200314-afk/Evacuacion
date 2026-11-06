from django.contrib import admin
from .models import PuntoEncuentro, SismoReporte

# Personalización del encabezado del panel
admin.site.site_header = "Protocolo de Evacuación - CodeRider"
admin.site.site_title = "Admin Evacuación"
admin.site.index_title = "Panel de Control y Monitoreo"

@admin.register(PuntoEncuentro)
class PuntoEncuentroAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'latitud', 'longitud', 'capacidad', 'activo', 'creado')
    list_filter = ('activo', 'creado')
    search_fields = ('nombre', 'descripcion')
    list_editable = ('activo', 'capacidad')
    readonly_fields = ('creado',)

@admin.register(SismoReporte)
class SismoReporteAdmin(admin.ModelAdmin):
    list_display = ('magnitud', 'lugar', 'fecha_sismo', 'profundidad')
    list_filter = ('magnitud', 'fecha_sismo')
    search_fields = ('lugar',)