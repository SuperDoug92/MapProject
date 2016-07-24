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

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
  });

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
