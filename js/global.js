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
    var titleElements = $("span[property='dcterms:title']");
    var matchingElements = $("div[property='dcterms:description'] p");
    if (titleElements.length <=2) {
      matchingElements.addClass("description-text");
    }
  });

})(jQuery, Drupal);
