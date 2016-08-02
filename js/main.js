var map;
var initialLocation = {};
if(navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    initialLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
    initMap(initialLocation);
  }, function() {
    // handleNoGeolocation(browserSupportFlag);
    console.log("fail");
  });
}
// Browser doesn't support Geolocation
else {
  console.log("fail");
  // browserSupportFlag = false;
  // handleNoGeolocation(browserSupportFlag);
}
function RightControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');

  controlUI.id = "nav_control";
  controlUI.style.margin = '12px';
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlImg = document.createElement('img');
  controlImg.src='../images/menu_icon.png';
  controlImg.style.width = '40px';
  controlImg.style.height = '36px';
  controlUI.appendChild(controlImg);

  // Setup the click event listeners
  var nav_menu = document.getElementById("nav");
  var map_div = document.getElementById("map");
  controlUI.addEventListener('click', function(e) {
    nav_menu.classList.toggle('open');
    e.stopPropagation();
  });
  map_div.addEventListener('click',function(e) {
    if (nav_menu.classList.contains('open')){
      nav_menu.classList.toggle('open');
      e.stopPropagation();
    }
  })
}
function initMap(initialLocation) {
  var mapDiv = document.getElementById('map');
  map = new google.maps.Map(mapDiv, {
    center: initialLocation,
    zoom: 8
  });
  var rightControlDiv = document.createElement('div');
  var rightControl = new RightControl(rightControlDiv, map);
  rightControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(rightControlDiv);
}

var submit_location = document.getElementById("submit_location");
submit_location.addEventListener('click', function(e){
  zoomToArea();
})

function zoomToArea() {
  // Initialize the geocoder.
  var geocoder = new google.maps.Geocoder();
  // Get the address or place that the user entered.
  var address = document.getElementById('input_location').value;
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert('You must enter an area, or address.');
  } else {
    geocoder.geocode(
      {address: address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var resultBounds = new google.maps.LatLngBounds(
            results[0].geometry.viewport.getSouthWest(),     results[0].geometry.viewport.getNorthEast()
          );
          map.fitBounds(resultBounds);
        } else {
          window.alert('We could not find that location - try entering a more' +
              ' specific place.');
        }
      });
  }
}
