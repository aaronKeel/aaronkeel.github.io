export const drawTriangle = (regl) => regl({
  frag: `
  void main() {
    gl_FragColor = vec4(1, 0, 0, 1);
  }`,

  vert: `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0, 1);
  }`,

  attributes: {
    position: [[0, -1], [-1, 0], [1, 1]],
  },

  count: 3,
});
