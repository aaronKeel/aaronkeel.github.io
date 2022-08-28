import '../../css/link-list.css';

export const link = ({
  text,
  href,
  className,
  id,
}) => {
  const element = document.createElement('a');

  if (typeof text === 'string') {
    element.textContent = text;
  }

  if (typeof href === 'string') {
    element.setAttribute('href', href);
  }

  if (typeof id === 'string') {
    element.setAttribute('id', id);
  }

  if (typeof className === 'string') {
    element.setAttribute('class', className);
  }

  return element;
};

export const linkList = ({
  className,
  id,
  list,
}) => {
  const element = document.createElement('ul');

  if (typeof id === 'string') {
    element.setAttribute('id', id);
  }

  if (typeof className === 'string') {
    element.setAttribute('class', className);
  }

  if (Array.isArray(list)) {
    list.forEach((item) => {
      const listItem = document.createElement('li');

      listItem.appendChild(item);

      element.appendChild(listItem);
    });
  }

  return element;
};

export const renderBasicLinkList = ({ listData, parentElement }) => {
  const links = linkList({
    className: 'basic-link-list',
    list: listData.map((item) => link(item)),
  });

  parentElement.appendChild(links);
};
