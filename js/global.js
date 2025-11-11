/**
 * @file
 * Global utilities.
 *
 */
(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.york_drupal_theme = {
    attach: function (context, settings) {

      // Helper function: treat a container as empty if it contains no visible text
      // and no meaningful media/file/link content (ignores Drupal contextual placeholders).
      function isVisuallyEmpty($container) {
        if ($container.text().trim().length > 0) {
          return false;
        }
        // Any meaningful nodes?
        if ($container.find('img, video, audio, iframe, object, embed, a[href], .file, .download, .views-row, table, ul li').length > 0) {
          return false;
        }
        // Make sure any child nodes are only contextual placeholders (data-contextual-* or empty wrappers).
        var $meaningful = $container.find('*').filter(function () {
          var $el = $(this);
          // Ignore known contextual placeholders.
          if ($el.is('[data-contextual-id], [data-contextual-token], [data-drupal-ajax-container]')) {
            return false;
          }
          // If element has text or meaningful children, it's meaningful.
          if ($el.text().trim().length > 0) {
            return true;
          }
          if ($el.find('img, video, audio, a[href], .file, .views-row').length > 0) {
            return true;
          }
          return false;
        });

        return $meaningful.length === 0;
      }

      // Hide Download section on a specific edge case.
      var $download = $('#download', context);
      if ($download.length) {
        var $containers = $download.find('.views-element-container');
        if ($containers.length > 0) {
          var allEmpty = true;
          $containers.each(function () {
            var $c = $(this);
            if (!isVisuallyEmpty($c)) {
              allEmpty = false;
              return false;
            }
          });
          if (allEmpty) {
            $download.hide();
          } else {
            $download.show();
          }
        }
      }

      // Hide .media-download if both contextual containers are visually empty.
      var $contextualContainers = $('.media-download .views-element-container.contextual-region', context);
      if ($contextualContainers.length === 2) {
        var bothEmpty = $contextualContainers.filter(function () {
          return isVisuallyEmpty($(this));
        }).length === 2;
        if (bothEmpty) {
          $('.media-download', context).hide();
        } else {
          $('.media-download', context).show();
        }
      }

      // Description text below content display.
      var titleElements = $("span[property='dcterms:title']", context);
      var matchingElements = $("div[property='dcterms:description'] p", context);
      if (titleElements.length <= 2) {
        matchingElements.addClass("description-text");
      }

      // Hide background on Explore Cat/Dogs pages.
      // https://digital.library.yorku.ca/explore/toronto-telegram/cats
      // https://digital.library.yorku.ca/explore/toronto-telegram/dogs
      var body = document.body;
      if (body.classList.contains('page-view-explore-dogs') || body.classList.contains('page-view-explore-cats')) {
        body.classList.add('view-explore-no-background');
      }

      // Hide high resolution text on The Golha Programmes items.
      var breadcrumbLinkExists = $("a[href='/sound-and-moving-image-library-smil/golha-programmes']", context).length > 0;
      if (breadcrumbLinkExists) {
        $(".views-field.views-field-field-media-audio-file .field-content p:contains('If a high resolution copy of the file is needed')", context).hide();
      }

      // Hide Download link for Tagoona, Nelson videos.
      if ($(context).find('a[href="/person/tagoona-nelson"]').length) {
        var $fieldset = $(context).find('fieldset.media-download');
        if ($fieldset.length) {
          $fieldset.hide();
        }
      }
    }
  };

})(jQuery, Drupal);

