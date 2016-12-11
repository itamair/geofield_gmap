<?php

namespace Drupal\geofield_gmap\Element;

use Drupal\Core\Form\FormStateInterface;
use Drupal\geofield\Element\GeofieldElementBase;

/**
 * Provides a Geofield Gmap form element.
 *
 * @FormElement("geofield_gmap")
 */
class GeofieldGmap extends GeofieldElementBase {

  /**
   * {@inheritdoc}
   */
  public static $components = array(
    'lat' => array(
      'title' => 'Latitude',
      'range' => 90,
    ),
    'lon' => array(
      'title' => 'Longitude',
      'range' => 180,
    ),
  );

  /**
   * {@inheritdoc}
   */
  public function getInfo() {
    $class = get_class($this);
    return array(
      '#input' => TRUE,
      '#process' => array(
        array($class, 'latLonProcess'),
      ),
      '#element_validate' => array(
        array($class, 'elementValidate'),
      ),
      '#theme_wrappers' => array('fieldset'),
    );
  }

  /**
   * Generates the Geofield Gmap form element.
   *
   * @param array $element
   *   An associative array containing the properties and children of the
   *   element. Note that $element must be taken by reference here, so processed
   *   child elements are taken over into $form_state.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param array $complete_form
   *   The complete form structure.
   *
   * @return array
   *   The processed element.
   */
  public static function latLonProcess(&$element, FormStateInterface $form_state, &$complete_form) {

    // Attach GMAP API.
    $element['#attached']['library'][] = 'geofield_gmap/google_maps';

    $gmapid = 'gmap-' . $element['#id'];

    $element['gmap'] = [
      '#type' => 'fieldset',
      '#weight' => 0,
    ];

    $element['gmap']['geocode'] = array(
      '#prefix' => '<label>' . t("Geocode address") . '</label>',
      '#type' => 'textfield',
      '#placeholder' => t("Input you search location"),
      '#size' => 60,
      '#maxlength' => 128,
      '#attributes' => [
        'id' => 'search-' . $element['#id'],
        'class' => ['form-text', 'form-autocomplete', 'geofield-gmap-search'],
      ],
    );

    $element['gmap']['geofield_gmap'] = array(
      '#type' => 'html_tag',
      '#tag' => 'div',
      '#value' => '',
      '#attributes' => [
        'id' => $gmapid,
        'class' => ['geofield-gmap-cnt'],
      ],
    );

    $element['gmap']['actions'] = [
      '#type' => 'actions',
    ];

    if (!empty($element['#click_to_find_marker']) && $element['#click_to_find_marker'] == TRUE) {
      $element['gmap']['actions']['click_to_find_marker'] = array(
        '#type' => 'button',
        '#value' => t('Find marker'),
        '#name' => 'geofield-gmap-center',
        '#attributes' => [
          'id' => $element['#id'] . '-click-to-find-marker',
        ],
      );
      $element['#attributes']['class'] = ['geofield-gmap-center'];
    }

    if (!empty($element['#click_to_place_marker']) && $element['#click_to_place_marker'] == TRUE) {
      $element['gmap']['actions']['click_to_place_marker'] = array(
        '#type' => 'button',
        '#value' => t('Place marker here'),
        '#name' => 'geofield-gmap-marker',
        '#attributes' => [
          'id' => $element['#id'] . '-click-to-place-marker',
        ],
      );
      $element['#attributes']['class'] = ['geofield-gmap-marker'];
    }

    if (!empty($element['#geolocation']) && $element['#geolocation'] == TRUE) {
      $element['#attached']['library'][] = 'geofield_gmap/geolocation';
      $element['gmap']['actions']['geolocation'] = array(
        '#type' => 'button',
        '#value' => t('Find my location'),
        '#name' => 'geofield-html5-geocode-button',
        '#attributes' => ['mapid' => $gmapid],
      );
      $element['#attributes']['class'] = ['auto-geocode'];
    }

    static::elementProcess($element, $form_state, $complete_form);

    $element['lat']['#attributes']['id'] = 'lat-' . $element['#id'];
    $element['lon']['#attributes']['id'] = 'lon-' . $element['#id'];

    // Attach Geofield Gmap Library.
    $element['#attached']['library'][] = 'geofield_gmap/geofield_gmap';

    $settings = [
      $gmapid => [
        'id' => $element['#id'],
        'name' => $element['#name'],
        'lat' => floatval($element['lat']['#default_value']),
        'lng' => floatval($element['lon']['#default_value']),
        'zoom' => $element['#zoom_level'],
        'latid' => $element['lat']['#attributes']['id'],
        'lngid' => $element['lon']['#attributes']['id'],
        'searchid' => $element['gmap']['geocode']['#attributes']['id'],
        'mapid' => $gmapid,
        'widget' => TRUE,
        'map_type' => $element['#map_type'],
        'click_to_find_marker_id' => $element['#click_to_find_marker'] ? $element['map']['actions']['click_to_find_marker']['#attributes']['id'] : NULL,
        'click_to_find_marker' => $element['#click_to_find_marker'] ? TRUE : FALSE,
        'click_to_place_marker_id' => $element['#click_to_place_marker'] ? $element['map']['actions']['click_to_place_marker']['#attributes']['id'] : NULL,
        'click_to_place_marker' => $element['#click_to_place_marker'] ? TRUE : FALSE,
      ],
    ];

    $element['#attached']['drupalSettings'] = [
      'geofield_gmap' => $settings,
    ];
    return $element;
  }

}
