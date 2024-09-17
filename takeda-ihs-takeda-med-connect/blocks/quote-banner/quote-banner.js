export default async function decorate(block) {
  const picture = block.querySelector('picture');
  const empty = picture.parentElement;
  const image = document.createElement('div');
  image.classList.add('bg-wrapper');
  image.append(picture);
  block.children[0].children[0].classList.add('content');
  block.children[0].prepend(image);
  empty.remove();

  if (block.classList.contains('top-gradient')) {
    const gradient = document.createElement('div');
    gradient.classList.add('gradient');
    block.children[0].append(gradient);
  }
}
