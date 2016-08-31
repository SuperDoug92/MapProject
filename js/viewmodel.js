// custom bindingHandlers
ko.bindingHandlers.map = {

  init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
    var mapObj = ko.utils.unwrapObservable(valueAccessor());
    var latLng = new google.maps.LatLng(
      ko.utils.unwrapObservable(mapObj.location)
    );
    var mapOptions = {center: latLng, zoom: 12};
    mapObj.googleMap = ko.observable(new google.maps.Map(element, mapOptions));
  }

};
// ko.bindingHandlers.TravelTime = {
//
//   init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
//     var TravelTimeObj = ko.utils.unwrapObservable(valueAccessor());
//
//     TravelTimeObj.traveltime = new walkscore.TravelTime({
//       map    : TravelTimeObj.map,
//       mode   : TravelTimeObj.mode,
//       time   : TravelTimeObj.time,
//       origin : TravelTimeObj.origin,
//       color  : TravelTimeObj.color
//     });
//   }
// };

// get location, then set viewModel
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
      // $(".alert").alert('close')
      // alert("User location not available, displaying Washington, DC");
      userLocation = {lat:38.897299, lng:-77.0369};
      callback(userLocation);
    });
  }
  // Browser doesn't support Geolocation
  else {
    $(".alert").show();
    $(".alert").toggleClass("fadeout");
    // $(".alert").alert('close')
    // alert("User location not available, displaying Washington, DC");
    userLocation = {lat:38.9072, lng:-77.0369};
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

var Map = function(location){
  var self = this;
  self.location = ko.observable(location);
  self.address = ko.observable();
  reverseGeocode(location, function(returned_address){
    self.address(returned_address);
  });
}
// var TravelTime = function(mode,time,latlng){
//   var self = this;
//   self.mode = mode;
//   self.time = time;
//   self.origin = ""
//   // latlng.lat + "," + latlng.lng
//   self.color = '#0000FF';
//   console.log(self);
// }
function ViewModel(location) {
  var self = this;
  //map
  self.Map = ko.observable(new Map(location));
  self.updateMap = function (data, event) {
    if (event.which == 13 || event.which == 1) {
      geocode(self.Map().address(), function(returned_latlng){
        self.Map().googleMap.fitBounds(returned_latlng);
        self.Map.location = returned_latlng;
      })
    }
    return true;
  };
  //nav behavior
  var nav_menu = $("#nav");
  var commute_form = $("#commute-form");
  self.toggleNav = function(){
    nav_menu.toggleClass("open");
  }
  self.hideNav = function(){
    nav_menu.removeClass("open");
  }
  self.toggleCommute = function(){
    commute_form.toggleClass("open");
    console.log(commute_form);
  }
  setTimeout(function(){
    var traveltime = new walkscore.TravelTime({
    map    : self.Map().googleMap(),
    mode   : walkscore.TravelTime.Mode.WALK,
    time   : 15,
    origin : '38.897299,-77.0369',
    color  : '#0000FF'
    });
    console.log(traveltime);
    console.log(traveltime.getBounds());
     var bounds = new google.maps.LatLngBounds()
     bounds.extend({lat:38.897299, lng:-77.0369})
     bounds.extend({lat:32, lng:-75})
    self.Map().googleMap().fitBounds(bounds);
  },500);

}

//   //traveltime
//   self.traveltime = ko.observable(new walkscore.TravelTime({
//     map    : self.Map().googleMap,
//     mode   : walkscore.TravelTime.Mode.WALK,
//     time   : 15,
//     origin : self.Map().location().lat + ","+self.Map().location().lng,
//     color  : '#0000FF',
//   }));
//
//   // self.traveltime().on('show', function(){
//   // setTimeout(function(){
//   console.log(self.traveltime().getBounds());
//     self.Map().fitBounds(self.traveltime().getBounds());
//   // },500);
//     // map.fitBounds(traveltime.getBounds());
//   // });
// }

function setViewModel(location){
  viewModel = new ViewModel(location);
  ko.applyBindings(viewModel);
};

getUserLocation(setViewModel);

// var map = new google.maps.Map(
//   document.getElementById("map_container"),
//   { mapTypeId: google.maps.MapTypeId.ROADMAP }
// );
// var traveltime = new walkscore.TravelTime({
//   map    : map,
//   mode   : walkscore.TravelTime.Mode.WALK,
//   time   : 15,
//   origin : '47.61460,-122.31704',
//   color  : '#0000FF'
// });
// traveltime.on('show', function(){
//   map.fitBounds(traveltime.getBounds());
// });
