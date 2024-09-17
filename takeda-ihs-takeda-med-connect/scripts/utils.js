export function createElemWithClass(type, ...classNames) {
  const elem = document.createElement(type);
  elem.classList.add(...classNames);
  return elem;
}

export function setAttributes(element, attributes) {
  Object.keys(attributes).forEach((attributeKey) => {
    element.setAttribute(attributeKey, attributes[attributeKey]);
  });
}

export function createElementWithAttributes(tag, attributes) {
  const element = document.createElement(tag);
  setAttributes(element, attributes);
  return element;
}
