import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  let count;

  // setup image columns
  [...block.children].forEach((row) => {
    if (!count) {
      count = row.children.length;
      block.classList.add(`columns-${count}-cols`);
    }
    row.classList.add('columns-row');
    [...row.children].forEach((item) => {
      item.classList.add('column-item');
      const imgp = item.querySelector(':scope > p > picture');
      if (imgp) {
        imgp.parentElement.classList.add('image-wrapper');
      }
    });
  });

  await decorateIcons(block);
}
