// function RightControl(controlDiv, map) {
//
//   // Set CSS for the control border.
//   var controlUI = document.createElement('div');
//
// //   controlUI.id = "nav_control";
// //   controlUI.style.margin = '12px';
// //   controlUI.style.backgroundColor = '#fff';
// //   controlUI.style.border = '2px solid #fff';
// //   controlUI.style.borderRadius = '3px';
// //   controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
// //   controlUI.style.cursor = 'pointer';
// //   controlDiv.appendChild(controlUI);
// //
// //   // Set CSS for the control interior.
// //   var controlImg = document.createElement('img');
// //   controlImg.src='../images/menu_icon.png';
// //   controlImg.style.width = '40px';
// //   controlImg.style.height = '36px';
// //   controlUI.appendChild(controlImg);
// //
// //   // Setup the click event listeners
// //   var nav_menu = document.getElementById("nav");
// //   var map_div = document.getElementById("map");
// //   controlUI.addEventListener('click', function(e) {
// //     nav_menu.classList.toggle('open');
// //     e.stopPropagation();
// //   });
// //   map_div.addEventListener('click',function(e) {
// //     if (nav_menu.classList.contains('open')){
// //       nav_menu.classList.toggle('open');
// //       e.stopPropagation();
// //     }
// //   });
// // }
// // function initMap(initialLocation) {
// //   var mapDiv = document.getElementById('map');
// //   map = new google.maps.Map(mapDiv, {
// //     center: initialLocation,
// //     zoom: 8
// //   });
// //   var rightControlDiv = document.createElement('div');
// //   var rightControl = new RightControl(rightControlDiv, map);
// //   rightControlDiv.index = 1;
// //   map.controls[google.maps.ControlPosition.RIGHT_TOP].push(rightControlDiv);
// //   loadWiki();
// // }
// //
// // var submit_location = document.getElementById("submit_location");
// // submit_location.addEventListener('click', function(e){
// //   zoomToArea();
// //   loadWiki();
// // });
// // var address = document.getElementById('input_location');
// // address.addEventListener('keypress', function (e) {
// //   var key = e.which || e.keyCode;
// //   if (key === 13) {
// //     zoomToArea();
// //     loadWiki();
// //   }
// // });
// //
// // function zoomToArea() {
// //   // Initialize the geocoder.
//   var geocoder = new google.maps.Geocoder();
//   // Get the address or place that the user entered.
//   var address = document.getElementById('input_location').value;
//   // Make sure the address isn't blank.
//   if (address == '') {
//     window.alert('You must enter an area, or address.');
//   } else {
//     geocoder.geocode(
//       {address: address}, function(results, status) {
//         if (status == google.maps.GeocoderStatus.OK) {
// //           var resultBounds = new google.maps.LatLngBounds(
// //             results[0].geometry.viewport.getSouthWest(),     results[0].geometry.viewport.getNorthEast()
// //           );
// //           map.fitBounds(resultBounds);
//         } else {
//           window.alert('We could not find that location - try entering a more' +
//               ' specific place.');
//         }
//       });
//   }
// }
//
// function loadWiki(){
//   var $wikiElem = $('#wiki');
//   var geocoder = new google.maps.Geocoder();
//   var address;
//   geocoder.geocode({'location': map.center}, function(results, status) {
//     if (status === 'OK') {
//       if (results[1]) {
//         results[1].address_components.forEach(function(object){
//           if ($.inArray("locality", object.types)>-1 || $.inArray("sublocality_level_1", object.types)>-1){
//             address = object.long_name;
//           }
//           else if ($.inArray("administrative_area_level_1", object.types)>-1){
//             address += ", " + object.long_name;
//           }
//         });
//         sendWikiRequest(address);
//       }
//       else {
//         window.alert('No results found');
//       }
//     }
//     else {
//       window.alert('Geocoder failed due to: ' + status);
//     }
//   });
// }
// function sendWikiRequest(address){
//   var wikiURL = 'https://en.wikipedia.org/w/api.php';
//     wikiURL += '?' + $.param({
//       'action':'opensearch',
//       'search': address,
//       'format':'json',
//     });
//   $.ajax({
//     url: wikiURL,
//     dataType: 'jsonp',
//     headers: { 'Api-User-Agent': 'Example/1.0' },
//     success: function(data) {
//       $('#wiki-results').empty();
//       data[1].forEach(function(result,index){
//         var HTMLStr = "<a class='menu-link' target='_blank' href='" + data[3][index] +"'><h3>" +
//         result + "</h3><span>"+
//         data[2][index] + "</span></a><hr>";
//         $('#wiki-results').append(HTMLStr);
//       });
//     },
//     error: function(err){
//       console.log("JSONP failed");
//     }
//   });
// }
//
// $('#wiki-button').click(function(){
//   $('#wiki-results').toggleClass('show');
// });
