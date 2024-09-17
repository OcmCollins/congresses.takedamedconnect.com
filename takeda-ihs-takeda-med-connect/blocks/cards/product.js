/**
 * Builds the Profile variation of the cards block.
 * @param {HTMLDivElement} block
 */
export default async function decorate(block) {
  [...block.children].forEach((card) => {
    card.classList.add('card');
    const downloadButton = card.children[2];
    card.children[0].classList.add('image');
    card.children[1].classList.add('details');
    const button = document.createElement('div');
    button.classList.add('button-wrapper');
    console.log(downloadButton);
    const buttonLink = card.querySelector('p.button-container');
    card.append(button);
    button.append(buttonLink);
    let p = card.children[1].querySelector('p');
    if (!p) {
      p = document.createElement('p');
      p.innerHTML = card.children[1].innerHTML;
      card.children[1].replaceChildren(p);
    }
  });
}
