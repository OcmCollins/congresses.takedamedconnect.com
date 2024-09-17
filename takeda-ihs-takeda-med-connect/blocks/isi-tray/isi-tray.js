import { readBlockConfig } from '../../scripts/aem.js';
import { BREAKPOINTS } from '../../scripts/scripts.js';

const isDesktop = BREAKPOINTS.medium;

let timeout;
const debounce = (cb) => (...args) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => cb.apply(this, args), 1000);
};

const callback = (categories) => {
  const sect = categories[0];
  if (sect.isIntersecting) {
    sect.target.classList.add('expanded');
  } else {
    sect.target.classList.remove('expanded');
  }
};

let io;
const updateIntersectObserver = () => {
  if (io) io.disconnect();
  const block = document.querySelector('.isi-tray.block');

  // Figure out which height will drive the intersect observer.
  let height;

  if (block.classList.contains('cookied') || isDesktop.matches) {
    height = block.querySelector('.collapsed-tray').offsetHeight;
  } else {
    height = block.querySelector('.initial-tray').offsetHeight;
  }

  io = new IntersectionObserver(callback, { rootMargin: `0px 0px -${height}px 0px` });
  io.observe(block);
};

const observeSection = (mutations, observer) => {
  mutations.forEach((m) => {
    if (!m.target.style.display) {
      updateIntersectObserver();
      observer.disconnect();
    }
  });
};

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const keys = Object.keys(config);

  const collapsedIdx = keys.indexOf(keys.find((k) => k.match(/collapsed/i)));
  const collapsedContent = block.children[collapsedIdx].children[1];
  if (!collapsedContent.children.length) {
    const p = document.createElement('p');
    p.append(...collapsedContent.childNodes);
    collapsedContent.replaceChildren(p);
  }

  const initialBoxedIdx = keys.indexOf(keys.find((k) => k.match(/initial-boxed/i)));
  let initialBoxedContent;
  if (initialBoxedIdx >= 0) {
    [, initialBoxedContent] = block.children[initialBoxedIdx].children;
    if (!initialBoxedContent.children.length) {
      const p = document.createElement('p');
      p.append(...initialBoxedContent.children);
      initialBoxedContent.replaceChildren(p);
    }
  }

  const fullBoxedIdx = keys.indexOf(keys.find((k) => k.match(/full-boxed/i)));
  let fullBoxedContent;
  if (fullBoxedIdx >= 0) {
    [, fullBoxedContent] = block.children[fullBoxedIdx].children;
    if (!fullBoxedContent.children.length) {
      const p = document.createElement('p');
      p.append(...fullBoxedContent.children);
      fullBoxedContent.replaceChildren(p);
    }
  }

  const contraIdx = keys.indexOf(keys.find((k) => k.match(/^contraindications/i)));
  const contraContent = block.children[contraIdx].children[1];
  if (!contraContent.children.length) {
    const p = document.createElement('p');
    p.append(...contraContent.childNodes);
    contraContent.replaceChildren(p);
  }

  const indIdx = keys.indexOf(keys.find((k) => k.match(/^indications/i)));
  const indications = block.children[indIdx].children[1];
  if (!indications.children.length) {
    const p = document.createElement('p');
    p.append(...indications.childNodes);
    indications.replaceChildren(p);
  }

  const safetyIdx = keys.indexOf(keys.find((k) => k.match(/safety/i)));

  const safety = block.children[safetyIdx].children[1];
  if (!safety.children.length) {
    const p = document.createElement('p');
    p.append(...safety.childNodes);
    safety.replaceChildren(p);
  }

  block.innerHTML = `
    <div class="initial-tray">
      <h5 class="upper">Indication &<br/> Important Safety Information</h5>
      <div class="buttons">
        <button class="collapse"><span>-</span></button>
        <button class="expand"><span>+</span></button>
      </div>
      <div class="${initialBoxedContent ? 'boxed-warning' : ''}">
        ${initialBoxedContent ? initialBoxedContent.innerHTML : `<h5 class="upper">Contraindications</h5>${contraContent.innerHTML}`}
      </div>
    </div>
     <div class="collapsed-tray">
      <div class="mobile">
        ${collapsedContent.outerHTML}
        <div class="buttons">
          <button class="expand"><span>+</span></button>
        </div>
      </div>
      <div class="desktop">
        <div class="buttons">
          <button class="expand"><span>+</span></button>
        </div>
        <h5>Please expand for <a href="#indication" title="Indication">Indication</a> and <a href="#important-safety-information" title="Important Safety Information">Important Safety Information</a>.</h5>
        <h5 class="upper">Important Safey Information</h5>
        <div class="${fullBoxedContent ? 'boxed-warning' : ''}">
          ${fullBoxedContent ? fullBoxedContent.innerHTML : `<h5 class="upper">Contraindications</h5>${contraContent.innerHTML}`}
        </div>
      </div>
    </div>
    <div class="expanded-tray">
      <div class="buttons">
        <button class="collapse"><span>-</span></button>
        <button class="expand"><span>+</span></button>
      </div>
      <div class="indication" id="indication">
        <h5 class="upper">Indication and Limitations of Use</h5>
        ${indications.innerHTML}
      </div>
      <div class="safety-info" id="important-safety-information">
        <h5 class="upper">Important Safety Information</h5>
        <div class="${fullBoxedContent ? 'boxed-warning' : ''}">
          ${fullBoxedContent ? fullBoxedContent.innerHTML : ''}
        </div>
        <h5 class="upper">Contraindications</h5>
        ${contraContent.innerHTML}
        ${safety.innerHTML}
      </div>
      <p><a class="scroll-to-top" href="#" title="Scroll to Top">Scroll to Top</a></p>
    </div>
  `;

  const cookied = document.cookie.match(/^(.*;)?\s*ISIWarningCollapsed\s*=\s*[^;]+(.*)?$/);
  if (cookied) {
    block.classList.add('cookied');
  }

  // Observe the section - when it's visible we can do some math on intersections.'
  const mo = new MutationObserver(observeSection);
  mo.observe(block.closest('.section'), { attributes: true, attributeFilter: ['style'] });

  window.addEventListener('resize', debounce(updateIntersectObserver));

  // Collapsing the initial overlay will dismiss it from view until cookie expries.
  block.querySelector('.initial-tray .collapse').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const container = e.target.closest('.initial-tray');
    container.style.bottom = `-${container.offsetHeight}px`;
    document.cookie = `ISIWarningCollapsed=true;max-age=max-age-in-seconds=31536000;path=${document.location.pathname}`;
    setTimeout(() => {
      block.classList.add('cookied');
      updateIntersectObserver();
    }, 1000);
  });

  block.querySelectorAll('button.expand').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      block.scrollIntoView({ behavior: 'smooth' });
    });
  });

  block.querySelectorAll('.expanded-tray button.collapse, a.scroll-to-top').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
    });
  });

  isDesktop.addEventListener('change', updateIntersectObserver);
}
