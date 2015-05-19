;(function ($) {
  Drupal.behaviors.geofieldGeolocation = {
    attach: function (context, settings) {

      // Update map is values already set for location.
      if ($('.auto-geocode .geofield-lat', context).val() && $('.auto-geocode .geofield-lon', context).val()) {
        updateMapLocation($(context).find('.auto-geocode .geofield-lat').val(), $(context).find('.auto-geocode .geofield-lon').val())
      }

      // Don't do anything if we're on field configuration.
      if (!$("#edit-instance", context).length) {
        var fields = $(context);
        // Check that we have something to fill up
        // on multi values check only that the first one is empty.
        if ($('.auto-geocode .geofield-lat', fields).val() == '' && $('.auto-geocode .geofield-lon', fields).val() == '') {
          // Check to see if we have geolocation support, either natively or through Google.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(updateLocation);
          }
        }
      }
      $(':input[name="geofield-html5-geocode-button"]').once('geofield_geolocation').click(function(e) {
        e.preventDefault();
        fields = $(this).parents('.auto-geocode').parent();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(updateLocation);
        }
      })

      // Update the map marker.
      function updateMapLocation(lat, lon) {
        var pos = new google.maps.LatLng(lat, lon);
        geofield_gmap_data[Drupal.settings.geofield_gmap.mapid].marker.setPosition(pos);
        geofield_gmap_data[Drupal.settings.geofield_gmap.mapid].map.setCenter(pos);

        if (geofield_gmap_data[Drupal.settings.geofield_gmap.mapid].search) {
          geofield_gmap_geocoder.geocode({'latLng': pos}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                geofield_gmap_data[Drupal.settings.geofield_gmap.mapid].search.val(results[0].formatted_address);
              }
            }
          });
        }
      }

      // Callback for getCurrentPosition.
      function updateLocation(position) {
        $('.auto-geocode .geofield-lat', fields).val(position.coords.latitude);
        $('.auto-geocode .geofield-lon', fields).val(position.coords.longitude);
        updateMapLocation(position.coords.latitude, position.coords.longitude);
      }

    }
  };
})(jQuery);
