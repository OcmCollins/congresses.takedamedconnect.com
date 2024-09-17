export default async function decorate(block) {
  if (!block.querySelector('p')) {
    const wrapper = block.children[0].children[0];
    const p = document.createElement('p');
    p.innerHTML = wrapper.innerHTML;
    wrapper.replaceChildren(p);
  }
}
