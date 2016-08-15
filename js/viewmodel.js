// custom bindingHandlers
ko.bindingHandlers.map = {

  init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var mapObj = ko.utils.unwrapObservable(valueAccessor());
      var latLng = new google.maps.LatLng(
          ko.utils.unwrapObservable(mapObj.lat),
          ko.utils.unwrapObservable(mapObj.lng));
      var mapOptions = { center: latLng,
                        zoom: 8,
                      };

      mapObj.googleMap = new google.maps.Map(element, mapOptions);
  }
};

// get location, then set viewModel
function getUserLocation(callback){
  var userLocation = {};
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
      callback(userLocation);
    }, function() {
      // handleNoGeolocation(browserSupportFlag);
      alert("User location not available, displaying Washington, DC");
      userLocation = {lat:38.9072, lng:77.0369};
      callback(userLocation);
    });
  }
  // Browser doesn't support Geolocation
  else {
    alert("User location not available, displaying Washington, DC");
    userLocation = {lat:38.9072, lng:77.0369};
    callback(userLocation);
  }
  return userLocation;
}

function geocode(address){
  var geocoder = new google.maps.Geocoder();
  // Make sure the address isn't blank.
  if (address == '') {
    window.alert('You must enter an area, or address.');
  } else {
    geocoder.geocode(
      {address: address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          console.log(results);
        } else {
          window.alert('We could not find that location - try entering a more specific place.');
        }
    });
  }
}

function reverseGeocode(){

}

function ViewModel(location) {
  var self = this;
  self.Map = ko.observable(location);
  self.map_location = ko.observable("Alexandria, VA");
}

function setViewModel(location){
  viewModel = new ViewModel(location);
  ko.applyBindings(viewModel);
};

getUserLocation(setViewModel);
