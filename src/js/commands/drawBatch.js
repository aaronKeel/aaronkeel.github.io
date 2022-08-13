export const drawBatch = (regl) => regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }
  `,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform vec2 offset;
    void main() {
      gl_Position = vec4(position.x + offset.x, position.y + offset.y, 0, 1);
    }
  `,

  attributes: {
    position: [0, 0, 0, 0.5, 0.5, 0],
  },

  uniforms: {
    color: [1, 0, 0, 1],
    offset: regl.prop('offset'),
  },

  depth: {
    enable: false,
  },

  count: 3,
});
