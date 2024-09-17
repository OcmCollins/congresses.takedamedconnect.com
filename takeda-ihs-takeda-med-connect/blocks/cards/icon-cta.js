import { decorateIcons } from '../../scripts/aem.js';

/**
 * Builds the Icons variation of the cards block.
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('card');
    [...card.children].forEach((body) => {
      const anchor = body.querySelector('a');

      const content = document.createElement('a');
      content.classList.add('card-content');
      content.href = anchor.href;
      content.title = anchor.title;

      // Pull out the icon
      const icon = body.querySelector('span.icon');
      if (icon) {
        const tmp = icon.parentElement;
        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('card-icon');
        iconWrapper.append(icon);
        tmp.remove();
        content.append(iconWrapper);
      } else {
        card.classList.add('no-icon');
      }

      const link = document.createElement('a');
      link.href = anchor.href;
      link.title = anchor.title;
      link.classList.add('card-link');
      link.innerHTML = `<span>${anchor.textContent}</span>`;

      body.classList.add('card-body');

      const tmp = anchor.parentElement;
      tmp.remove();

      content.append(body, link);
      card.append(content, link);
    });
  });
}
