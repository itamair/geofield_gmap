<?php

namespace Drupal\geofield_gmap\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\geofield\Plugin\Field\FieldWidget\GeofieldLatLonWidget;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'geofield_gmap' widget.
 *
 * @FieldWidget(
 *   id = "geofield_gmap",
 *   label = @Translation("Geofield Gmap"),
 *   field_types = {
 *     "geofield"
 *   }
 * )
 */
class GeofieldGmapWidget extends GeofieldLatLonWidget implements ContainerFactoryPluginInterface {

  use StringTranslationTrait;

  /**
   * The Translation service.
   *
   * @var \Drupal\Core\StringTranslation\TranslationInterface
   */
  protected $stringTranslation;

  /**
   * Lat Lon widget components.
   *
   * @var array
   */
  public $components = ['lon', 'lat'];

  /**
   * GeofieldMapWidget constructor.
   *
   * {@inheritdoc}
   *
   * @param \Drupal\Core\StringTranslation\TranslationInterface $string_translation
   *   The Translation service.
   */
  public function __construct(
    $plugin_id,
    $plugin_definition,
    FieldDefinitionInterface $field_definition,
    array $settings,
    array $third_party_settings,
    TranslationInterface $string_translation) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);
    $this->stringTranslation = $string_translation;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['third_party_settings'],
      $container->get('string_translation')
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return array(
      'map_type' => 'ROADMAP',
      'zoom_level' => 5,
      'click_to_find_marker' => FALSE,
      'click_to_place_marker' => FALSE,
    ) + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = parent::settingsForm($form, $form_state);

    $elements['#tree'] = TRUE;

    $elements['map_type'] = array(
      '#type' => 'select',
      '#title' => t('Map type'),
      '#default_value' => $this->getSetting('map_type'),
      '#options' => array(
        'ROADMAP' => t('Roadmap'),
        'SATELLITE' => t('Satellite'),
        'HYBRID' => t('Hybrid'),
        'TERRAIN' => t('Terrain'),
      ),
    );
    $elements['zoom_level'] = array(
      '#type' => 'number',
      '#min' => 4,
      '#max' => 14,
      '#title' => t('Default zoom level'),
      '#default_value' => $this->getSetting('zoom_level'),
      '#required' => FALSE,
    );
    $elements['click_to_find_marker'] = array(
      '#type' => 'checkbox',
      '#title' => t('Click to Find marker'),
      '#description' => $this->t('Provides a button to recenter the map on the marker location.'),
      '#default_value' => $this->getSetting('click_to_find_marker'),
    );
    $elements['click_to_place_marker'] = array(
      '#type' => 'checkbox',
      '#title' => t('Click to place marker'),
      '#description' => $this->t('Provides a button to place the marker in the center location.'),
      '#default_value' => $this->getSetting('click_to_place_marker'),
    );

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {

    $html5 = [
      '#markup' => $this->t('HTML5 Geolocation button: @state', array('@state' => $this->getSetting('html5_geolocation') ? t('enabled') : t('disabled'))),
    ];

    $map_zoom_level = [
      '#markup' => $this->t('Zoom Level: @state;', array('@state' => $this->getSetting('zoom_level'))),
    ];

    $map_center = [
      '#markup' => $this->t('Click to find marker: @state', array('@state' => $this->getSetting('click_to_find_marker') ? t('enabled') : t('disabled'))),
    ];

    $marker_center = [
      '#markup' => $this->t('Click to place marker: @state', array('@state' => $this->getSetting('click_to_place_marker') ? t('enabled') : t('disabled'))),
    ];

    $geoaddress_field_field = [
      '#markup' => $this->t('Geoaddress Field: @state', array('@state' => ('0' != $this->getSetting('geoaddress_field')['field']) ? $this->getSetting('geoaddress_field')['field'] : $this->t('- any -'))),
    ];

    $geoaddress_field_hidden = [
      '#markup' => ('0' != $this->getSetting('geoaddress_field')['field']) ? $this->t('Geoaddress Field Hidden: @state', array('@state' => $this->getSetting('geoaddress_field')['hidden'])) : '',
    ];

    $geoaddress_field_disabled = [
      '#markup' => ('0' != $this->getSetting('geoaddress_field')['field']) ? $this->t('Geoaddress Field Disabled: @state', array('@state' => $this->getSetting('geoaddress_field')['disabled'])) : '',
    ];

    $container = [
      'html5' => $html5,
      'map_zoom_level' => $map_zoom_level,
      'map_center' => $map_center,
      'marker_center' => $marker_center,
      'field' => $geoaddress_field_field,
      'hidden' => $geoaddress_field_hidden,
      'disabled' => $geoaddress_field_disabled,
    ];

    return $container;
  }

  /**
   * Implements \Drupal\field\Plugin\Type\Widget\WidgetInterface::formElement().
   *
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $latlon_value = array();

    foreach ($this->components as $component) {
      $latlon_value[$component] = isset($items[$delta]->{$component}) ? floatval($items[$delta]->{$component}) : '';
    }

    $element += array(
      '#type' => 'geofield_gmap',
      '#default_value' => $latlon_value,
      '#geolocation' => $this->getSetting('html5_geolocation'),
      '#geofield_gmap_geolocation_override' => $this->getSetting('html5_geolocation'),
      '#map_type' => $this->getSetting('map_type'),
      '#zoom_level' => $this->getSetting('zoom_level'),
      '#click_to_find_marker' => $this->getSetting('click_to_find_marker'),
      '#click_to_place_marker' => $this->getSetting('click_to_place_marker'),
      '#error_label' => !empty($element['#title']) ? $element['#title'] : $this->fieldDefinition->getLabel(),
    );

    return array('value' => $element);
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    foreach ($values as $delta => $value) {
      foreach ($this->components as $component) {
        if (empty($value['value'][$component]) || !is_numeric($value['value'][$component])) {
          $values[$delta]['value'] = '';
          continue 2;
        }
      }
      $components = $value['value'];
      $values[$delta]['value'] = \Drupal::service('geofield.wkt_generator')->WktBuildPoint(array($components['lon'], $components['lat']));
    }

    return $values;
  }

}
