
let map;
let lati;
let longi;


async function getComps(latitude, longitude){
  lati = parseFloat(latitude)
  longi = parseFloat(longitude)
}



async function initMap() {
  await getComps(lati, longi)
  
  const position = { lat: lati, lng: longi };

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


