var latlng;
var address;
var map, geocoder;
var viewModel;
var polygons = [];
var YELP_BASE_URL = 'https://api.yelp.com/v2/search/?';
var polyPoint = function(lat,lng){
  this.lat = lat;
  this.lng = lng;
};

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

function googleError(){
  showAlert("An error occured loading google maps");
}

function showAlert(text){
  console.log($(".alert"), text);
  $(".alert").text(text);
  $(".alert").css('visibility', 'visible');
  $(".alert").toggleClass("fadeout");
}

function setViewModel(){
  viewModel = new ViewModel();
  ko.applyBindings(viewModel);
}
function getUserLocation(callback){
  var userLocation = {};
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      userLocation = {lat:position.coords.latitude, lng:position.coords.longitude};
      callback(userLocation);
    }, function() {
      // handleNoGeolocation(browserSupportFlag);
      showAlert("User location not available, displaying Washington, DC");
      userLocation = {lat:38.897299, lng:-77.0369};
      callback(userLocation);
    });
  }
  // Browser doesn't support Geolocation
  else {
    showAlert("User location not available, displaying Washington, DC");
    userLocation = {lat:38.9072, lng:-77.0369};
    callback(userLocation);
  }
  return userLocation;
}
function geocode(address, callback){
  // Make sure the address isn't blank.
  if (address === '') {
    window.alert('You must enter an area, or address.');
  } else {
    geocoder.geocode(
      {address: address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var resultBounds = new google.maps.LatLngBounds(
            results[0].geometry.viewport.getSouthWest(),     results[0].geometry.viewport.getNorthEast()
          );
          var newLatLng = {lat:results[0].geometry.location.lat(), lng:results[0].geometry.location.lng()};
          callback(newLatLng, resultBounds);
        } else {
          showAlert('We could not find that location - try entering a more specific place.');
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
            if(result[i].types[0]=="administrative_area_level_1"){components.push(result[i].long_name);}
            if(result[i].types[0]=="locality"){components.unshift(result[i].long_name);}
          }
          var address = components.join(', ');
        callback(address);
      } else {
        showAlert('No results found');
      }
    } else {
      showAlert('Geocoder failed due to: ' + status);
    }
  });
}
function CreateTravelTime(element, origin){
  var traveltime = new walkscore.TravelTime({
  map    : map,
  mode   : element.ttmode,
  time   : element.Time(),
  origin : origin,
  color  : element.Color,
  });
  traveltime.hide = function(){
    this._mapView.ctx_.canvas.style.display = 'none';
  };
  traveltime.on('show', function(data){
    var polyCoords = [];
    var count = 0;
    element.traveltime._data.forEach(function(array,index2){
      if (array[2]<=element.Time()*60){
        polyCoords[count]=[array[0],array[1]];
        count++;
      }
    });
    polyCoords = convexHull(polyCoords);
    polyCoords.forEach(function(array, index){
      polyCoords[index] = new polyPoint(array[0],array[1]);
    });
    element.polygon = new google.maps.Polygon({
      paths: polyCoords,
      strokeColor: element.Color,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '',
      fillOpacity: 0.0
    });
    polygons.push(element.polygon);
    element.polygon.setMap(map);
  });
  return traveltime;
}
function GetYelpData(category, address){
  function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
  }

  var yelp_url = YELP_BASE_URL;
    var parameters = {
      location: address,
      category_filter: category,
      oauth_consumer_key: Consumer_Key,
      oauth_token: Token,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version : '1.0',
      callback: 'cb'              // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };

    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, Consumer_Secret, Token_Secret);
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      success: function(results) {
        viewModel.DisplayYelpResults(results);
      },
      error: function (request, status, error){
        showAlert("Unable to retrieve yelp results");
      }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
}

