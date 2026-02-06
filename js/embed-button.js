(function (Drupal, once) {
  'use strict';

  function getOembedUrl() {
    const current = window.location.href;
    return `${window.location.origin}/api/oembed?url=${encodeURIComponent(current)}`;
  }

  async function fetchEmbedHtml() {
    const res = await fetch(getOembedUrl(), { credentials: 'same-origin' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!data.html) {
      throw new Error('No html in oEmbed response');
    }
    return data.html;
  }

  function ensureModal() {
    let modal = document.querySelector('.oembed-embed-modal');
    if (modal) {
      return modal;
    }

    modal = document.createElement('div');
    modal.className = 'modal fade oembed-embed-modal';
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Embed</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <label class="form-label" for="oembed-embed-code">Embed code</label>
            <textarea id="oembed-embed-code" class="form-control" rows="3" readonly></textarea>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(modal) {
    if (window.bootstrap && window.bootstrap.Modal) {
      const instance = window.bootstrap.Modal.getOrCreateInstance(modal);
      instance.show();
    }
    else {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  function buildEmbedButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary oembed-embed-button';
    button.setAttribute('aria-label', 'Embed');
    button.setAttribute('title', 'Embed');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9.5 6.5L4 12l5.5 5.5 1.5-1.5L7 12l4-4-1.5-1.5zm5 0L13 8l4 4-4 4 1.5 1.5L20 12l-5.5-5.5z"/>
      </svg>
      <span class="visually-hidden">Embed</span>
    `;
    button.addEventListener('click', async () => {
      const modal = ensureModal();
      const textarea = modal.querySelector('#oembed-embed-code');
      if (textarea) {
        textarea.value = 'Loading...';
      }
      try {
        const html = await fetchEmbedHtml();
        if (textarea) {
          textarea.value = html;
          textarea.focus();
          textarea.select();
        }
      }
      catch (err) {
        if (textarea) {
          textarea.value = `Error: ${err.message}`;
        }
      }
      showModal(modal);
    });
    return button;
  }

  function wrapIconsWithButton(icons) {
    if (icons.closest('.oembed-embed-row')) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'oembed-embed-row';
    icons.parentNode.insertBefore(wrapper, icons);
    wrapper.appendChild(icons);
    wrapper.appendChild(buildEmbedButton());
  }

  Drupal.behaviors.oembedEmbedButton = {
    attach(context) {
      const iconNodes = once('oembed-embed-icons', '.addtoany_list, .a2a_kit', context);
      iconNodes.forEach(wrapIconsWithButton);

      if (iconNodes.length) {
        return;
      }

      if (document.querySelector('.oembed-embed-row')) {
        return;
      }

      once('oembed-embed-fallback', '.node__content', context).forEach((content) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'oembed-embed-row';
        wrapper.appendChild(buildEmbedButton());
        content.insertBefore(wrapper, content.firstChild);
      });
    }
  };
})(Drupal, once);
