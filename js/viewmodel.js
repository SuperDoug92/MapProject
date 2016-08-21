// custom bindingHandlers
ko.bindingHandlers.map = {

  init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    var mapObj = ko.utils.unwrapObservable(valueAccessor());
    var latLng = new google.maps.LatLng(
      ko.utils.unwrapObservable(mapObj.location)
    );
    var mapOptions = { center: latLng, zoom: 12};
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

var geocoder = new google.maps.Geocoder();

function geocode(address, callback){
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

var Map = function(location){
  var self = this;
  self.location = ko.observable(location);
  self.address = ko.observable();
  reverseGeocode(location, function(returned_address){
    self.address(returned_address);
  });
}
function ViewModel(location) {
  var self = this;
  self.Map = ko.observable(new Map(location));
}

function setViewModel(location){
  viewModel = new ViewModel(location);
  ko.applyBindings(viewModel);
};

getUserLocation(setViewModel);
