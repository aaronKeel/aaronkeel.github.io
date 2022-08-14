const rn = Math.random;

export const randColor = () => {
  const r = rn();
  const g = rn();
  const b = rn();

  return [r, g, b, 1];
};
