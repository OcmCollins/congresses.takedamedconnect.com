import { decorateButtons, readBlockConfig } from '../../scripts/aem.js';

/**
 * Builds the image wrapper div from the block definition
 *
 * @param {HTMLPictureElement} picture the picture
 * @return {HTMLDivElement} the image wrapper
 */
function buildImageWrapper(picture, block) {
  const config = readBlockConfig(block);
  picture.querySelector('img').setAttribute('loading', 'eager');
  const p = picture.parentElement;
  const image = document.createElement('div');
  image.classList.add('image');
  image.append(picture);

  if (p.nodeName.toLowerCase() === 'p' && !p.textContent.trim()) {
    p.remove(); // remove floating/empty p
  }

  /* if there is a config for image overlay append it to image wrapper */
  if (config.imageoverlay) {
    const overlayWrap = document.createElement('div');
    overlayWrap.classList.add('image-overlay');
    let pairWrap;
    config.imageoverlay.forEach((text, index) => {
      /* iterate through all the image overlay config values,
      wrap every 2 elements into a div and append it to image-overlay element.
      there are cases where there might be more than 1 image overlay. */
      if (index % 2 === 0) {
        pairWrap = document.createElement('div');
        pairWrap.classList.add('pair-wrap');
        overlayWrap.append(pairWrap);
      }
      const textwrap = document.createElement('p');
      textwrap.innerHTML = text;
      pairWrap.append(textwrap);
    });
    overlayWrap.append(pairWrap);
    image.append(overlayWrap);
  }

  return image;
}

function buildProductContent(block) {
  const config = readBlockConfig(block);
  const keys = Object.keys(config);
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');
  ['logo', 'title', 'references', 'link'].forEach((part) => {
    const idx = keys.indexOf(part);
    if (idx >= 0) {
      const content = block.children[idx].children[1];
      let p = content.querySelector(':scope > p');
      if (!p) {
        p = document.createElement('p');
      }
      p.innerHTML = block.children[idx].children[1].innerHTML;
      content.classList.add(part);
      content.replaceChildren(p);
      contentDiv.append(content);
      const a = content.querySelector('a');
      if (a) {
        a.setAttribute('target', '_blank');
      }
    }
  });

  const logo = contentDiv.querySelector('.logo');
  if (logo) {
    const img = contentDiv.querySelector('.logo img');
    const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
    logo.style.maxWidth = `${img.width}px`;
    contentDiv.querySelector('.logo picture').style.paddingBottom = `${ratio}%`;
  }

  decorateButtons(contentDiv);
  return contentDiv;
}

function buildCardContent(block) {
  const config = readBlockConfig(block);
  const keys = Object.keys(config);
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('content');

  if (config.title) {
    const idx = keys.indexOf('title');
    const content = block.children[idx].children[1];
    content.classList.add('title');
    contentDiv.append(content);
  }

  if (config.resources) {
    const idx = keys.indexOf('resources');
    const content = block.children[idx].children[1];
    [...content.querySelectorAll('a')].forEach((a) => {
      a.classList.add('resource');
      const wrapper = document.createElement('div');
      wrapper.classList.add('resource-wrapper');
      const text = a.textContent;
      const name = document.createElement('p');
      name.classList.add('name');
      name.textContent = text;
      wrapper.append(name);
      a.replaceChildren(wrapper);
    });

    content.classList.add('resources');
    contentDiv.append(content);
  }
  return contentDiv;
}
/**
 * Builds the content from the block definition & type.
 *
 * @param {HTMLDivElement} block the block
 * @param {String} type the type of block
 * @return {HTMLDivElement} the content wrapper
 */
function buildContent(block, type) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('content-wrapper');
  switch (type) {
    case 'product': {
      wrapper.append(buildProductContent(block));
      break;
    }
    case 'card': {
      wrapper.append(buildCardContent(block));
      break;
    }
    default: {
      const picture = block.querySelector('picture');
      block.prepend(picture);
      const content = block.querySelector(':scope > div > div');
      content.classList.add('content');
      wrapper.append(content);
      break;
    }
  }
  return wrapper;
}

export default async function decorate(block) {
  let type = 'default';
  if (block.classList.contains('product')) {
    type = 'product';
  } else if (block.classList.contains('card')) {
    type = 'card';
  }
  block.classList.add(type);
  const children = [];

  const content = buildContent(block, type);
  const picture = block.querySelector('picture');
  if (picture) {
    children.push(buildImageWrapper(picture, block));
  } else {
    content.classList.add('no-image');
  }
  children.push(content);
  block.replaceChildren(...children);
}
