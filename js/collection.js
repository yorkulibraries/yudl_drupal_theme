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

  // Permalink button beside the collection title.
  Drupal.behaviors.collectionCopy = {
    attach(context) {
      once('collection-copy', '.collection-btn[data-copy]', context).forEach((button) => {
        const text = button.querySelector('span');
        const label = text ? text.textContent : '';
        button.addEventListener('click', async () => {
          try {
            await copyText(button.dataset.copy);
            button.classList.add('is-copied');
            if (text) {
              text.textContent = Drupal.t('Copied');
            }
            setTimeout(() => {
              button.classList.remove('is-copied');
              if (text) {
                text.textContent = label;
              }
            }, 1500);
          }
          catch (e) {
            // Copying isn't available; the handle is still in the title.
          }
        });
      });
    }
  };

  // Filter dropdowns: one open at a time; Escape or a click outside closes.
  Drupal.behaviors.collectionRefine = {
    attach(context) {
      once('collection-refine', '[data-collection-refine]', context).forEach((refine) => {
        const groups = Array.from(refine.querySelectorAll('details'));
        const closeAll = (except) => groups.forEach((d) => {
          if (d !== except) {
            d.open = false;
          }
        });
        groups.forEach((d) => d.addEventListener('toggle', () => {
          if (!d.open) {
            return;
          }
          closeAll(d);
          // Open right-aligned when the panel would run off the page.
          d.classList.remove('is-flipped');
          const panel = d.querySelector('.collection-refine__panel');
          if (panel && panel.getBoundingClientRect().right > document.documentElement.clientWidth - 8) {
            d.classList.add('is-flipped');
          }
        }));
        document.addEventListener('click', (e) => {
          if (!refine.contains(e.target)) {
            closeAll();
          }
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeAll();
          }
        });
      });
    }
  };

  // Year range: fills the facet URL's __min__ / __max__ placeholders.
  Drupal.behaviors.collectionYear = {
    attach(context) {
      once('collection-year', '[data-collection-year]', context).forEach((panel) => {
        const from = panel.querySelector('[data-year-from]');
        const to = panel.querySelector('[data-year-to]');
        const apply = () => {
          let a = parseInt(from.value, 10);
          let b = parseInt(to.value, 10);
          if (Number.isNaN(a) || Number.isNaN(b)) {
            return;
          }
          if (a > b) {
            [a, b] = [b, a];
          }
          window.location.href = panel.dataset.url.replace('__min__', a).replace('__max__', b);
        };
        panel.querySelector('[data-year-apply]').addEventListener('click', apply);
        [from, to].forEach((input) => input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            apply();
          }
        }));
      });
    }
  };

  // Collection search placeholder: the short form on phones.
  Drupal.behaviors.collectionSearchPlaceholder = {
    attach(context) {
      once('collection-placeholder', 'input[data-short-placeholder]', context).forEach((input) => {
        const full = input.placeholder;
        const query = window.matchMedia('(max-width: 575.98px)');
        const update = () => {
          input.placeholder = query.matches ? input.dataset.shortPlaceholder : full;
        };
        update();
        query.addEventListener('change', update);
      });
    }
  };

  // Sort: move the exposed sort selects beside the filters, word the order
  // for the chosen field, and apply on change. Without JS they stay in the
  // form beside the search button.
  Drupal.behaviors.collectionSort = {
    attach(context) {
      once('collection-sort', '[data-collection-sort]', context).forEach((slot) => {
        const view = slot.closest('.view');
        const form = view && view.querySelector('form.views-exposed-form');
        const sortBy = form && form.querySelector('select[name="sort_by"]');
        const sortOrder = form && form.querySelector('select[name="sort_order"]');
        if (!sortBy || !sortOrder || !form.id) {
          return;
        }

        const label = document.createElement('span');
        label.className = 'collection-sort__label';
        label.textContent = Drupal.t('Sort');
        slot.append(label);
        [sortBy, sortOrder].forEach((select) => {
          const wrapper = select.closest('.js-form-item');
          select.setAttribute('form', form.id);
          slot.append(select);
          if (wrapper) {
            wrapper.hidden = true;
          }
        });
        form.classList.add('collection-search--enhanced');

        const words = {
          text: [Drupal.t('A–Z'), Drupal.t('Z–A')],
          date: [Drupal.t('Oldest first'), Drupal.t('Newest first')],
        };
        const relabel = () => {
          const option = sortBy.options[sortBy.selectedIndex];
          const key = `${sortBy.value} ${option ? option.text : ''}`.toLowerCase();
          const pair = /date|created|changed|added/.test(key) ? words.date : words.text;
          Array.from(sortOrder.options).forEach((o) => {
            o.text = /desc/i.test(o.value) ? pair[1] : pair[0];
          });
        };
        relabel();

        const submit = () => {
          const button = form.querySelector('.form-actions [type="submit"]');
          if (form.requestSubmit) {
            form.requestSubmit(button || undefined);
          }
          else {
            form.submit();
          }
        };
        sortBy.addEventListener('change', () => {
          relabel();
          submit();
        });
        sortOrder.addEventListener('change', submit);
      });
    }
  };
})(Drupal, once);
