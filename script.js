// document.getElementById("foot01").innerHTML =
// "<p>&copy;  " + new Date().getFullYear() + " jokeefe94. All rights reserved.</p>";


function LondonBikes() {

	var self = this;

	self.settings = {
		dataUpdateFrequency: 180000, // 3 min
		walkingStrokeColor: 'red',
		bikingStrokeColor: 'blue'
	};

	self.map = null;
	self.startSearchBox = null;
	self.endSearchBox = null;

	self.startLocation = null;
	self.startStation = null;
	self.endLocation = null;
	self.endStation = null;

	self.directionsService = null;
	self.startWalkingDirectionsDisplay = null;
	self.bikingDirectionsDisplay = null;
	self.endWalkingDirectionsDisplay = null;

	self.stations = new Array();
	self.markers = new Array();

	var initialize = function(google) {
		initializeData();
		initializeMap(google);
		initializeDirections(google);
		addTestButton();
	}

	// Loads station data
	function initializeData() {
		self.stations = loadStations();
		// Reload the data when it is updated (every 3 minutes == 180000 ms)
		window.setInterval(function() {
			console.log("Reloaded stations");
			self.stations = loadStations();
		}, self.settings.dataUpdateFrequency);
	}

	// Setup google maps
	function initializeMap(google) {
		var mapOptions = {
			center: { lat: 51.507227, lng: -0.127211},
			zoom: 12
		};
		self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		// Add markers to the map
		// for (var i = 0; i < self.stations.length; i++) {
		// 	marker = self.stations[i].marker(google, self.map);
		// 	self.markers.push(marker);
		// }

		// Setup the search boxes
		var startSearchInput = (document.getElementById('start-input'));
		self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(startSearchInput);
		self.startSearchBox = new google.maps.places.SearchBox((startSearchInput));
		google.maps.event.addListener(self.startSearchBox, 'places_changed', startPlacesChanged);

		var endSearchInput = (document.getElementById('end-input'));
		self.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(endSearchInput);
		self.endSearchBox = new google.maps.places.SearchBox((endSearchInput));
		google.maps.event.addListener(self.endSearchBox, 'places_changed', endPlacesChanged);
		
		google.maps.event.addListener(self.map, 'bounds_changed', updateBounds);
	}

	// Setup for direction services
	function initializeDirections(google) {
		self.directionsService = new google.maps.DirectionsService();
		self.startWalkingDirectionsDisplay = new google.maps.DirectionsRenderer({
			map: self.map,
			preserveViewport: true,
			polylineOptions: {
				strokeColor: self.settings.walkingStrokeColor
			}
		});

		self.bikingDirectionsDisplay = new google.maps.DirectionsRenderer({
			map: self.map,
			preserveViewport: true,
			polylineOptions: {
				strokeColor: self.settings.bikingStrokeColor
			}
		});

		self.endWalkingDirectionsDisplay = new google.maps.DirectionsRenderer({
			map: self.map,
			preserveViewport: true,
			polylineOptions: {
				strokeColor: self.settings.walkingStrokeColor
			}
		});
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

	// Called when a user searches for a place in the start position search box.
	// NOTE: Too much code duplication b/w startPlacesChanged() and endPlacedChanged()
	function startPlacesChanged() {
		var places = self.startSearchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		// The location can be found by going to self.startLocation.geometry.location
		self.startLocation = places[0];
		var latLng = {lat:self.startLocation.geometry.location.lat(), lng: self.startLocation.geometry.location.lng()};
		self.startStation = findClosestStations(latLng);

		addMarkerToLocationAndStation(self.startLocation, self.startStation);
	}

	function endPlacesChanged() {
		var places = self.endSearchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		// The location can be found by going to self.startLocation.geometry.location
		self.endLocation = places[0];
		var latLng = {lat:self.endLocation.geometry.location.lat(), lng: self.endLocation.geometry.location.lng()};
		self.endStation = findClosestStations(latLng);

		addMarkerToLocationAndStation(self.endLocation, self.endStation);
	}

	function addMarkerToLocationAndStation(loc, station) {
		var searchMarker = new google.maps.Marker({
			position: loc.geometry.location,
			title: "Search Location",
			map: self.map
		});
		self.markers.push(searchMarker);
		self.markers.push(station.marker(google, self.map));
	}

	// Adds a marker to the map for the searched location and the closest bike station
	// function findStationAndAddMarker(loc) {
	// 	var searchMarker = new google.maps.Marker({
	// 		position: loc.geometry.location,
	// 		title: "Search Location",
	// 		map: self.map
	// 	});
	// 	self.markers.push(searchMarker);

	// 	var latLng = {lat:loc.geometry.location.lat(), lng: loc.geometry.location.lng()};
	// 	var station = findClosestStations(latLng);
	// 	if (station !== undefined) {
	// 		self.markers.push(station.marker(google, self.map));
	// 	}
	// 	else {
	// 		console.log("findClosestStations(%O) returned undefined", latLng);
	// 	}
	// }

	// Called when the map bounds change
	function updateBounds() {
		var bounds = self.map.getBounds();
		self.startSearchBox.setBounds(bounds);
		self.endSearchBox.setBounds(bounds);
	}

	// This could probably be faster...
	function findClosestStations(location) {
		var closestIdx = -1;
		var closestDist = Infinity;
		for (var i = 0; i < self.stations.length; i++) {
			var station = self.stations[i];
			var latLng = {lat : station.lat, lng : station.lng}
			var distance = distBetweenCoords(latLng, location);
			if (distance < closestDist) {
				closestDist = distance;
				closestIdx = i;
			}
		}
		return self.stations[closestIdx];
	}

	// Finds the distance in km to the closest bike station
	function distBetweenCoords(coord1, coord2) {
		var radius = 6371.0;
		var lat1 = degToRad(coord1.lat), lng1 = degToRad(coord1.lng);
		var lat2 = degToRad(coord2.lat), lng2 = degToRad(coord2.lng);
		var dLat = lat2 - lat1;
		var dLng = lng2 - lng1;
		var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLng / 2) * Math.sin(dLng /2) * Math.cos(lat1) * Math.cos(lat2);
		var c = 2.0 * Math.asin(Math.sqrt(a));
		return radius*c;
	}

	function degToRad(deg) {
		return deg/180.0 * Math.PI;
	}

	// Checks if the user has given enough information to get directions
	function canGetDirections() {
		return (self.startLocation !== null) && (self.startStation !== null) && (self.endLocation !== null) && (self.endStation !== null);
	}

	function getDirections() {
		if (canGetDirections()) {

			startWalkingRoute = {
				origin: self.startLocation.geometry.location,
				destination: new google.maps.LatLng(self.startStation.lat, self.startStation.lon),
				travelMode: google.maps.TravelMode.WALKING
			};

			bikingRoute = {
				origin: new google.maps.LatLng(self.startStation.lat, self.startStation.lon),
				destination: new google.maps.LatLng(self.endStation.lat, self.endStation.lon),
				travelMode: google.maps.TravelMode.BICYCLING
			};

			endWalkingRoute = {
				origin: new google.maps.LatLng(self.endStation.lat, self.endStation.lon),
				destination: self.endLocation.geometry.location,
				travelMode: google.maps.TravelMode.WALKING
			};

			self.directionsService.route(startWalkingRoute, function(result, status) {
				console.log("sw: %O, %s", result, status);
				if (status == google.maps.DirectionsStatus.OK) {
					self.startWalkingDirectionsDisplay.setDirections(result);
				}
			});
			self.directionsService.route(bikingRoute, function(result, status) {
				console.log("b: %O, %s", result, status);
				if (status == google.maps.DirectionsStatus.OK) {
					self.bikingDirectionsDisplay.setDirections(result);
				}
			});
			self.directionsService.route(endWalkingRoute, function(result, status) {
				console.log("ew: %O, %s", result, status);
				if (status == google.maps.DirectionsStatus.OK) {
					self.endWalkingDirectionsDisplay.setDirections(result);
				}
			});
		}
		else {
			console.log("sl: %O, ss: %O, el: %O, es: %O", self.startLocation, self.startStation, self.endLocation, self.endStation);
		}
	}

	function addTestButton() {
		var testBtnDiv = document.createElement('div');
		
		var testControl = new TestControl(testBtnDiv, function() {
			getDirections();
		});
		
		testBtnDiv.index = 1;
		self.map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(testBtnDiv);
	}

	// The only public function
	self.initialize = initialize;
}

