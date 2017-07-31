///////////////// MODEL //////////////////
var locations = [{
    title: "National World War I Museum",
    thingsToDo: "Museum",
    fourSquareVenueID: "4f9c0ba5e4b04dd7353a754d",
    location: {
      lat: 39.080949,
      lng: -94.58601199999998
    }
  },
  {
    title: "Westport",
    thingsToDo: "Westport",
    fourSquareVenueID: "4c0cb4de336220a17696c977",
    location: {
      lat: 39.0524993,
      lng: -94.5921098
    }
  },
  {
    title: "Country Club Plaza",
    thingsToDo: "Plaza",
    fourSquareVenueID: "4ad4c01ff964a52000f220e3",
    location: {
      lat: 39.0419634,
      lng: -94.59195790000001
    }
  },
  {
    title: "Kauffman Stadium",
    thingsToDo: "Stadium",
    fourSquareVenueID: "4b15505ef964a5206fb023e3",
    location: {
      lat: 39.0516719,
      lng: -94.48031420000001
    }
  },
  {
    title: "Power and Light District",
    thingsToDo: "PLD",
    fourSquareVenueID: "4b7b68c4f964a52068622fe3",
    location: {
      lat: 39.0977632,
      lng: -94.58114390000003
    }
  },
  {
    title: "Worlds of Fun",
    thingsToDo: "Fun",
    fourSquareVenueID: "4ad4c01df964a5208bf120e3",
    location: {
      lat: 39.173146,
      lng: -94.4867878
    }
  },
  {
    title: "Crown Center",
    thingsToDo: "Crown Center",
    fourSquareVenueID: "4ad4c01ff964a520fff120e3",
    location: {
      lat: 39.081005,
      lng: -94.58164999999997
    }
  },
  {
    title: "Science City",
    thingsToDo: "Science",
    fourSquareVenueID: "4ad4c01ef964a520aef120e3",
    location: {
      lat: 39.0856079,
      lng: -94.58601799999997
    }
  },
  {
    title: "Longview Lake",
    thingsToDo: "Lake",
    fourSquareVenueID: "4ad4c01ef964a520a6f120e3",
    location: {
      lat: 38.90611860000001,
      lng: -94.47353859999998
    }
  }

];
///////////////////////// GLOBAL VARIABLES ///////////////////////////////////
var map;
var markers = [];
var largeInfowindow;
var viewModel;
var bounds;
var streetViewService;
var allList = [];
var defaultIcon;
var highlightedIcon;
var mouseOver;
var getStreetView;
var windowContent;



/////////////////////////////////// Create a New Map //////////////////////////
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 39.0997265,
      lng: -94.57856670000001
    },
    zoom: 13
  });

  largeInfowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  viewModel = new ViewModel();
  ko.applyBindings(viewModel); 
  defaultIcon = makeMarkerIcon('0091ff'); // Listing marker icon
  highlightedIcon = makeMarkerIcon('FFFF24'); // When user hover over, highligted marker color
  mouseOver = makeMarkerIcon('298D3D');  // When clicked
  
}


function googleError() {
	console.log('Error: Google maps API has not loaded');
	$('#googleError').prepend('<p>Error: Google Maps failed to load. Please check your internet connection and try again.</p>');
}


////////////// This Function takes in a COLOR, and then creates a new marker ///////////
function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
	  
////////////////////////////////////////// LOCATION //////////////////////////
var Place = function(data) {
  update = ko.computed(function() {
    console.log(self.visible());
  });

};

function getStreetView(data, status) {
	if (status == google.maps.StreetViewStatus.OK) {
	  var nearStreetViewLocation = data.location.latLng;
	  var heading = google.maps.geometry.spherical.computeHeading(
		nearStreetViewLocation, nearStreetViewLocation);
	  var panoramaOptions = {
		position: nearStreetViewLocation,
		pov: {
		  heading: heading,
		  pitch: 30
		}
	  };
	  var panorama = new google.maps.StreetViewPanorama(
		document.getElementById('pano'), panoramaOptions);
	} else {
	  largeInfowindow.setContent(windowContent +
		'<div>No Street View Found</div>');
	}
  }

//////////////////////// FOURSQUARE REQUEST ////////////////////////

