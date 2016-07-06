# Drupal 8 Proposed porting of the [Geofield Gmap module](https://www.drupal.org/project/geofield_gmap)


INTRODUCTION
------------

Geofield Gmap module provides a Google Map widget for [Geofield Module](https://www.drupal.org/project/geofield).
Represent the perfect option to input a Location / Geofield value to a content type, throughout an interactive Google Map widget.

INSTALLATION AND USE
---------------------

1. Install the module the drupal way [1]

2. In a Content Type including a Geofield Field, go to "Manage form display" and select "Geofield Gmap" as geofield Widget.

Specifications
---------------------

The Geofield Gmap Widgets provides interactive Map Click and Geo Marker Dragging functionalities to set Geofield Lat/Lon values.
An input search field is embedded in the Widget with Google Api Geocoding functionalities, for detailed Addresses Geocoding.

The Module settings comprehend the following options:

1. Use HTML5 Geolocation to find user location;
2. Choose among different Map Types (Roadmap, Satellite, Hybrid, Terrain);
2. Click to Find marker: Provides a button to recenter the map on the marker location;
3. Click to place marker: Provides a button to place the marker in the map center location;

[1] http://drupal.org/documentation/install/modules-themes/modules-8