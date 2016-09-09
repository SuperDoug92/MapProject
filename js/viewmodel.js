var latlng;
var map, geocoder;

function getUserLocation(callback){
  var userLocation = {};
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
      callback(userLocation);
    }, function() {
      // handleNoGeolocation(browserSupportFlag);
      $(".alert").show();
      $(".alert").toggleClass("fadeout");

      userLocation = {lat:38.897299, lng:-77.0369};
      callback(userLocation);
    });
  }
  // Browser doesn't support Geolocation
  else {
    $(".alert").show();
    $(".alert").toggleClass("fadeout");

    userLocation = {lat:38.9072, lng:-77.0369};
    callback(userLocation);
  }
  return userLocation;
}
function geocode(address, callback){
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
          callback(resultBounds);
        } else {
          window.alert('We could not find that location - try entering a more specific place.');
        }
    });
  }
}
function reverseGeocode(latlng, callback){
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results) {
        result=results[0].address_components;
          var components=[];
          for(var i=0;i<result.length;++i)
          {
            if(result[i].types[0]=="administrative_area_level_1"){components.push(result[i].long_name)}
            if(result[i].types[0]=="locality"){components.unshift(result[i].long_name)}
          }
        callback(components.join(', '));
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function ViewModel(location) {
  var self = this;
  //map
  self.address = ko.observable();
  self.updateMap = function (data, event) {
    if (event.which == 13 || event.which == 1) {
      geocode(self.address(), function(returned_latlng){
        map.fitBounds(returned_latlng);
        //self.Map.location = returned_latlng;
      });
    }
    return true;
  };
  //nav behavior
  self.navVisible = ko.observable(false);
  var nav_menu = $("#nav");
  var commute_form = $("#commute-form");
  self.toggleNav = function(){
    self.navVisible(!self.navVisible());  }
  self.hideNav = function(){
    self.navVisible(false);
  }
  self.toggleCommute = function(){
    commute_form.toggleClass("open");
  }

  var traveltime = new walkscore.TravelTime({
  map    : map,
  mode   : walkscore.TravelTime.Mode.WALK,
  time   : 10,
  origin : '38.823888,-77.0471498',
  color  : '#0000FF'
  });
  var bounds = new google.maps.LatLngBounds();
  traveltime.on('show', function(){
    bounds = traveltime.getBounds();
    map.fitBounds(bounds);
  });
}

function setViewModel(location){
  map = new google.maps.Map(document.getElementById('map'), {center: location, zoom: 12});
  viewModel = new ViewModel(location);
  ko.applyBindings(viewModel);
};

function initMap(){
  geocoder = new google.maps.Geocoder();
  getUserLocation(setViewModel);
}
