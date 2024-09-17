/**
 * get the name of the section and set as the id of
 * the section so there is a way to anchor from toc nav to section
 */
export default async function decorate(block) {
  document.querySelectorAll('.section[data-toc]').forEach((jumpTo) => {
    const jumpId = jumpTo.getAttribute('data-toc');
    jumpTo.setAttribute('id', jumpId);
  });

  block.querySelectorAll('.toc ul > li > a').forEach((anchor) => {
    const titleName = anchor.title;
    anchor.href = `#${titleName.toLowerCase()}`;
  });
  const main = document.querySelector('main');
  const toc = document.querySelector('.toc');
  main.prepend(toc);
}
