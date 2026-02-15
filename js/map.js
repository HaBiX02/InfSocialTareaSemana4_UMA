const width = 800;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Proyección Mercator centrada en España
const projection = d3.geoMercator()
    .scale(2500)
    .center([-3.7038, 40.4168]) // Centro en Madrid
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

d3.json("data/pais.geojson").then(function (data) {

    projection.fitSize([width, height], data);

    // Dibujar las regiones
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "region")
        .attr("fill", "#334155")
        .on("click", function (event, d) {

            const regionName = d.properties.name;
            console.log("Seleccionado:", regionName);

            // Corrijo nombres para Wikipedia
            const wikiOverrides = {
                "Madrid": "Comunidad de Madrid",
                "Murcia": "Región de Murcia",
                "Valencia": "Comunidad Valenciana",
                "Asturias": "Principado de Asturias",
                "Navarra": "Comunidad Foral de Navarra",
                "La Rioja": "La Rioja (España)",
                "Ceuta": "Ceuta",
                "Melilla": "Melilla"
            };
            const wikiName = wikiOverrides[regionName] || regionName;

            // --- 1. IMAGEN ---
            const imgElement = document.getElementById("preview");

            imgElement.src = "";

            // Buscamos la bandera en la lista de medios de la página (más fiable)
            const wikiMediaUrl = `https://es.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(wikiName)}`;

            fetch(wikiMediaUrl)
                .then(res => {
                    if (!res.ok) throw new Error("Sin medios");
                    return res.json();
                })
                .then(data => {
                    // Filtramos por "Flag" o "Bandera"
                    const items = data.items || [];
                    const flagItem = items.find(item => {
                        const title = item.title.toLowerCase();
                        // Buscamos que contenga "flag" o "bandera" Y que sea SVG o JPG/PNG
                        return (title.includes("flag") || title.includes("bandera")) &&
                            (title.includes(".svg") || title.includes(".jpg") || title.includes(".png"));
                    });

                    if (flagItem && flagItem.srcset && flagItem.srcset.length > 0) {
                        // Usamos la mejor resolución disponible
                        const source = flagItem.srcset[flagItem.srcset.length - 1].src;
                        imgElement.src = source.startsWith("//") ? "https:" + source : source;
                        imgElement.alt = `Bandera de ${regionName}`;
                    } else {
                        throw new Error("Sin bandera en lista");
                    }
                })
                .catch(e => {
                    console.log("Fallback a búsqueda de artículo 'Bandera_de_...'", e);
                    const wikiFlagPageUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/Bandera_de_${encodeURIComponent(wikiName)}`;

                    fetch(wikiFlagPageUrl)
                        .then(r => r.json())
                        .then(d => {
                            if (d.thumbnail?.source) {
                                imgElement.src = d.thumbnail.source;
                                imgElement.alt = `Bandera de ${regionName}`;
                            } else {
                                // Fallback final: Imagen principal del artículo
                                const wikiMainUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`;
                                fetch(wikiMainUrl).then(mr => mr.json()).then(md => {
                                    imgElement.src = md.thumbnail?.source || "https://via.placeholder.com/400x300?text=Sin+Imagen";
                                });
                            }
                        })
                        .catch(() => {
                            imgElement.src = "";
                        });
                });

            // --- 2. TEXTO ---
            document.getElementById("ajaxText").innerHTML = `
                <h3>${regionName}</h3>
                <p style="color: #64748b;">Buscando info...</p>
            `;

            const wikiUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiName)}`;

            fetch(wikiUrl)
                .then(resp => {
                    if (!resp.ok) throw new Error("No encontrado");
                    return resp.json();
                })
                .then(wikiData => {
                    let text = wikiData.extract;

                    if (!text || wikiData.type === "disambiguation") {
                        text = "Varios resultados, sé más específico.";
                    }

                    document.getElementById("ajaxText").innerHTML = `
                        <h3>${wikiData.title}</h3>
                        <p>${text}</p>
                        <small style="color: #cbd5e1; font-size: 0.8rem; display: block; margin-top: 10px;">Fuente: Wikipedia</small>
                    `;
                })
                .catch(() => {
                    document.getElementById("ajaxText").innerHTML = `
                        <h3>${regionName}</h3>
                        <p>Sin información disponible.</p>
                    `;
                });
        });

}).catch(error => {
    console.error("Error crítico:", error);
    document.getElementById("map").innerHTML = `<p style="color: #ef4444; padding: 2rem;">Error mapa: ${error.message}</p>`;
});
