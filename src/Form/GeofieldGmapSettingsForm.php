<?php

namespace Drupal\geofield_gmap\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class GeofieldGmapSettingsForm.
 *
 * @package Drupal\geofield_gmap\Form
 */
class GeofieldGmapSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'geofield_gmap_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['geofield_gmap.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $config = $this->config('geofield_gmap.config');

    $form['geofield_gmap_api_key'] = array(
      '#type' => 'textfield',
      '#title' => $this->t("Google Api Key"),
      '#default_value' => $config->get('defaults.gmap_api_key'),
    );

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    // Save the config values.
    $this->config('geofield_gmap.config')
      ->set('defaults.gmap_api_key', $form_state->getValue('geofield_gmap_api_key'))
      ->save();

    // Invalidate the cached library info, to allow this key to be included
    // again in the gmaps library.
    Cache::invalidateTags(['library_info']);

    parent::submitForm($form, $form_state);
  }

}
