var map; // Declarado para que sea accesible globalmente por otros scripts como sismos_api.js
let routingControl = null;

// Coordenadas SENA Centro de Comercio y Servicios (Popayán) 📍
const latSENA = 2.4419;
const lngSENA = -76.6063;
const senaCoords = L.latLng(latSENA, lngSENA);

document.addEventListener('DOMContentLoaded', () => {
    const mapDiv = document.getElementById('mapa-interactivo');
    if (!mapDiv) return;

    // Inicializar Mapa
    map = L.map('mapa-interactivo').setView([latSENA, lngSENA], 15);

    // Servidor de OpenStreetMap 🌐
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

    // Marcador Punto de Encuentro Principal SENA 🟢
    L.marker([latSENA, lngSENA]).addTo(map)
        .bindPopup('<b>📍 SENA Centro de Comercio y Servicios</b><br>Punto de Encuentro Evacuación Piso 1')
        .openPopup();

    // 🎯 1. OBTENER Y MARCAR TU UBICACIÓN ACTUAL
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Marcador personalizado en tu punto de ubicación
                const userMarker = L.marker([userLat, userLng]).addTo(map);
                userMarker.bindPopup('<b>🔵 Tu Ubicación Actual</b><br>Punto de referencia inicial').openPopup();

                // Rellenar input de origen automáticamente
                const input = document.getElementById('origen-input');
                if (input) input.value = `${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;

                // Trazar la ruta de evacuación desde tu ubicación actual hasta el SENA
                colocarRutaPersonalizada(userLat, userLng, "Tu Ubicación Actual");
            },
            (error) => {
                console.warn("No se pudo obtener la ubicación actual: ", error.message);
            }
        );
    }

    // 🎯 Trazar ruta al hacer clic en cualquier lugar del mapa
    map.on('click', function(e) {
        const userLat = e.latlng.lat;
        const userLng = e.latlng.lng;
        colocarRutaPersonalizada(userLat, userLng, "Ubicación Seleccionada");
    });

    // Redimensionado para prevenir áreas grises en el lienzo
    setTimeout(() => { map.invalidateSize(); }, 500);
});

// Función para trazar la ruta SIGUIENDO LAS CALLES reales usando OSRM
function colocarRutaPersonalizada(lat, lng, nombre) {
    const origenCoords = L.latLng(lat, lng);

    // Limpiar control de ruteo previo
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Trazado de ruta por vías públicas transitables
    routingControl = L.Routing.control({
        waypoints: [
            origenCoords,
            senaCoords
        ],
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving' // Cambiar a 'foot' si la evacuación es estrictamente peatonal
        }),
        lineOptions: {
            styles: [{ color: '#2563eb', opacity: 0.9, weight: 6 }]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: function(i, wp) {
            if (i === 0) {
                return L.marker(wp.latLng).bindPopup(`<b>🚩 Origen: ${nombre}</b>`).openPopup();
            }
            return null;
        }
    }).addTo(map);

    // Actualizar el valor del input de origen
    const input = document.getElementById('origen-input');
    if (input) input.value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Búsqueda manual por texto o por coordenadas directas
function trazarRutaManual() {
    const query = document.getElementById('origen-input').value;
    if (!query) return;

    if (query.includes(',')) {
        const partes = query.split(',');
        const lat = parseFloat(partes[0].trim());
        const lng = parseFloat(partes[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            colocarRutaPersonalizada(lat, lng, "Ubicación Manual");
            return;
        }
    }

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Popayan')}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                colocarRutaPersonalizada(lat, lon, query);
            } else {
                alert("No se encontró la ubicación en Popayán.");
            }
        })
        .catch(err => console.error("Error al geocodificar:", err));
}

// Selección rápida desde el panel lateral de opciones
function seleccionarRuta(index) {
    const alternativas = [
        { lat: 2.4480, lng: -76.6020, nombre: "Ruta 1 (Por Cra. 9)" },
        { lat: 2.4380, lng: -76.6120, nombre: "Ruta 2 (Por Cra. 6)" },
        { lat: 2.4510, lng: -76.5980, nombre: "Ruta 3 (Por Variante Norte)" }
    ];
    
    const punto = alternativas[index] || alternativas[0];
    colocarRutaPersonalizada(punto.lat, punto.lng, punto.nombre);
}