export const drawTriangleScatter = (regl) => regl({
  frag: `
    precision mediump float;
    uniform vec4 color;
    uniform float height;
    uniform float width;
    void main() {
      vec2 reso = vec2(width, height);
      vec2 coord = gl_FragCoord.xy/reso;
      gl_FragColor = vec4(color.xyz, coord.x);
    }
  `,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform vec2 offset;
    uniform float sizeScale;

    void main() {
      gl_Position = vec4((position.x * sizeScale) + offset.x, (position.y * sizeScale) + offset.y, 0, 1);
    }
  `,

  attributes: {
    position: [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0]],
  },

  uniforms: {
    color: regl.prop('color'),
    offset: regl.prop('offset'),
    sizeScale: regl.prop('sizeScale'),
    height: regl.prop('height'),
    width: regl.prop('width'),
  },

  depth: {
    enable: false,
  },

  count: 3,
});
