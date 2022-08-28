export const drawVertexTriangle = (regl) => regl({
  frag: `
    varying lowp vec3 color;

    void main() {
      gl_FragColor = vec4(color, 1);
    }
  `,

  vert: `
    precision mediump float;
    attribute vec4 vertexPosition;
    attribute vec3 vertexColor;

    varying highp vec3 color;

    void main() {
      gl_Position = vertexPosition;
      color = vertexColor;
    }
  `,

  attributes: {
    vertexPosition: [[0, 0, 0, 1], [0, 1, 0, 1], [1, 0, 0, 1]],
    vertexColor: [[1, 1, 0], [0, 1, 1], [1, 0, 1]],
  },

  uniforms: {},

  depth: {
    enable: false,
  },

  count: 3,
});