function TestControl(controlDiv, onclick) {
	// Set CSS styles for the DIV containing the control
	// Setting padding to 5 px will offset the control
	// from the edge of the map
	controlDiv.style.padding = '5px';

	// Set CSS for the control border
	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = 'white';
	controlUI.style.borderStyle = 'solid';
	controlUI.style.borderWidth = '2px';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.title = 'Click to test a button';
	controlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var controlText = document.createElement('div');
	controlText.style.fontFamily = 'Arial,sans-serif';
	controlText.style.fontSize = '12px';
	controlText.style.paddingLeft = '4px';
	controlText.style.paddingRight = '4px';
	controlText.innerHTML = '<b>Test</b>';
	controlUI.appendChild(controlText);

	google.maps.event.addDomListener(controlUI, 'click', onclick);
}


// Represents a bike station in London
function Station(tfl_xml) {
	this.stationId = tfl_xml.getElementsByTagName("id")[0].childNodes[0].nodeValue;
	this.name = tfl_xml.getElementsByTagName("name")[0].childNodes[0].nodeValue;
	this.lat = Number(tfl_xml.getElementsByTagName("lat")[0].childNodes[0].nodeValue);
	this.lng = Number(tfl_xml.getElementsByTagName("long")[0].childNodes[0].nodeValue);
	this.bikes = Number(tfl_xml.getElementsByTagName("nbBikes")[0].childNodes[0].nodeValue);
	this.emptyBikes = Number(tfl_xml.getElementsByTagName("nbEmptyDocks")[0].childNodes[0].nodeValue);
	this.docks = Number(tfl_xml.getElementsByTagName("nbDocks")[0].childNodes[0].nodeValue);
}

// Creates a marker for the map
Station.prototype.marker = function(google, map) {
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(this.lat, this.lng),
		title: this.name,
		map: map
	});

	// Add the info window to the marker
	var infowindow = this.infoWindow(google);
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map, marker);
	});

	return marker;
};

// Creates the info window that is displayed when a user selects a station
Station.prototype.infoWindow = function(google) {
	var contentString =  '<div id="content">'+
		'<div id="siteNotice">'+
		'</div>'+
		'<p><b>' + this.name + '</b></p>'+
		'<p>' + this.bikes + ' / ' + this.docks + '</p>' +
		'</div>'+
		'</div>';

		return new google.maps.InfoWindow({
			content: contentString
		});
};

google.maps.event.addDomListener(window, 'load', function() {
	var app = new LondonBikes();
	app.initialize(google);
});