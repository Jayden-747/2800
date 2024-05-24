


let map;

async function initMap() {
    
  const position = { lat: 49.258377, lng: -122.778777 };

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");


  map = new Map(document.getElementById("map"), {
    zoom: 17,
    center: position,
    mapId: "DEMO_MAP_ID",
  });


  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Garden",
  });

  console.log("this works")
}


