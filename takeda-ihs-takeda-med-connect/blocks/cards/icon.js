import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  let count;

  [...block.children].forEach((row) => {
    if (!count) {
      count = row.children.length;
      block.classList.add(`cols-${count}`);
    }
    row.classList.add('row');
    [...row.children].forEach((card) => {
      card.classList.add('card');
    });
  });
}
