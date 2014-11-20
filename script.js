// document.getElementById("foot01").innerHTML =
// "<p>&copy;  " + new Date().getFullYear() + " jokeefe94. All rights reserved.</p>";

function initialize() 
  {
    var mapOptions = {
      center: { lat: 51.507227, lng: -0.127211},
      zoom: 12
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));


  if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }
  else
  {// code for IE6, IE5
   xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.open("GET","http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml",false);
  xmlhttp.send();
  xmlDoc=xmlhttp.responseXML; 

  var x=xmlDoc.getElementsByTagName("station");

  var markers = new Array();
  for (i=0;i<x.length;i++)
  { 
     var myLatlng = new google.maps.LatLng(x[i].getElementsByTagName("lat")[0].childNodes[0].nodeValue,x[i].getElementsByTagName("long")[0].childNodes[0].nodeValue);

     var myTitle = x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue

    // To add the marker to the map, use the 'map' property
      markers[i] = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: myTitle
    }); 
  }
}

google.maps.event.addDomListener(window, 'load', initialize);