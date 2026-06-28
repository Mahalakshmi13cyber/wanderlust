mapboxgl.accessToken = mapToken;

console.log("Listing =", listing);
console.log("Geometry =", listing.geometry);
console.log("Coordinates =", listing.geometry.coordinates);

if (listing.geometry && listing.geometry.coordinates) {

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: listing.geometry.coordinates,
        zoom: 12
    });

    new mapboxgl.Marker({ color: "red" })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<h6>${listing.location}</h6><p>Exact location</p>`)
        )
        .addTo(map);

    const layerList = document.getElementById("menu");
    const inputs = layerList.getElementsByTagName("input");

    for (const input of inputs) {
        input.onclick = (layer) => {
            const layerId = layer.target.id;
            map.setStyle("mapbox://styles/mapbox/" + layerId);
        };
    }

} else {
    console.error("No coordinates found for this listing.");
}