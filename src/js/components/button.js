export const button = ({
  onClick,
  id,
  className,
  text,
}) => {
  const element = document.createElement('button');

  element.setAttribute('type', 'button');

  if (typeof text === 'string') {
    element.textContent = text;
  }

  if (typeof id === 'string') {
    element.setAttribute('id', id);
  }

  if (typeof className === 'string') {
    element.setAttribute('class', className);
  }

  if (typeof onClick === 'function') {
    element.addEventListener('click', onClick);
  }

  return element;
};
