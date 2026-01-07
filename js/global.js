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

      // Collection download button: move under metadata and restyle as a CTA.
      var $downloadBlock = $download.length ? $download : $('fieldset.media-download', context);
      if ($downloadBlock.length && !$downloadBlock.hasClass('collection-download-processed')) {
        var $node = $downloadBlock.closest('.node');
        if (!$node.length) {
          $node = $('.node--type-islandora-object', context).first();
        }

        var $placementTarget = $node.find('.horizontal-tabs').first();
        if (!$placementTarget.length) {
          var $metadataRows = $node.find('.node__content .row.p-2.border-bottom');
          $placementTarget = $metadataRows.length ? $metadataRows.last() : $node.find('.node__content').first();
        }

        if ($placementTarget.length) {
          $downloadBlock.insertAfter($placementTarget);
        }

        $downloadBlock.find('legend').remove();
        $downloadBlock.addClass('collection-download collection-download-processed');

        var $downloadLink = $downloadBlock.find('a').first();
        if ($downloadLink.length) {
          var originalText = $.trim($downloadLink.text());
          $downloadLink.text('Download');
          var ariaLabel = originalText ? 'Download ' + originalText : 'Download';
          $downloadLink.attr({
            'aria-label': ariaLabel,
            'title': ariaLabel
          });
          $downloadLink.addClass('btn btn-primary btn-lg d-inline-flex align-items-center gap-2 collection-download__link');
          if ($downloadLink.find('.fa-download').length === 0) {
            $downloadLink.prepend('<i class="fa-solid fa-download collection-download__icon" aria-hidden="true"></i>');
          }

          var $fieldContent = $downloadLink.closest('.field-content');
          if ($fieldContent.length) {
            $fieldContent.contents().filter(function () {
              return this.nodeType === 3 && $.trim(this.nodeValue).length;
            }).remove();
          }

          var $downloadParagraph = $downloadLink.closest('p');
          if ($downloadParagraph.length) {
            $downloadParagraph.contents().filter(function () {
              return this !== $downloadLink[0];
            }).remove();
          }

          $downloadLink.detach();

          var $downloadMessage = $downloadBlock.find("p:contains('If a high resolution copy of the file is needed'), p:contains('If a high-resolution copy of the file is needed')");
          var $inlineContainer = $('<div class="collection-download__inline d-flex flex-wrap align-items-center gap-3"></div>');
          var $buttonWrapper = $('<div class="collection-download__button"></div>').append($downloadLink);
          $inlineContainer.append($buttonWrapper);

          if ($downloadMessage.length) {
            $downloadMessage.each(function () {
              var $msg = $(this);
              $msg.find('br').remove();
              var $msgSpan = $('<span class="collection-download__message"></span>').append($msg.contents());
              $inlineContainer.append($msgSpan);
              $msg.remove();
            });
          }

          var $fieldsetWrapper = $downloadBlock.find('.fieldset-wrapper').first();
          if ($fieldsetWrapper.length) {
            $fieldsetWrapper.prepend($inlineContainer);
          } else {
            $downloadBlock.prepend($inlineContainer);
          }

          $downloadBlock.find('p').filter(function () {
            var $p = $(this);
            return $.trim($p.text()).length === 0 && $p.find('a').length === 0;
          }).remove();
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
