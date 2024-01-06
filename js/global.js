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

  // Hide background on Explore Cat/Dogs pages.
  $(document).ready(function() {
    var body = document.body;
    if (body.classList.contains('page-view-explore-dogs') || body.classList.contains('page-view-explore-cats')) {
      body.classList.add('view-explore-no-background');
    }
  });

  // Hide "Download" section on items if it is empty.
  $(document).ready(function() {
    if ($('#download').find('.views-element-container').length === 2) {
      $('#download').hide();
    }
  });

})(jQuery, Drupal);
