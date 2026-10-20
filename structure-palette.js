/* Reuse frontend-wr's unmodified artwork with this site's three-color palette.
 * A static WebGL color pass preserves geometry, light and alpha; CSS moves the
 * whole bound assembly. No simulation or coordinate-derived rendering.
 */
(() => {
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){uv=vec2(position.x,1.0-position.y);gl_Position=vec4(position*2.0-1.0,0.,1.);}`;
  const fragment = `precision mediump float; uniform sampler2D artwork; varying vec2 uv;
    void main(){
      vec4 tex=texture2D(artwork,uv); vec3 c=tex.rgb;
      float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b));
      vec3 blue=vec3(114.,138.,185.)/255.;
      vec3 rose=vec3(245.,181.,191.)/255.;
      vec3 gold=vec3(245.,221.,181.)/255.;
      vec3 base=blue;
      if(c.r>c.b*1.08 && c.g>c.b*1.025) base=gold;
      else if((c.r>c.g*1.06 && c.b>c.g*1.02) || (c.r>c.g*1.2 && c.r>c.b*1.1)) base=rose;
      float light=dot(c,vec3(.299,.587,.114));
      vec3 shade=light<.7?base*(light/.7):mix(base,vec3(1.),clamp((light-.7)/.3,0.,1.));
      vec3 color=mix(vec3(light),shade,smoothstep(.025,.09,hi-lo));
      gl_FragColor=vec4(color*tex.a,tex.a);
    }`;
  let renderer;
  function getRenderer() {
    if (renderer) return renderer;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!gl) return null;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Palette shader unavailable');
      return shader;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(gl.getUniformLocation(program, 'artwork'), 0);
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    renderer = {canvas, gl};
    return renderer;
  }
  async function recolor(img) {
    try {
      await img.decode();
      const context = getRenderer();
      if (!context || context.gl.isContextLost()) return;
      const {canvas, gl} = context;
      canvas.width = canvas.height = 720;
      gl.viewport(0, 0, 720, 720);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      // Share one GPU context; each visible assembly uses a cheap static canvas.
      const output = document.createElement('canvas');
      output.width = output.height = 720;
      output.className = 'structure-palette'; output.setAttribute('aria-hidden', 'true');
      output.getContext('2d').drawImage(canvas, 0, 0);
      img.after(output); img.classList.add('palette-ready');
    } catch { /* The original, complete structure remains available as fallback. */ }
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target); recolor(entry.target);
    });
  }, {rootMargin: '400px'});
  document.querySelectorAll('.source-scene .wr-structure').forEach(img => observer.observe(img));
})();
