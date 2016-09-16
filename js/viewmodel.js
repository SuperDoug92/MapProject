var latlng;
var address;
var map, geocoder;
var viewModel;

function initMap(){
  geocoder = new google.maps.Geocoder();
  getUserLocation(function(coordinates){
    latlng = coordinates;
    map = new google.maps.Map(document.getElementById('map'), {center: latlng, zoom: 12});
    reverseGeocode(latlng,function(result){
      address = result;
      setViewModel();
    });
  });
}

function setViewModel(){
  viewModel = new ViewModel();
  ko.applyBindings(viewModel);
};

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
          var address = components.join(', ')
        callback(address);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function ViewModel() {
  var self = this;
  //map
  self.latlng = ko.observable(latlng);
  self.address = ko.observable(address);
  self.updateMap = function (data, event) {
    if (event.which == 13 || event.which == 1) {
      geocode(self.address(), function(returned_latlng){
        map.fitBounds(returned_latlng);
        self.latlng(returned_latlng);
      });
    }
    return true;
  };
  //nav behavior
  self.navVisible = ko.observable(false);
  self.commuteVisible = ko.observable(false);
  self.toggleNav = function(){
    self.navVisible(!self.navVisible());  }
  self.hideNav = function(){
    self.navVisible(false);
  }
  self.toggleCommute = function(){
    self.commuteVisible(!self.commuteVisible());
  }

  self.commuteModes = ko.observableArray([
    { Mode: 'Walk', Time: ko.observable(15)},
    { Mode: 'Drive', Time: ko.observable()},
    { Mode: 'Transit', Time: ko.observable(15)},
    { Mode: 'Bike', Time: ko.observable(15)}
  ]);

  // self.commutModes[0].Time.subscribe(function(val){
  //   resetTravelTime(0);
  // })

  var bounds = new google.maps.LatLngBounds();

  var traveltimes = [];
  ko.utils.arrayForEach(self.commuteModes(),function(element, index){
    if (typeof element.Time() != 'undefined'){
      var mode;
      switch(element.Mode) {
        case 'Walk':
            mode = walkscore.TravelTime.Mode.WALK;
            break;
        case 'Drive':
            mode = walkscore.TravelTime.Mode.DRIVE;
            break;
        case 'Transit':
            mode = walkscore.TravelTime.Mode.TRANSIT;
            break;
        case 'Bike':
            mode = walkscore.TravelTime.Mode.BIKE;
            break;
      }
      var origin = self.latlng().lat + "," + self.latlng().lng;
      var traveltime = new walkscore.TravelTime({
      map    : map,
      mode   : mode,
      time   : element.Time(),
      origin : origin,
      color  : '#0000FF',
      });
      traveltime.hide = function(){
        this._mapView.ctx_.canvas.style.display = 'none';
      }
      traveltimes.push(traveltime);
    }
  });

  setTimeout(function(){
    var ctx = traveltimes[0]._mapView.ctx_

    ctx.globalCompositeOperation = 'source-in';

    traveltimes.forEach(function(traveltime, index){
      if (index>0){
        traveltime.hide();
        ctx.drawImage(traveltime._mapView.ctx_.canvas,0,0);
      }
      // traveltime.hide();
    })
  },1000);

  // traveltimes[3].on('show', function(){
  //   bounds.extend(traveltimes[3].getBounds());
  // });
}