var foursquareApi = function(marker) {
  var apiURL = 'https://api.foursquare.com/v2/venues/';
  var foursquareClientID = 'MJME3IQDCOYSYGB4JHDKWIEWX0S2CYOQ1ABY1GIM20GN0DEE';
  var foursquareSecret = 'KUWSIHZIQLD02QTMBQD5MORUAPGUQO3OFTGO0I0DB4EXKCRK';
  var foursquareVersion = '20170720';
  var venueFoursquareID = marker.id;
  var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + foursquareClientID + '&client_secret=' + foursquareSecret + '&v=' + foursquareVersion;

  $.ajax({
    url: foursquareURL,
    success: function(data) {
		//compute the position of the streetview image, then calculate the heading
  
	  var rating = data.response.venue.rating ? data.response.venue.rating.toString() : "no rating" ;
      var name = data.response.venue.name;
      var location = data.response.venue.location.address ||
	       data.response.venue.location.formattedAddress ||
		   'No Address available';
	  streetViewService = new google.maps.StreetViewService();
      var radius = 50;
	  windowContent = name + "; FourSquare Rating: " + rating + "; " + location;
      largeInfowindow.setContent('<div style="font-weight:bold">' + name + "</div> FourSquare Rating: " + rating + "<br> Address: " + location + '<div id="pano"></div>');
      largeInfowindow.open(map, marker);
	  // Use streetview service to get the closest streetview image within
     // 50 meters of the markers position
     streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    },
    error: function(error) {
      alert("Error, Four Square api data could not display");
    }
  });
};

function clickAddListener(Place) {
      populateInfoWindow(this, largeInfowindow);
	  this.setIcon(mouseOver);
    }
function mouseoverAddListener() {
	if(!this.clicked){
            this.setIcon(highlightedIcon);
	}
          }		  
function mouseoutAddListener() {
	if(!this.clicked){
            this.setIcon(defaultIcon);
	}
          }
 
  ///////////////////////// SHOW INFOWINDOW WHEN THE MARKER IS CLICKED /////////////////
function populateInfoWindow(marker, infowindow) {
	foursquareApi(marker);
// Check to make sure infowindow is not alreade open
if (infowindow.marker != marker) {
	if(infowindow.marker){
		infowindow.marker.clicked = false;
		infowindow.marker.setIcon(defaultIcon);
	}
  infowindow.marker = marker;
  infowindow.marker.clicked = true;
  infowindow.setContent('<div>' + marker.title + '</div>');
  infowindow.open(map, marker);
  // make sure the marker property is cleared if the window is closed
  infowindow.addListener('closeclick', function() {
	  //If so, set the selected marker back to original color
  this.marker.setIcon(defaultIcon);
  this.marker.clicked = false;
  });
    
  // Open the infowindow on the correct marker.
  infowindow.open(map, marker);
}
}

		  
//////////////////////////// VIEWMODEL /////////////////////////////
var ViewModel = function() {

	var self = this;
	this.allList = ko.observableArray(locations);// Create allList variable and store them in observable array


  /******************* Let's use locations array to create an array of markers **************/
  for (var i = 0; i < locations.length; i++) {

    var position = locations[i].location;
    var title = locations[i].title;
	
  /********** New Marker for each location ***************/
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
	  icon: defaultIcon,
      animation: google.maps.Animation.DROP,
      id: locations[i].fourSquareVenueID
    });

    this.allList()[i].marker = marker;
    markers.push(marker); //push marker to the empty markers array that we created
    bounds.extend(marker.position); //Extend the boundaries for each marker

    /********* Create an onclick event to open an infowindow for each marker *********/
    marker.addListener('click', clickAddListener);
	
	/********* Two event listeners - one for mouseover, one for mouseout,
               to change the colors back and forth.                     ***************/
          marker.addListener('mouseover', mouseoverAddListener);
          marker.addListener('mouseout', mouseoutAddListener);
  }

  map.fitBounds(bounds);

  this.showWhenClicked = function(Location) {
    google.maps.event.trigger(Location.marker, 'click');
  };

	// ////////////////// Search Query /////////////////////////////////
	
	this.searchQuery = ko.observable("");  // Store user Input
	
	this.filteredList = ko.computed(function() { 
	return ko.utils.arrayFilter(self.allList(), function(listResult){		
		var result = listResult.title.toLowerCase().indexOf(self.searchQuery().toLowerCase());
		
		/******************* Display markers if they find match ********************/
		if(result === -1){
			listResult.marker.setVisible(false);
		}else{
			listResult.marker.setVisible(true);
		}
		return result >= 0;
	});  	
  });

};