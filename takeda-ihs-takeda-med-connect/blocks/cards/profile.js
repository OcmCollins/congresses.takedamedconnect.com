/**
 * Builds the Profile variation of the cards block.
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('card');

    card.children[0].classList.add('image');
    card.children[1].classList.add('details');

    let p = card.children[1].querySelector('p');
    if (!p) {
      p = document.createElement('p');
      p.innerHTML = card.children[1].innerHTML;
      card.children[1].replaceChildren(p);
    }

    const hr = document.createElement('hr');
    card.prepend(hr);
  });
}
