import { decorateIcons } from '../../scripts/aem.js';

/**
 * Builds the CTA variation of the cards block.
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  const cards = [...block.children];
  const anchor = block.querySelector('a');
  anchor.classList.remove('button', 'primary');
  anchor.classList.add('top-link');
  const ul = document.createElement('ul');
  ul.classList.add(`cards-${cards.length}`);
  cards.forEach((card) => {
    const topSection = document.createElement('div');
    topSection.classList.add('top-section');
    const cardBody = (card.children[1]);
    cardBody.classList.add('card-body');
    const ButtonContainer = card.querySelector('p.button-container');
    ButtonContainer.classList.add('link-container');
    cardBody.prepend(topSection);
    const topLink = card.querySelector('p.link-container');
    /* cardBody.append(topLink); */
    const li = document.createElement('li');
    li.classList.add('cta', card.children[0].textContent);
    li.append(card.children[1]);
    const picture = li.querySelector('picture');
    picture.closest('p').classList.add('image');
    const img = picture.querySelector('img');
    const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 0;
    img.style.marginBottom = `${ratio}%`;
    ul.append(li);
  });
  block.replaceChildren(ul);
}
