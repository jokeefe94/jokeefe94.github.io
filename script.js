// document.getElementById("foot01").innerHTML =
// "<p>&copy;  " + new Date().getFullYear() + " jokeefe94. All rights reserved.</p>";


function LondonBikes() {

	var self = this;
	self.searchBox = null;
	self.map = null;
	self.stations = new Array();
	self.markers = new Array();

	var initialize = function(google) {
		self.stations = loadStations();
		initializeMap(google);
	}

	// Setup google maps
	function initializeMap(google) {
		var mapOptions = {
			center: { lat: 51.507227, lng: -0.127211},
			zoom: 12
		};
		self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		// Add markers to the map
		for (var i = 0; i < self.stations.length; i++) {
			marker = self.stations[i].marker(google, self.map);
			console.log("%O", marker);
			self.markers.push(marker);
		}

		var searchInput = (document.getElementById('pac-input'));
		self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchInput);
		self.searchBox = new google.maps.places.SearchBox((searchInput));

		google.maps.event.addListener(self.searchBox, 'places_changed', placesChanged);
		google.maps.event.addListener(map, 'bounds_changed', updateBounds);
	}

	// Loads all the stations from tfl.gov.uk and returns an array of Station objects
	function loadStations() {
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

		var stationsXml=xmlDoc.getElementsByTagName("station");
		var stations = new Array()
		for (var i=0; i < stationsXml.length; i++) 
		{
			stations.push(new Station(stationsXml[i]))
		}
		return stations
	}

	// Called when a user searches for a place in the search box
	function placesChanged() {
		var places = self.searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		for (var i = 0; i < places.length; i++) {
			console.log("%O", places[i]);
		}
	}

	// Called when the map bounds change
	function updateBounds() {
		var bounds = self.map.getBounds();
		self.searchBox.setBounds(bounds);
	}

	self.initialize = initialize;
}

// Represents a bike station in London
function Station(tfl_xml) {
	this.stationId = tfl_xml.getElementsByTagName("id")[0].childNodes[0].nodeValue;
	this.name = tfl_xml.getElementsByTagName("name")[0].childNodes[0].nodeValue;
	this.lat = tfl_xml.getElementsByTagName("lat")[0].childNodes[0].nodeValue;
	this.lng = tfl_xml.getElementsByTagName("long")[0].childNodes[0].nodeValue;
	this.bikes = tfl_xml.getElementsByTagName("nbBikes")[0].childNodes[0].nodeValue;
	this.emptyBikes = tfl_xml.getElementsByTagName("nbEmptyDocks")[0].childNodes[0].nodeValue;
	this.docks = tfl_xml.getElementsByTagName("nbDocks")[0].childNodes[0].nodeValue;
}

Station.prototype.marker = function(google, map) {
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(this.lat, this.lng),
		title: this.name,
		map: map
	});

	var contentString =  '<div id="content">'+
		'<div id="siteNotice">'+
		'</div>'+
		'<h1 id="firstHeading" class="firstHeading">' + this.name + '</h1>'+
		'<div id="bodyContent">'+
		'<p>' + this.bikes + ' / ' + this.docks + '</p>' +
		'</div>'+
		'</div>';

	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map, marker);
	});
	return marker;
};

google.maps.event.addDomListener(window, 'load', function() {
	var app = new LondonBikes();
	app.initialize(google);
});