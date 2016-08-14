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
function getUserLocation(){
  var userLocation = {};
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
      setViewModel(userLocation);
    }, function() {
      // handleNoGeolocation(browserSupportFlag);
      alert("User location not available, displaying Washington, DC");
      userLocation = {lat:38.9072, lng:77.0369};
      setViewModel(userLocation);
    });
  }
  // Browser doesn't support Geolocation
  else {
    alert("User location not available, displaying Washington, DC");
    userLocation = {lat:38.9072, lng:77.0369};
    setViewModel(userLocation);
  }
  console.log(userLocation);
  return userLocation;
}

function ViewModel(location) {
  var self = this;
  self.Map = ko.observable(location);
}

function setViewModel(location){
  viewModel = new ViewModel(location);
  ko.applyBindings(viewModel);
};

getUserLocation();