function ViewModel() {
  var self = this;
  //map
  self.latlng = ko.observable(latlng);
  self.address = ko.observable(address);
  self.updateMap = function (data, event) {
    if (event.which == 13 || event.which == 1) {
      geocode(self.address(), function(newLatLng, resultBounds){
        map.fitBounds(resultBounds);
        self.latlng(newLatLng);
      });
    }
    return true;
  };

  //nav behavior
  self.navVisible = ko.observable(false);
  self.commuteVisible = ko.observable(false);
  self.yelpVisible = ko.observable(false);

  self.toggleNav = function(){
    self.navVisible(!self.navVisible());  };
  self.hideNav = function(){
    self.navVisible(false);
  };
  self.toggleCommute = function(){
    self.commuteVisible(!self.commuteVisible());
  };
  self.toggleyelp = function(){
    self.yelpVisible(!self.yelpVisible());
  };
  //polygons
  var commuteMode = function(Mode, Time, Color){
    this.Mode = Mode;
    this.Time = ko.observable(Time);
    this.Color = Color;
  };

  self.commuteModes = ko.observableArray([new commuteMode('Walk', undefined,'#008744'),
    new commuteMode('Drive',undefined,'#0057e7'),
    new commuteMode('Transit', undefined,'#d62d20'),
    new commuteMode('Bike', undefined,'#ffa700')
  ]);

  var bounds = new google.maps.LatLngBounds();

  var traveltimes = [];
  ko.utils.arrayForEach(self.commuteModes(),function(element, index){
      switch(element.Mode) {
        case 'Walk':
            element.ttmode = walkscore.TravelTime.Mode.WALK;
            break;
        case 'Drive':
            element.ttmode = walkscore.TravelTime.Mode.DRIVE;
            break;
        case 'Transit':
            element.ttmode = walkscore.TravelTime.Mode.TRANSIT;
            break;
        case 'Bike':
            element.ttmode = walkscore.TravelTime.Mode.BIKE;
            break;
        }
      origin = self.latlng().lat + "," + self.latlng().lng;
      if (typeof element.Time() != 'undefined'){
        element.traveltime = CreateTravelTime(element, origin);
        traveltimes.push(element.traveltime);
      }
  });

  var hideCtx = setInterval(function(){
    traveltimes.forEach(function(traveltime, index){
      if(typeof traveltime._mapView !== "undefined"){
        if(typeof traveltime._mapView.ctx_ !== "undefined"){
          if(typeof traveltime._mapView.ctx_.canvas !== "undefined"){
            traveltime.hide();
            clearInterval(hideCtx);
          }
        }
      }
    });
  },10);

  self.updatePolygon = function(commuteMode){
    if (commuteMode.polygon){
      commuteMode.polygon.setMap(null);
      polygons.splice(polygons.indexOf(commuteMode.polygon),1);
      delete commuteMode.polygon;
    }
    if (commuteMode.Time()>0){
      commuteMode.traveltime =
      CreateTravelTime(commuteMode,self.latlng().lat + "," + self.latlng().lng);
    }
    var hideUpdateCtx = setInterval(function(){
      if(typeof commuteMode.traveltime !== "undefined"){
        if(typeof commuteMode.traveltime._mapView !== "undefined"){
          if(typeof commuteMode.traveltime._mapView.ctx_ !== "undefined"){
            if(typeof commuteMode.traveltime._mapView.ctx_.canvas !== "undefined"){
              commuteMode.traveltime.hide();
              self.filterResults();
              clearInterval(hideUpdateCtx);
            }
          }
        }
      }
    },10);

  };

  //yelp category filter
  self.filter = ko.observable("Coffee & Tea");
  var displayCategories = categories.map(function(a) {return a.title;});
  self.filteredItems = ko.observable(displayCategories);

  self.updateYelp = function(){
    var MatchIndex = categories.findIndex(function(element){
      return element.title === self.filter();
    });
    if (MatchIndex >-1){
      var CategoryAlias = categories[MatchIndex].alias;
      markers.forEach(function(marker){
        marker.setMap(null);
        marker=null;
      });
      GetYelpData(CategoryAlias, self.address());
    }
  };

  //yelp data
  var markers = [];
  self.yelpResults = ko.observable("");

  self.DisplayYelpResults = function(results){
    self.yelpResults(results.businesses.map(function(obj){
      var nObj = {};
      nObj.location = {};
      nObj.location.lat = obj.location.coordinate.latitude;
      nObj.location.lng = obj.location.coordinate.longitude;
      nObj.name = obj.name;
      nObj.image_url = obj.image_url;
      nObj.rating_img_url = obj.rating_img_url;
      nObj.address = obj.location.address[1] + ", " + obj.location.city + ", " + obj.location.state;
      nObj.display = ko.observable(false);
      return nObj;
    }));
    markers = [];
    self.yelpResults().forEach(function(result, index){
      var googleLatLng =  new google.maps.LatLng(result.location);
      result.marker = new google.maps.Marker({
        position: googleLatLng,
        map: null,
        animation: google.maps.Animation.DROP,
        title: result.name,
        infowindow: new google.maps.InfoWindow({
          content: result.name + " (" + result.location.lat+ "," + result.location.lng + ")"
        })
      });
      result.marker.addListener('click', function(){
        self.toggleBounce(result);
      });
      markers.push(result.marker);
    });
    self.filterResults();
    self.toggleBounce = function(result) {
      markers.forEach(function(marker){
        if (marker !== result.marker){
          marker.infowindow.close();
          marker.setAnimation(null);
        }
      });
      result.marker.infowindow.open(map, result.marker);
      if (result.marker.getAnimation() !== null) {
        result.marker.setAnimation(null);
      } else {
        result.marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    };
  };
  self.updateYelp();

  self.filterResults = function(){
    self.yelpResults().forEach(function(result){
      self.commuteModes().forEach(function(commuteMode){
        if (commuteMode.polygon){
          if (google.maps.geometry.poly.containsLocation(result.marker.position, commuteMode.polygon)){
            selectAndAssign(commuteMode,result,true);
          }else{
            selectAndAssign(commuteMode,result,false);
          }
        }
        else{
          selectAndAssign(commuteMode,result,false);
        }
      });
      result.display(result.walk()||result.drive()||result.transit()||result.bike());
      if (polygons.length < 1) {
        result.display(true);
      }
      if (result.display() === true){
        result.marker.setMap(map);
      }
      else{
        result.marker.setMap(null);
      }
    });
  };

  }

function selectAndAssign(commuteMode, result, value){
  if (typeof result.walk === 'undefined'){result.walk = ko.observable(false);}
  if (typeof result.drive === 'undefined'){result.drive = ko.observable(false);}
  if (typeof result.transit === 'undefined'){result.transit = ko.observable(false);}
  if (typeof result.bike === 'undefined'){result.bike = ko.observable(false);}

  switch(commuteMode.Mode) {
    case 'Walk':
        result.walk(value);
        break;
    case 'Drive':
        result.drive(value);
        break;
    case 'Transit':
        result.transit(value);
        break;
    case 'Bike':
        result.bike(value);
        break;
    }
}

// function() {
//   if (marker.getAnimation() !== google.maps.Animation.BOUNCE) {
//     marker.setAnimation(null);
//   } else {
//     marker.setAnimation(google.maps.Animation.BOUNCE);
//   }
// }




//credit to: https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain for the below code
function cross(o, a, b) {
   return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

// /**
//  * @param points An array of [X, Y] coordinates
//  */
function convexHull(points) {
   points.sort(function(a, b) {
      return a[0] == b[0] ? a[1] - b[1] : a[0] - b[0];
   });

   var lower = [];
   for (var i = 0; i < points.length; i++) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], points[i]) <= 0) {
         lower.pop();
      }
      lower.push(points[i]);
   }

   var upper = [];
   for (i = points.length - 1; i >= 0; i--) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], points[i]) <= 0) {
         upper.pop();
      }
      upper.push(points[i]);
   }

   upper.pop();
   lower.pop();
   return lower.concat(upper);
}

var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length)
        return false;
    return string.substring(0, startsWith.length) === startsWith;
};
