import { decorateSections, getMetadata } from '../../scripts/aem.js';
import { createElemWithClass } from '../../scripts/utils.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta).pathname : '/drafts/phase-two-redo/footer';
  const resp = await fetch(
    `${footerPath}.plain.html`,
    window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {},
  );

  if (resp.ok) {
    const footer = document.createElement('div');
    // decorate footer DOM
    footer.innerHTML = await resp.text();
    decorateSections(footer);
    const contentWrapper = createElemWithClass('div', 'content-wrapper');
    footer.querySelectorAll('.section[data-section]').forEach((section) => {
      const clazz = section.getAttribute('data-section');
      const wrapper = section.children[0];
      wrapper.classList.replace('default-content-wrapper', `footer-${clazz}`);
      contentWrapper.append(wrapper);
    });
    block.replaceChildren(contentWrapper);
  }
}
