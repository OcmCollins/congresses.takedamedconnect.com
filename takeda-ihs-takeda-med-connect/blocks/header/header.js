import {
  getMetadata,
  decorateIcons,
  decorateSections,
} from '../../scripts/aem.js';
import {
  createElemWithClass,
  createElementWithAttributes,
} from '../../scripts/utils.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function buildLogo() {
  const logoContainer = createElemWithClass('div', 'nav-logo');
  const logoLink = createElementWithAttributes('a', { href: '/', rel: 'noopener', tabindex: '0' });
  const logoImage = createElementWithAttributes('img', {
    alt: 'Takeda Logo',
    class: 'logo',
    src: '/styles/images/logo.png',
    loading: 'lazy',
    height: '274',
    width: '815',
  });
  logoLink.appendChild(logoImage);
  logoContainer.appendChild(logoLink);
  return logoContainer;
}

function buildHamburger() {
  const hamburgerContainer = createElemWithClass('div', 'nav-hamburger');
  const hamburgerButton = createElementWithAttributes('button', {
    class: 'nav-hamburger-icon',
    'aria-controls': 'nav',
    'aria-label': 'Open navigation',
    tabindex: '0',
  });
  const hamburgerIcon = createElemWithClass('span', 'icon', 'icon-hamburger');
  const closeIcon = createElemWithClass('span', 'icon', 'icon-close');
  hamburgerButton.append(hamburgerIcon, closeIcon);
  hamburgerContainer.appendChild(hamburgerButton);
  return hamburgerContainer;
}

function toggleNavigation(navigation) {
  navigation.setAttribute('aria-expanded', navigation.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
}

function toggleTopMenu(topMenu) {
  topMenu.parentElement.querySelectorAll('.top-nav').forEach((menu) => {
    if (menu !== topMenu) {
      menu.setAttribute('aria-expanded', 'false');
    }
  });
  topMenu.setAttribute('aria-expanded', topMenu.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
}

function buildSections(sections) {
  const expanderIcon = document.createElement('span');
  expanderIcon.classList.add('icon', 'icon-cheveron-down');
  sections.querySelectorAll(':scope > ul > li').forEach((topMenu) => {
    topMenu.classList.add('top-nav');
    const activeLink = topMenu.querySelector('a');
    if (activeLink) {
      const url = new URL(activeLink.href);
      const subMenu = topMenu.querySelector('ul');
      if (subMenu) {
        if (window.location.pathname === url.pathname) {
          topMenu.classList.add('active');
        }
        const topMenuAnchor = topMenu.querySelector('a');
        topMenuAnchor.append(expanderIcon.cloneNode());

        const subMenuLinks = subMenu.querySelectorAll('li > a');
        const isCurrentPath = Array.from(subMenuLinks).some((subMenuAnchor) => {
          const isMatch = window.location.pathname === new URL(subMenuAnchor.href).pathname
        && subMenuAnchor.hash === window.location.hash;
          if (isMatch) {
            subMenuAnchor.parentElement.classList.add('active');
            subMenuAnchor.href = subMenuAnchor.hash;
          }
          return isMatch;
        });
        topMenu.setAttribute('aria-expanded', isCurrentPath ? 'true' : 'false');

        subMenuLinks.forEach((subMenuAnchor) => {
          subMenuAnchor.parentElement.classList.add('sub-nav');
          if (window.location.pathname === new URL(subMenuAnchor.href).pathname) {
            subMenuAnchor.href = subMenuAnchor.hash;
          }
          subMenuAnchor.addEventListener('click', () => {
            subMenuLinks.forEach((link) => link.parentElement.classList.remove('active'));
            if (
              subMenuAnchor.hash
              && window.location.pathname === new URL(subMenuAnchor.href).pathname
            ) {
              subMenuAnchor.parentElement.classList.add('active');
              if (!isDesktop.matches) {
                toggleNavigation(document.getElementById('nav'));
              }
            }
          });
        });

        topMenuAnchor.setAttribute('tabindex', '0');
        topMenuAnchor.setAttribute('role', 'button');
        topMenuAnchor.addEventListener('click', (event) => {
          if (!isDesktop.matches) {
            event.preventDefault();
            event.stopPropagation();
            toggleTopMenu(topMenu);
          }
        });
      }
    }
  });
  return sections;
}

function handleSectionVisibilityChange() {
  const sectionElements = Array.from(document.querySelectorAll('div.section[id]'));

  let currentSection = null;
  let maxVisiblePercentage = 0;

  sectionElements.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    const visiblePercentage = visibleHeight / rect.height;

    if (visiblePercentage > maxVisiblePercentage) {
      maxVisiblePercentage = visiblePercentage;
      currentSection = section;
    }
  });

  const subNavigationDropdown = document.querySelector('.subnav-ribbon');
  if (currentSection) {
    const sectionId = `#${currentSection.getAttribute('id')}`;
    const currentPath = window.location.pathname;
    const topNavigationAnchor = document.querySelector(`.top-nav a[href="${currentPath}"]`);
    const currentSectionValue = subNavigationDropdown.querySelector('.subnav-dropdown > .current-section');
    const subNavigationAnchor = subNavigationDropdown.querySelector(`.active-submenu a[href="${sectionId}"]`);

    if (topNavigationAnchor) {
      topNavigationAnchor.parentElement.setAttribute('aria-expanded', 'true');
      if (currentSection) {
        subNavigationDropdown.classList.add('active');
        if (subNavigationAnchor) {
          Array.from(subNavigationDropdown.querySelectorAll('.active-submenu .sub-nav')).forEach((link) => link.classList.remove('active'));
          subNavigationAnchor.parentElement.classList.add('active');
          currentSectionValue.replaceChildren(subNavigationAnchor.cloneNode(true));
        }
      }
    }
  } else {
    subNavigationDropdown.classList.remove('active');
    Array.from(subNavigationDropdown.querySelectorAll('.active-submenu .sub-nav')).forEach((link) => link.classList.remove('active'));
  }
}

