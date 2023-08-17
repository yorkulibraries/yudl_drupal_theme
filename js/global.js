/**
 * @file
 * Global utilities.
 *
 */
(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.york_drupal_theme = {
    attach: function (context, settings) {

    }
  };

  // Description text below content display.
  $(document).ready(function() {
    var matchingElements = $("div[property='dcterms:description'] p");
    if (matchingElements.length === 1) {
      matchingElements.addClass("description-text");
    }
  });

})(jQuery, Drupal);
