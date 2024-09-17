export default async function decorate(block) {
  const bottomRow = document.createElement('div');
  bottomRow.classList.add('bottom-row');
  block.parentNode.append(bottomRow);
  block.children[0].children[0].classList.add('content');
  block.children[0].classList.add('top-row');
}
