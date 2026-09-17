// Carga de sismos recientes en Colombia (USGS)
function cargarSismosEnMapa() {
    const usgsUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=-4.2&maxlatitude=13.0&minlongitude=-79.0&maxlongitude=-66.8&minmagnitude=2.5";

    console.log("Iniciando petición de sismos a la USGS...");

    fetch(usgsUrl)
        .then(response => response.json())
        .then(data => {
            const listaContenedor = document.getElementById("lista-sismos");
            if (listaContenedor) listaContenedor.innerHTML = "";

            if (!data.features || data.features.length === 0) {
                if (listaContenedor) listaContenedor.innerHTML = "<p style='color: var(--muted);'>No hay eventos sísmicos recientes en Colombia.</p>";
                return;
            }

            // Detectar el mapa global instanciado en mapa.js
            const mapaObjetivo = window.map || (typeof map !== 'undefined' ? map : null);

            if (!mapaObjetivo) {
                console.error("ERROR: No se encontró la variable global 'map'.");
                return;
            }

            const sismosGroup = L.featureGroup();

            data.features.forEach(quake => {
                const [lng, lat, depth] = quake.geometry.coordinates;
                const mag = quake.properties.mag;
                const lugar = quake.properties.place;
                const fecha = new Date(quake.properties.time).toLocaleString();

                // Marcador circular del sismo
                const circle = L.circleMarker([lat, lng], {
                    radius: Math.max(mag * 2.5, 5),
                    color: '#dc2626',
                    fillColor: '#ef4444',
                    fillOpacity: 0.75,
                    weight: 1.5
                });

                circle.bindPopup(`
                    <div style="font-family: sans-serif; font-size: 0.9rem;">
                        <strong style="color: #dc2626;">⚠️ Reporte de Sismo</strong><br>
                        <b>Lugar:</b> ${lugar}<br>
                        <b>Magnitud:</b> M ${mag}<br>
                        <b>Profundidad:</b> ${depth} km<br>
                        <b>Fecha:</b> ${fecha}
                    </div>
                `);

                sismosGroup.addLayer(circle);

                // Renderizar ítem en la lista lateral
                if (listaContenedor) {
                    const item = document.createElement("div");
                    item.style.cssText = "padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; cursor: pointer;";
                    item.innerHTML = `
                        <strong style="color: #ef4444;">M ${mag}</strong> - ${lugar}<br>
                        <small style="color: #9ca3af;">${fecha}</small>
                    `;
                    // Al hacer clic en el sismo del panel, centra el mapa en ese epicentro
                    item.onclick = () => {
                        mapaObjetivo.setView([lat, lng], 9);
                        circle.openPopup();
                    };
                    listaContenedor.appendChild(item);
                }
            });

            // Agregar el grupo de sismos al mapa
            sismosGroup.addTo(mapaObjetivo);

            // Ajustar la vista del mapa si el usuario hace zoom out para ver toda Colombia
            console.log(`Se agregaron ${data.features.length} sismos al mapa.`);
        })
        .catch(err => {
            console.error("Error al obtener datos sísmicos:", err);
            const listaContenedor = document.getElementById("lista-sismos");
            if (listaContenedor) listaContenedor.innerHTML = "<p style='color: #ef4444;'>Error al cargar sismos.</p>";
        });
}

// Escuchar evento de carga
window.addEventListener("DOMContentLoaded", () => {
    // Breve espera para asegurar que mapa.js ya creó el objeto 'map'
    setTimeout(cargarSismosEnMapa, 600);
});