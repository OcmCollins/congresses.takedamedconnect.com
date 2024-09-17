/**
 * Determines the size of the grid and return the dimensions and rows.
 * @param {HTMLElement} parent
 * @return {{size: {columns: (number), rows: (number)}, rows: (null|NodeList) }}
 */
function parseGrid(parent) {
  const rows = parent.querySelectorAll('& > div');
  const rowCount = rows.length || 0;
  const columnCount = rows[0]?.children.length || 0;
  const rowsReturnVal = rows.length ? rows : null;

  return { size: { rows: rowCount, columns: columnCount }, rows: rowsReturnVal };
}

export default async function decorate(block) {
  // Search for rows once only
  const gridSize = parseGrid(block);

  // Bail if there is nothing to decorate
  if (!gridSize.rows) return;

  gridSize.rows.forEach((row) => {
    const wrappers = row.querySelectorAll('& > div');
    const evenWidthMeasure = gridSize.size.columns;

    wrappers.forEach((wrappingDiv) => {
      wrappingDiv.style.cssText = `
          display: inline-block;
          width: calc(100%/${evenWidthMeasure});
          max-width: calc(100%/${evenWidthMeasure});
      `;

      wrappingDiv.querySelectorAll('& h3').forEach((textParent) => {
        const icon = textParent.querySelector('& > span.icon');
        const text = textParent.innerText;
        const textContainer = document.createElement('span');

        textContainer.setAttribute('data-text-content', '');
        textContainer.textContent = text;
        textParent.replaceChildren(icon, textContainer);
      });
    });
  });
}
