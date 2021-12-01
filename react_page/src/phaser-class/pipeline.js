import Phaser from "phaser";
const Vignette = new Phaser.Class({

  Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,

  initialize:

    function Vignette(game) {
      Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
        game: game,
        renderer: game.renderer,
        fragShader: `
      precision mediump float;
              uniform vec2  resolution;
              uniform float tx;
              uniform float ty;
              uniform float r;
      uniform float b;
      uniform float bright;
      uniform float bgred;
      uniform float bggreen;
      uniform float bgblue;
      uniform float red;
      uniform float green;
      uniform float blue;
              uniform sampler2D uMainSampler;
              varying vec2 outTexCoord;
              vec3 makeCircle(vec2 st,vec2 center, vec3 col){
                  float d = distance(st,center);
                  float pct = smoothstep(r,r+b,d);
                  return vec3(1.0-pct*red,1.0-pct*green, 1.0-pct*blue)*col*bright;
              }
              void main(void) {
                  vec2 st = vec2(gl_FragCoord.x/resolution.x,gl_FragCoord.y/resolution.y);
                  vec4 color = texture2D(uMainSampler, outTexCoord);
        vec4 beforeColor = color*vec4(makeCircle(st,vec2(tx,ty),vec3(1.0)),1.0);
                  gl_FragColor = vec4 (beforeColor.x*bgred, beforeColor.y*bggreen, beforeColor.z*bgblue, beforeColor.w);
              }
      `
      });
      /*
            regular:
            precision mediump float;
                    uniform sampler2D uMainSampler;
                    varying vec2 outTexCoord;
                    void main(void) {
                    vec4 color = texture2D(uMainSampler, outTexCoord);
                    float gray = dot(color.rgb, vec3(0.5, 1, 1));
            vec3 test = vec3(gray);

            vec3 hi = test.yyx;
                    gl_FragColor = vec4(color.x * 1.0, color.y * 1.0, color.z * 1.0, 1);
                    }`


            vignette:
            void main(void) {
                        vec2 st = vec2(gl_FragCoord.x/resolution.x,gl_FragCoord.y/resolution.y);
                        vec4 color = texture2D(uMainSampler, outTexCoord);
              vec3 beforeColor = color*vec4(makeCircle(st,vec2(tx,ty),vec3(1.0)),1.0);
                        gl_FragColor = color*vec4(makeCircle(st,vec2(tx,ty),vec3(1.0)),1.0);
                    }
      */
    }
});
