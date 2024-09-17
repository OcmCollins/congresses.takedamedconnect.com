import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  buildBlock,
  loadCSS,
  readBlockConfig,
} from './aem.js';

import {
  integrateMartech,
} from './third-party.js';

export const BREAKPOINTS = {
  small: window.matchMedia('(min-width: 600px)'),
  medium: window.matchMedia('(min-width: 900px)'),
  large: window.matchMedia('(min-width: 1200px)'),
};

const PRODUCTION_DOMAINS = ['www.takeda.com'];
const LCP_BLOCKS = ['hero']; // add your LCP blocks to the list

function decorateSectionGradientTopper(main) {
  const section = main.querySelector('.section.inverted-gradient-background');
  const hasInvertedGradient = section !== null;
  if (!hasInvertedGradient) return;

  const hero = main.querySelector('& > .section.hero-container');

  hero?.classList?.add('angled-inverted-background');
}

async function decorateDisclaimerModal() {
  const main = document.querySelector('main');
  const isModalAccepted = document.cookie.match(/\s*hcpModalDismiss=1;?/) !== null || window.location.search.indexOf('bypassModal') > -1 || window.hlx.lighthouse;
  const shouldShowModal = !isModalAccepted || (document.location.href.indexOf('?showModal') > -1);
  if (shouldShowModal) {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/disclaimer-modal/disclaimer-modal.css`);
    const response = await fetch('/fragments/disclaimer-modal.plain.html');
    document.body.style.overflowY = 'hidden';
    if (response.ok) {
      const html = await response.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const modal = tmp.querySelector('.disclaimer-modal');
      const config = readBlockConfig(modal);
      modal.innerHTML = `
        <div class="close-button">
          <span class="close"></span>
        </div>
        <div class="title"><h2>${config.title}</h2></div>
          <div class="content"><p> ${config.content}</p></div>
          <div class="button-section">
          <div class="agree"><p> ${config.agree}</p></div>
          <div class="leave"><a class="link" href=" ${config.link} "> <p>${config.leave} </p></a></div>
        </div>
      `;
      const disclaimerContainer = document.createElement('div');
      disclaimerContainer.className = 'section disclaimer-modal-container';
      const disclaimerWrapper = document.createElement('div');
      disclaimerWrapper.className = 'disclaimer-modal-wrapper';
      disclaimerWrapper.appendChild(modal);
      disclaimerContainer.appendChild(disclaimerWrapper);

      const acceptButn = modal.querySelector('.agree');
      acceptButn.addEventListener('click', () => {
        const CookieDate = new Date();
        CookieDate.setFullYear(CookieDate.getFullYear() + 5);
        document.cookie = `hcpModalDismiss=1;path=/;expires=${CookieDate.toUTCString()};`;
        document.body.style.overflowY = null;
        disclaimerContainer.remove();
      });
      main.append(disclaimerContainer);
      modal.querySelector('.close').addEventListener('click', () => {
        document.querySelector('.disclaimer-modal-container').style.display = 'none';
      });
    }
  }
}
/**
 * Converts paagraphs that start with a `<sup>` element, to a p.reference paragraph.
 * @param {HTMLElement} main
 */
function updateRefParagraphs(main) {
  main.querySelectorAll('sup').forEach((sup) => {
    if (!sup.previousSibling) {
      sup.parentElement.classList.add('reference');
      sup.remove();
    }
  });
}

/**
 * Builds the Floating Images auto-block sections.
 *
 * @param {HTMLElement} main
 */
function buildFloatingImages(main) {
  main.querySelectorAll(':scope > div div.section-metadata').forEach((metadata) => {
    let style;
    [...metadata.querySelectorAll(':scope > div')].every((div) => {
      const match = div.children[1]?.textContent.toLowerCase().trim().match(/(image[\s-](left|right))/i);
      if (div.children[0]?.textContent.toLowerCase().trim() === 'style' && match) {
        style = match[1].replaceAll(/\s/g, '-');
        return false;
      }
      return true;
    });
    if (style) {
      const section = metadata.parentElement;
      const left = [];
      const right = [];
      [...section.children].forEach((child) => {
        const picture = child.querySelector(':scope > picture');
        if (picture) {
          right.push(picture);
          child.remove();
        } else if (!child.classList.contains('section-metadata')) {
          left.push(child);
        }
      });
      const block = buildBlock('floating-images', [[{ elems: left }, { elems: right }]]);
      block.classList.add(style);
      section.prepend(block);
    }
  });
}

function buildSectionBackgroundImage(main) {
  main.querySelectorAll(':scope > div div.section-metadata').forEach((metadata) => {
    const keys = Object.keys(readBlockConfig(metadata));
    const bgIdx = keys.indexOf(keys.find((k) => k.match(/background-image/i)));
    if (bgIdx >= 0) {
      const picture = metadata.children[bgIdx].children[1];
      picture.querySelector('picture').classList.add('section-bg-image');
      metadata.parentElement.prepend(picture.cloneNode(true));
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {HTMLElement} main The container element
 */
function buildAutoBlocks(main) {
  try {
    updateRefParagraphs(main);
    buildFloatingImages(main);
    buildSectionBackgroundImage(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function fixDefaultImage(main) {
  main.querySelectorAll(':scope .default-content-wrapper > p > picture > img').forEach((img) => {
    const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
    const picture = img.parentElement;
    picture.style.paddingBottom = `${ratio}%`;
    picture.parentElement.style.maxWidth = `${img.width}px`;
    picture.parentElement.style.margin = '0 auto 1.5em';
  });
}

export function checkDomain(url) {
  const urlToCheck = typeof url === 'string' ? new URL(url) : url;

  const isProd = PRODUCTION_DOMAINS.some((host) => urlToCheck.hostname.includes(host));
  const isHlx = ['hlx.page', 'hlx.live', 'aem.page', 'aem.live'].some((host) => urlToCheck.hostname.includes(host));
  const isLocal = urlToCheck.hostname.includes('localhost');
  const isPreview = isLocal || urlToCheck.hostname.includes('hlx.page');
  const isKnown = isProd || isHlx || isLocal;
  const isExternal = !isKnown && !urlToCheck.hostname.includes('.takeda.com');
  return {
    isProd,
    isHlx,
    isLocal,
    isKnown,
    isExternal,
    isPreview,
  };
}

/**
 * Returns the true origin of the current page in the browser.
 * If the page is running in a iframe with srcdoc, the ancestor origin is returned.
 * @returns {String} The true origin
 */
export function getOrigin() {
  return window.location.href === 'about:srcdoc' ? window.parent.location.origin : window.location.origin;
}

let browserDomainCheck;
export function checkBrowserDomain() {
  if (!browserDomainCheck) {
    browserDomainCheck = checkDomain(window.location);
  }
  return browserDomainCheck;
}

export function rewriteLinkUrl(a) {
  const url = new URL(a.href);
  const domainCheck = checkDomain(url);
  // protect against maito: links or other weirdness
  const isHttp = url.protocol === 'https:' || url.protocol === 'http:';

  if (isHttp && domainCheck.isKnown) {
    if (url.pathname.startsWith('/content/dam/')) {
      a.target = '_blank';
      if (checkBrowserDomain().isProd) {
        a.href = `${url.pathname}${url.search}${url.hash}`;
      }
    } else {
      // local links are rewritten to be relative
      a.href = `${url.pathname.replace('.html', '')}${url.search}${url.hash}`;
    }
  } else if (isHttp && domainCheck.isExternal) {
    // non local open in a new tab
    // but if a different takeda.com sub-domain, leave absolute, don't open in a new tab
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }

  return a;
}

/**
 * Builds layout containers after all sections & blocks have been decorated.
 * @param {HTMLElement} main
 */
export function buildLayoutContainers(main) {
  main.querySelectorAll('.section[data-layout]').forEach((section) => {
    const container = document.createElement('div');
    container.classList.add('layout-content-wrapper');
    const title = section.querySelector('.section-title-wrapper');
    container.append(...section.children);
    if (title) section.prepend(title);
    section.append(container);
    section.querySelectorAll('.separator-wrapper').forEach((sep) => {
      sep.innerHTML = '<hr/>';
    });
  });
}

/**
 * Decorates the previously created background image div.
 * @param main
 */
function decorateSectionBackgroundImage(main) {
  main.querySelectorAll(':scope div > picture.section-bg-image').forEach((picture) => {
    const wrapper = picture.parentElement;
    wrapper.classList.add('section-bg-image-wrapper');
    wrapper.parentElement.replaceWith(wrapper);
  });
}
function decorateSectionButtonRow(main) {
  main.querySelectorAll(':scope div > .default-content-wrapper > p.button-container').forEach((buttonContainer) => {
    const wrapper = buttonContainer.parentElement;
    wrapper.classList.add('button-wrapper');
  });
}

function decorateSectionIDs(main) {
  main.querySelectorAll(':scope .section').forEach((section) => {
    const id = section.getAttribute('data-id');
    if (id) {
      section.id = id.toLowerCase().replaceAll(' ', '-');
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  fixDefaultImage(main);
  decorateBlocks(main);
  buildLayoutContainers(main);
  decorateSectionButtonRow(main);
  decorateSectionBackgroundImage(main);
  decorateSectionGradientTopper(main);
  decorateSectionIDs(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * Initializes the PartyTown library for processing third-party libraries.
 */
function initPartytown() {
  window.partytown = {
    lib: '/scripts/partytown/',
    forward: ['dataLayer.push'],
  };
  import('./partytown/partytown.js');
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/icons/favicon.png`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
  integrateMartech();
  initPartytown();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  decorateDisclaimerModal();
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