function observeSectionInteractions() {
  const sectionElements = document.querySelectorAll('div.section[id]');
  const intersectionObserver = new IntersectionObserver(handleSectionVisibilityChange, {
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
  });

  sectionElements.forEach((section) => {
    intersectionObserver.observe(section);
  });
}

function toggleDropdownValues(subNavigationDropdown) {
  subNavigationDropdown.classList.add('active');
  subNavigationDropdown.setAttribute('aria-expanded', subNavigationDropdown.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
}

function buildSubNavigationDropdown(navigation) {
  const activeTopNavigationMenu = navigation.querySelector('.top-nav.active');
  if (!activeTopNavigationMenu) {
    return;
  }
  const activeSubNavigationMenu = activeTopNavigationMenu.children[1].cloneNode(true);
  activeSubNavigationMenu.classList.add('active-submenu');

  const subNavigationDropdown = createElemWithClass('div', 'subnav-ribbon');
  const currentDropdownValueContainer = createElemWithClass('div', 'subnav-dropdown');
  const currentSectionListItem = createElemWithClass('li', 'current-section');

  currentDropdownValueContainer.append(currentSectionListItem);

  const dropdownExpander = document.createElement('span');
  dropdownExpander.classList.add('icon', 'icon-solid-down-arrow');
  currentDropdownValueContainer.appendChild(dropdownExpander);

  subNavigationDropdown.append(currentDropdownValueContainer);
  subNavigationDropdown.append(activeSubNavigationMenu);
  navigation.append(subNavigationDropdown);

  currentDropdownValueContainer.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleDropdownValues(subNavigationDropdown);
  });

  activeSubNavigationMenu.querySelectorAll('.sub-nav').forEach((subNavigationAnchor) => {
    subNavigationAnchor.addEventListener('click', () => {
      subNavigationDropdown.setAttribute('aria-expanded', 'false');
      subNavigationDropdown.classList.add('active');
    });
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} headerBlock The header block element
 */
export default async function decorate(headerBlock) {
  // fetch navigation content
  const navigationMetadata = getMetadata('nav');
  const navigationPath = navigationMetadata ? new URL(navigationMetadata).pathname : '/drafts/phase-two-redo/nav';
  const response = await fetch(`${navigationPath}.plain.html`);
  console.log(navigationMetadata);
  if (response.ok) {
    if (navigationPath === '/drafts/tmc/nav1') {
      console.log('path is tmc.nav1');
    }
    console.log(response);
    const navigationHtml = document.createElement('div');
    navigationHtml.innerHTML = await response.text();
    decorateSections(navigationHtml);
    navigationHtml.querySelectorAll('.section[data-section]').forEach((section) => {
      const sectionClass = section.getAttribute('data-section');
      const sectionWrapper = section.children[0];
      sectionWrapper.classList.replace('default-content-wrapper', `nav-${sectionClass}`);
    });

    const navigationWrapper = createElemWithClass('div', 'nav-wrapper');
    const navigationElement = createElemWithClass('nav', 'nav');
    navigationElement.id = 'nav';
    navigationElement.setAttribute('aria-expanded', isDesktop.matches);
    navigationWrapper.appendChild(navigationElement);
    headerBlock.appendChild(navigationWrapper);

    const navigation = headerBlock.querySelector('nav');
    const navigationSections = buildSections(navigationHtml.querySelector('.nav-sections'));
    console.log(navigationSections);
    const hamburgerMenu = buildHamburger();
    hamburgerMenu.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleNavigation(navigation);
    });

    const contactUsSection = navigationHtml.querySelector('.nav-contact-us');
    const contactUsButton = navigationHtml.querySelector('div > p');
    contactUsButton.classList.add('button-container');
    const utilitySection = navigationHtml.querySelector('.nav-utility');
    console.log('navElement');
    if (navigationPath === '/drafts/tmc/nav1') {
      const navElement = document.getElementById('nav');
      navElement.classList.add('tmc');
    }
    // Order maintains tabindex keyboard navigation
    navigation.append(buildLogo());
    navigation.append(hamburgerMenu);
    navigation.append(navigationSections);
    navigation.append(contactUsSection);

    buildSubNavigationDropdown(navigation);

    await decorateIcons(headerBlock);

    observeSectionInteractions();

    // on window resize, toggle the navigation
    window.addEventListener('resize', () => {
      navigation.setAttribute('aria-expanded', isDesktop.matches);
    });

    // Add a link to the Author guide, if anywhere in the Author Guide
    if (window.location.pathname.startsWith('/author-guide')) {
      const listItem = document.createElement('li');
      listItem.innerHTML = '<a href="/author-guide/">Author Guide</a>';
      utilitySection.querySelector('ul').prepend(listItem);
    }
  }
}
