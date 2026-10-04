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

      function truncateSubject(subject) {
        var maxLength = 150;
        if (subject.length <= maxLength) {
          return subject;
        }
        return subject.substring(0, maxLength - 3).trim() + '...';
      }

      function getObjectTitle($node) {
        var $title = $node.find("span[property='dcterms:title']").first();
        if (!$title.length) {
          $title = $('h1, .node__title, .page-title').first();
        }
        var title = String($title.text() || '').trim();
        if (!title) {
          title = String(document.title.split('|')[0] || '').trim();
        }
        return title;
      }

      function buildHighResolutionRequestUrl(originalHref, $node) {
        var title = getObjectTitle($node);
        var pageUrl = window.location.origin + window.location.pathname;
        var message = [
          title,
          pageUrl,
          '"Please provide any additional details or information you feel is necessary."'
        ].join('\n');
        var baseHref = originalHref || '/contact';
        var url = new URL(baseHref, window.location.origin);
        if (url.pathname === '/contact') {
          url = new URL('/contact', window.location.origin);
        }

        url.searchParams.set('subject', truncateSubject('[High resolution] - ' + title));
        url.searchParams.set('category', 'High Resolution Copy');
        url.searchParams.set('message', message);

        return url.toString();
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
          var originalText = String($downloadLink.text() || '').trim();
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
              return this.nodeType === 3 && String(this.nodeValue || '').trim().length;
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

          if ($downloadMessage.length) {
            $downloadMessage.each(function () {
              var $msg = $(this);
              $msg.find('br').remove();

              var $contactLink = $msg.find('a').first();
              if ($contactLink.length) {
                var $requestLink = $('<a class="collection-download__request"><i class="fa-solid fa-envelope collection-download__icon" aria-hidden="true"></i>Request high resolution</a>');
                $requestLink.attr({
                  'href': buildHighResolutionRequestUrl($contactLink.attr('href'), $node),
                  'title': 'Request a high resolution copy',
                  'aria-label': 'Request a high resolution copy'
                });
                if ($contactLink.attr('target')) {
                  $requestLink.attr('target', $contactLink.attr('target'));
                }
                if ($contactLink.attr('rel')) {
                  $requestLink.attr('rel', $contactLink.attr('rel'));
                }
                $inlineContainer.append($requestLink);
              } else {
                var $msgSpan = $('<span class="collection-download__message"></span>').append($msg.contents());
                $inlineContainer.append($msgSpan);
              }
              $msg.remove();
            });
          }

          $inlineContainer.append($buttonWrapper);

          var $fieldsetWrapper = $downloadBlock.find('.fieldset-wrapper').first();
          if ($fieldsetWrapper.length) {
            $fieldsetWrapper.prepend($inlineContainer);
          } else {
            $downloadBlock.prepend($inlineContainer);
          }

          $downloadBlock.find('p').filter(function () {
            var $p = $(this);
            return String($p.text() || '').trim().length === 0 && $p.find('a').length === 0;
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

  // On narrow screens field_group leaves its tab list visually hidden and
  // shows every pane as an open <details>. Open only the first section there
  // so the page isn't one long scroll. If the window grows into the tabbed
  // layout, re-open them all, since field_group shows panes but doesn't
  // reopen <details>.
  Drupal.behaviors.york_drupal_theme_collapse_tabs = {
    attach: function (context) {
      once('york-collapse-tabs', '.horizontal-tabs', context).forEach(function (tabs) {
        var list = tabs.querySelector('.horizontal-tabs-list');
        // Only tabbed panes get .horizontal-tabs-pane, so match plain details.
        var panes = tabs.querySelectorAll('[data-horizontal-tabs-panes] > details');
        if (!list || panes.length < 2) {
          return;
        }
        var isStacked = function () {
          return list.classList.contains('visually-hidden');
        };

        // Wait for field_group's own behavior to set up the tabs first.
        setTimeout(function () {
          if (isStacked()) {
            panes.forEach(function (pane, i) {
              pane.open = i === 0;
            });
          }
        }, 0);

        var resizeTimer;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function () {
            if (!isStacked()) {
              panes.forEach(function (pane) {
                pane.open = true;
              });
            }
          }, 150);
        });
      });
    }
  };

  // Video players start as a 16:9 box (style.css). Once the file's metadata
  // loads, use its real aspect ratio so 4:3 or vertical video fits exactly
  // (still capped in height and letterboxed on black).
  Drupal.behaviors.york_drupal_theme_video_aspect = {
    attach: function (context) {
      once('york-video-aspect', '.media-stage--video video', context).forEach(function (video) {
        function apply() {
          if (video.videoWidth && video.videoHeight) {
            video.style.aspectRatio = video.videoWidth + ' / ' + video.videoHeight;
          }
        }
        if (video.readyState >= 1) {
          apply();
        }
        else {
          video.addEventListener('loadedmetadata', apply, { once: true });
        }
      });
    }
  };

  // Leaflet maps (e.g. field_coordinates in the Geographic tab) are drawn
  // while their tab or <details> is hidden, so they measure 0px wide and
  // render as a blank grey box until the window is resized. Leaflet redraws
  // on window resize, so fire one whenever a tab or section is revealed.
  Drupal.behaviors.york_drupal_theme_leaflet_reveal = {
    attach: function (context) {
      once('york-leaflet-reveal', 'body', context).forEach(function (body) {
        function refreshIfMap(container) {
          if (container && container.querySelector('.leaflet-container')) {
            window.requestAnimationFrame(function () {
              window.dispatchEvent(new Event('resize'));
            });
          }
        }

        // Desktop horizontal tabs.
        body.addEventListener('click', function (event) {
          var tab = event.target.closest('.horizontal-tab-button a');
          if (tab) {
            refreshIfMap(tab.closest('.horizontal-tabs'));
          }
        });

        // Mobile: tabs collapse to <details>. 'toggle' doesn't bubble.
        body.addEventListener('toggle', function (event) {
          if (event.target.open) {
            refreshIfMap(event.target);
          }
        }, true);
      });
    }
  };

})(jQuery, Drupal);
