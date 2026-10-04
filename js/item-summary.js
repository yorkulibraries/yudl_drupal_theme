(function (Drupal, once) {
  'use strict';

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // Fallback for non-HTTPS origins (e.g. the dev VM).
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  // The share label and AddToAny links stay hidden (see item-summary.css)
  // until AddToAny's script has run, so visitors who block it don't see an
  // empty "Share" gap. Its script is deferred, so it has run by 'load'.
  function revealShareWhenReady(share) {
    const check = () => {
      if (window.a2a) {
        share.classList.add('is-a2a-ready');
      }
    };
    if (document.readyState === 'complete') {
      check();
    }
    else {
      window.addEventListener('load', check, { once: true });
    }
  }

  Drupal.behaviors.itemSummaryShare = {
    attach(context) {
      once('item-share', '.item-share', context).forEach(revealShareWhenReady);
    }
  };

  Drupal.behaviors.itemSummaryCopy = {
    attach(context) {
      once('item-copy', '.item-copy', context).forEach((button) => {
        const label = button.getAttribute('aria-label');
        button.addEventListener('click', async () => {
          try {
            await copyText(button.dataset.copy);
            button.classList.add('is-copied');
            button.setAttribute('aria-label', Drupal.t('Copied'));
            button.title = Drupal.t('Copied');
            setTimeout(() => {
              button.classList.remove('is-copied');
              button.setAttribute('aria-label', label);
              button.title = label;
            }, 1500);
          }
          catch (e) {
            // Copying isn't available; the link itself is still selectable.
          }
        });
      });
    }
  };
})(Drupal, once);
