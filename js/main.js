  var map;
  var markers = [];
  var bounds = new google.maps.LatLngBounds();
  var initialLocation;
  var largeInfoWindow = new google.maps.InfoWindow();
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
      console.log(initialLocation);
    }, function() {
      // handleNoGeolocation(browserSupportFlag);
    });
  }
  // Browser doesn't support Geolocation
  else {
    initialLocation = {lat:40.651291, lng:-73.967063};
    // browserSupportFlag = false;
    // handleNoGeolocation(browserSupportFlag);
  }
  function initMap() {
    var mapDiv = document.getElementById('map');
   map = new google.maps.Map(mapDiv, {
     center: {lat: 38.826101099999995, lng: -77.05869249999999},
     zoom: 8
   });
   console.log(map.center);
   map.setCenter(initialLocation);
  //  map.setCenter(initialLocation);
   var locations = [
    //  {title:"New York City",location: {lat:40.651291, lng:-73.967063}}
   ]
   locations.forEach(function(location, index){
     var marker = new google.maps.Marker({
       map: map,
       position: location.location,
       title: location.title,
       animation: google.maps.Animation.DROP,
       id: index
     });
     markers.push(marker);
     bounds.extend(marker.position);
     marker.addListener('click',function(){
       populateInfoWindow(this, largeInfoWindow);
     });
   });
  }
  initMap();
  // map.fitBounds(bounds);
  // map.setCenter({lat: 38.826101099999995, lng: -77.05869249999999}  );
  function populateInfoWindow(marker, infowindow){
    if (infowindow.marker != marker){
      infowindow.marker = marker;
      infowindow.setContent('<div>'+ marker.title +'</div>')
      infowindow.open(map,marker);
      infowindow.addListener('closeclick', function(){
        infowindow.setMarker(null);
      });
    }
  }
