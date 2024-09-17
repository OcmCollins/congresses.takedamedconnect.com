import {
  decorateBlocks, decorateIcons, decorateSections, loadBlocks,
} from '../../scripts/aem.js';
import { buildLayoutContainers } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const promises = [];

  let selectorHtml = '';

  /* This only supports 2 tabs, switching between them. */
  for (let i = 0; i < 2; i += 1) {
    const row = block.children[i];
    row.classList.add('tab', `tab-${i}`);
    const ref = row.children[1].querySelector('a');
    selectorHtml += `<div class='tab-link'><a href="#tab-${i}">${row.children[0].innerHTML}</a></div>`;
    if (ref) {
      promises.push(fetch(`${ref.href}.plain.html`)
        .then(async (resp) => {
          if (resp.ok) {
            const div = document.createElement('div');
            div.innerHTML = await resp.text();
            decorateSections(div);
            decorateBlocks(div);
            buildLayoutContainers(div);
            await loadBlocks(div);
            row.replaceChildren(...div.children);
            return;
          }
          throw new Error(`${resp.status}: ${resp.statusText}`);
        }));
    }
  }
  await Promise.all(promises);
  const selector = document.createElement('div');
  selector.classList.add('tab-selector');
  selector.innerHTML = selectorHtml;
  block.prepend(selector);
  block.querySelector('.tab-0').classList.add('visible');
  block.querySelector('.tab-link').classList.add('visible');

  selector.querySelectorAll('.tab-link a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Swap the buttons
      const selected = a.href.substring(a.href.indexOf('#') + 1) === 'tab-0' ? 'tab-1' : 'tab-0';
      selector.querySelector('.tab-link:not(.visible)').classList.add('visible');
      a.closest('.tab-link').classList.remove('visible');

      // Swap the content
      const visible = block.querySelector('.tab.visible');
      block.querySelector(`.tab.${selected}`).classList.add('visible');
      visible.classList.remove('visible');
    });
  });

  await decorateIcons(block);
}
