export default function decorate(block) {
  const container = block.querySelector(':scope > div');
  container.children[0].classList.add('content');
  container.children[1].classList.add('image');
  const picture = block.querySelector('picture');
  const img = block.querySelector('img');

  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  picture.style.paddingBottom = `${ratio}%`;
}
