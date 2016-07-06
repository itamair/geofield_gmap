(function ($, Drupal, drupalSettings) {

  Drupal.behaviors.geofieldMapInit = {
    attach: function (context, drupalSettings) {

      // Init all maps in drupalSettings.
      if (drupalSettings['geofield_gmap']) {
        $.each(drupalSettings['geofield_gmap'], function(mapid, options) {
          Drupal.geofieldMap.map_initialize({
            lat: options.lat,
            lng: options.lng,
            zoom: options.zoom,
            latid: options.latid,
            lngid: options.lngid,
            searchid: options.searchid,
            mapid: options.mapid,
            widget: options.widget,
            map_type: options.map_type,
            click_to_find_marker_id: options.click_to_find_marker_id,
            click_to_find_marker: options.click_to_find_marker,
            click_to_place_marker_id: options.click_to_place_marker_id,
            click_to_place_marker: options.click_to_place_marker
          });
        });

      }



    }
  };

  Drupal.geofieldMap = {

    geocoder: null,
    map_data: {},

    // Center the map to the marker location.
    find_marker: function (mapid) {
      var self = this;
      google.maps.event.trigger(self.map_data[mapid].map, 'resize');
      self.map_data[mapid].map.setCenter(self.map_data[mapid].marker.getPosition());
    },

    // Place marker at the current center of the map.
    place_marker: function (mapid) {
      var self = this;
      if (self.map_data[mapid].click_to_place_marker) {
        if (!window.confirm('Change marker position ?')) return;
      }

      google.maps.event.trigger(self.map_data[mapid].map, 'resize');
      var position = self.map_data[mapid].map.getCenter();
      self.map_data[mapid].marker.setPosition(position);
      self.map_data[mapid].lat.val(position.lat().toFixed(6));
      self.map_data[mapid].lng.val(position.lng().toFixed(6));

      if (self.map_data[mapid].search) {
        self.geocoder.geocode({'latLng': position}, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              self.map_data[mapid].search.val(results[0].formatted_address);
            }
          }
        });
      }
    },

    geofields_update: function (mapid, position) {
      var self = this;
      self.lat_lon_fields_update(mapid, position);
      self.reverse_geocode(mapid, position);
    },

    geofield_onchange: function (mapid) {
      var self = this;
      var location = new google.maps.LatLng(
        self.map_data[mapid].lat.val(),
        self.map_data[mapid].lng.val()
      );
      self.map_data[mapid].marker.setPosition(location);
      self.map_data[mapid].map.setCenter(location);
      self.reverse_geocode(mapid, location);
    },

    lat_lon_fields_update: function (mapid, position) {
      var self = this;
      self.map_data[mapid].lat.val(position.lat().toFixed(6));
      self.map_data[mapid].lng.val(position.lng().toFixed(6));
    },

    reverse_geocode: function (mapid, position) {
      var self = this;
      self.geocoder.geocode({'latLng': position}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0] && self.map_data[mapid].search) {
            self.map_data[mapid].search.val(results[0].formatted_address);
          }
        }
      });
    },

    // Init Geofield Map and its functions.
    map_initialize: function (params){
      this.map_data[params.mapid] = params;
      var self = this;
      jQuery.noConflict();

      // Define a google Geocoder, if not yet done.
      if (!self.geocoder) {
        self.geocoder = new google.maps.Geocoder();
      }

      // Define the Geocoder Search Field Selector;
      self.map_data[params.mapid].search = jQuery("#" + params.searchid);

      var location = new google.maps.LatLng(params.lat, params.lng);
      var options = {
        zoom: Number(params.zoom),
        center: location,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        scaleControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.LARGE
        }
      };

      switch (params.map_type) {
        case "ROADMAP":
          options.mapTypeId = google.maps.MapTypeId.ROADMAP;
          break;
        case "SATELLITE":
          options.mapTypeId = google.maps.MapTypeId.SATELLITE;
          break;
        case "HYBRID":
          options.mapTypeId = google.maps.MapTypeId.HYBRID;
          break;
        case "TERRAIN":
          options.mapTypeId = google.maps.MapTypeId.TERRAIN;
          break;
        default:
          options.mapTypeId = google.maps.MapTypeId.ROADMAP;
      }

      var map = new google.maps.Map(document.getElementById(self.map_data[params.mapid].mapid), options);

      // Define a a Drupal.geofield_gmap map self property.
      self.map_data[params.mapid].map = map;

      // Fix http://code.google.com/p/gmaps-api-issues/issues/detail?id=1448.
      google.maps.event.addListener(map, "idle", function () {
        google.maps.event.trigger(map, 'resize');
      });

      // Place map marker.
      var marker = new google.maps.Marker({
        map: map,
        draggable: params.widget
      });
      marker.setPosition(location);

      // Define a a Drupal.geofield_gmap marker self property.
      self.map_data[params.mapid].marker = marker;

      // Bind click to find_marker functionality.
      jQuery('#' + self.map_data[params.mapid].click_to_find_marker_id).click(function(e) {
        e.preventDefault();
        self.find_marker(self.map_data[params.mapid].mapid);
      });

      // Bind click to place_marker functionality.
      jQuery('#' + self.map_data[params.mapid].click_to_place_marker_id).click(function(e) {
        e.preventDefault();
        self.place_marker(self.map_data[params.mapid].mapid);
      });

      // Define Lat & Lng input selectors and all related functionalities and Geofield Map Listeners
      if (params.widget && params.latid && params.lngid) {
        self.map_data[params.mapid].lat = jQuery("#" + params.latid);
        self.map_data[params.mapid].lng = jQuery("#" + params.lngid);
        if (self.map_data[params.mapid].search) {
          self.map_data[params.mapid].search.autocomplete({
            // This bit uses the geocoder to fetch address values.
            source: function (request, response) {
              self.geocoder.geocode({'address': request.term }, function (results, status) {
                response(jQuery.map(results, function (item) {
                  return {
                    label: item.formatted_address,
                    value: item.formatted_address,
                    latitude: item.geometry.location.lat(),
                    longitude: item.geometry.location.lng()
                  };
                }));
              });
            },
            // This bit is executed upon selection of an address.
            select: function (event, ui) {
              var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
              // Set the location
              marker.setPosition(location);
              map.setCenter(location);
              // Fill the lat/lon fields with the new info
              self.lat_lon_fields_update(params.mapid, marker.getPosition());
            }
          });

          // Geocode user input on enter.
          self.map_data[params.mapid].search.keydown(function (e) {
            if (e.which == 13) {
              e.preventDefault();
              var input = self.map_data[params.mapid].search.val();
              // Execute the geocoder
              self.geocoder.geocode({'address': input }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  if (results[0]) {
                    // Set the location
                    var location = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    marker.setPosition(location);
                    map.setCenter(location);
                    // Fill the lat/lon fields with the new info
                    self.lat_lon_fields_update(params.mapid, marker.getPosition());
                  }
                }
              });
            }
          });

          // Add listener to marker for reverse geocoding.
          google.maps.event.addListener(marker, 'dragend', function () {
            self.geofields_update(params.mapid, marker.getPosition());
          });
        }

        // Change marker position with mouse click.
        google.maps.event.addListener(map, 'click', function (event) {
          var position = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
          marker.setPosition(position);
          self.geofields_update(params.mapid, position);
          //google.maps.event.trigger(map_data[params.mapid].map, 'resize');
        });

        // Events on Lat field change.
        jQuery('#' + self.map_data[params.mapid].latid).on('change', function(e) {
          self.geofield_onchange(params.mapid);
        }).keydown(function (e) {
          if (e.which == 13) {
            e.preventDefault();
            self.geofield_onchange(params.mapid);
          }
        });


        // Events on Lon field change.
        jQuery('#' + self.map_data[params.mapid].lngid).on('change', function(e) {
          self.geofield_onchange(params.mapid);
        }).keydown(function (e) {
          if (e.which == 13) {
            e.preventDefault();
            self.geofield_onchange(params.mapid);
          }
        });

        // Performs an initial reverse geocode from the Geofield.
        self.reverse_geocode(params.mapid, location);
      }
    }

  };

})(jQuery, Drupal, drupalSettings);
