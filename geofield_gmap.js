//Useful links:
// http://code.google.com/apis/maps/documentation/javascript/reference.html#Marker
// http://code.google.com/apis/maps/documentation/javascript/services.html#Geocoding
// http://jqueryui.com/demos/autocomplete/#remote-with-cache


var geofield_gmap_geocoder;
var geofield_gmap_data = new Array;

function geofield_gmap_center(mapid) {
	google.maps.event.trigger(geofield_gmap_data[mapid].map, 'resize');
	geofield_gmap_data[mapid].map.setCenter(geofield_gmap_data[mapid].marker.getPosition());
}

function geofield_gmap_marker(mapid) {
	google.maps.event.trigger(geofield_gmap_data[mapid].map, 'resize');
	var position = geofield_gmap_data[mapid].map.getCenter();
	geofield_gmap_data[mapid].marker.setPosition(position);
	geofield_gmap_data[mapid].lat.val(Math.round(position.lat()*10000)/10000);
	geofield_gmap_data[mapid].lng.val(Math.round(position.lng()*10000)/10000);
	
	if (geofield_gmap_data[mapid].search) {
		geofield_gmap_geocoder.geocode({'latLng': position}, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
	        if (results[0]) {
	        	geofield_gmap_data[mapid].search.val(results[0].formatted_address);
	        }
	      }
	    });
	}
}

function geofield_gmap_initialize(params){
	jQuery.noConflict();
	
	if (!geofield_gmap_geocoder) {
		geofield_gmap_geocoder = new google.maps.Geocoder();
	}

  var location = new google.maps.LatLng(params.lat, params.lng);
        
  var map = new google.maps.Map(document.getElementById(params.mapid), {
	    zoom: 12,
	    center: location,
	    mapTypeId: google.maps.MapTypeId.SATELLITE,
	    scaleControl: true,
	    zoomControlOptions: {
	    	style: google.maps.ZoomControlStyle.LARGE,
	    },
	  });
  
  // fix http://code.google.com/p/gmaps-api-issues/issues/detail?id=1448
  google.maps.event.addListener(map, "idle", function(){
		google.maps.event.trigger(map, 'resize'); 
	});	  
  
  var marker = new google.maps.Marker({
    map: map,
    draggable: params.widget,
  });
  geofield_gmap_data[params.mapid] = {
		  map: map,
		  marker: marker,
		};
  
  marker.setPosition(location);
  
  if (params.widget && params.latid && params.lngid) {
  
	  geofield_gmap_data[params.mapid].lat = jQuery("#" + params.latid);
	  geofield_gmap_data[params.mapid].lng = jQuery("#" + params.lngid);
	  
	  if (params.searchid) {
		geofield_gmap_data[params.mapid].search = jQuery("#" + params.searchid);
		jQuery("#" + params.searchid).autocomplete({
	      //This bit uses the geocoder to fetch address values
	      source: function(request, response) {
	        geofield_gmap_geocoder.geocode( {'address': request.term }, function(results, status) {
	          response(jQuery.map(results, function(item) {
	            return {
	              label:  item.formatted_address,
	              value: item.formatted_address,
	              latitude: item.geometry.location.lat(),
	              longitude: item.geometry.location.lng()
	            }
	          }));
	        })
	      },
	      //This bit is executed upon selection of an address
	      select: function(event, ui) {
	    	jQuery("#" + params.latid).val(Math.round(ui.item.latitude*10000)/10000);
	    	jQuery("#" + params.lngid).val(Math.round(ui.item.longitude*10000)/10000);
	        var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
	        marker.setPosition(location);
	        map.setCenter(location);
	      }
	    });
	  }
  
	  //Add listener to marker for reverse geocoding
	  google.maps.event.addListener(marker, 'drag', function() {
	    geofield_gmap_geocoder.geocode({'latLng': marker.getPosition()}, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
	        if (results[0]) {
	          jQuery('#' + params.searchid).val(results[0].formatted_address);
	          jQuery("#" + params.latid).val(Math.round(marker.getPosition().lat()*10000)/10000);
	          jQuery("#" + params.lngid).val(Math.round(marker.getPosition().lng()*10000)/10000);
	        }
	      }
	    });
	  });
	  
	  onchange = function() {
		  var location = new google.maps.LatLng(
				  parseInt(jQuery("#" + params.latid).val()),
				  parseInt(jQuery("#" + params.lngid).val()));
		  marker.setPosition(location);
	      map.setCenter(location);
	  };
	  
	  jQuery("#" + params.latid).change(onchange);
	  jQuery("#" + params.lngid).change(onchange);
  }
}


