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

  // Hide Download section on a specific edge case.
  $(document).ready(function() {
    if ($('#download').find('.views-element-container').length > 0) {
      var containerChildren = $('#download').find('.views-element-container');

      if (
        containerChildren.length === 2 &&
        $(containerChildren[0]).is(':empty') &&
        $(containerChildren[1]).is(':empty')
      ) {
        $('#download').hide();
      }
    }

    var $contextualContainers = $('.media-download .views-element-container.contextual-region');

    if ($contextualContainers.length === 2 && $contextualContainers.filter(':empty').length === 2) {
      $('.media-download').hide();
    }
  });

  // Hide high resolution text on The Golha Programmes items.
  $(document).ready(function() {
    var breadcrumbLinkExists = $("a[href='/sound-and-moving-image-library-smil/golha-programmes']").length > 0;
    if (breadcrumbLinkExists) {
        $(".views-field.views-field-field-media-audio-file .field-content p:contains('If a high resolution copy of the file is needed')").hide();
    }
  });

  // Hide Download link for Tagoona, Nelson videos.
  $(document).ready(function() {
    if (document.querySelector('a[href="/person/tagoona-nelson"]')) {
        var fieldset = document.querySelector('fieldset.media-download');
        if (fieldset) {
          fieldset.style.display = 'none';
        }
    }
  });

})(jQuery, Drupal);
