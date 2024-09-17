import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  block.classList.add(`calendar-events-${block.children.length}`);

  [...block.children].forEach((row) => {
    row.classList.add('calendar-event');
    const decoration = row.children[0].textContent;
    const dateOrHeading = row.children[1];
    const description = row.children[2];
    const contentContainer = document.createElement('div');

    const className = decoration ? decoration.replaceAll(/(\s|-|:)+/g, '-') : 'event-card';

    contentContainer.classList.add(className);
    contentContainer.append(dateOrHeading, description);
    row.replaceChildren(contentContainer);
  });

  await decorateIcons(block);
}
