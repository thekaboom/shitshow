setTimeout(async () => {
  console.clear();
  ReactDOM.render(
  React.createElement(Threelium.SceneView, {
    antialias: true,
    camera:
    React.createElement(Threelium.Camera, {
      position: new THREE.Vector3(0, 0, 1) }) },



  React.createElement(MainScene, null)),

  document.getElementById('js-app'));
}, 0);

class MainScene extends Threelium.Scene {
  initialize({})
  {
    return (
      React.createElement(React.Fragment, null,
      React.createElement(Threelium.AmbientLight, { color: 0xffffff }),
      React.createElement(CutPaper, {
        useColor: true,
        useShadow: true,
        useRelief: true })));



  }}


class CutPaper extends THREE.Mesh {
  static createGeometry(
  width,
  height)
  {
    const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
    return geometry;
  }

  static createMaterial(
  useColor,
  useShadow,
  useRelief)
  {
    return new Threelium.EnhancedMaterial({
      flatShading: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio) },
        uColor0: { value: colorThreshold(0, 0, 0, 0.0) },
        uColor1: { value: colorThreshold(105, 64, 182, 0.16) },
        uColor2: { value: colorThreshold(181, 61, 210, 0.32) },
        uColor3: { value: colorThreshold(250, 90, 186, 0.48) },
        uColor4: { value: colorThreshold(51, 207, 206, 0.64) },
        uColor5: { value: colorThreshold(254, 230, 122, 0.8) } },

      varyingParameters: [`
        varying vec2 vUv;
      `],
      vertexPosition: [`
        vUv = uv;
      `],
      fragmentParameters: [`
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec4 uColor0;
        uniform vec4 uColor1;
        uniform vec4 uColor2;
        uniform vec4 uColor3;
        uniform vec4 uColor4;
        uniform vec4 uColor5;
      `],
      fragmentFunctions: [`
        ${document.getElementById('js-noise').textContent}

        float getSample (vec2 point, float theta, float time, float scale, vec2 offset) {
          return snoise((point * scale + offset) + vec2(
            cos(theta),
            sin(theta)
          ) * time) / 2.0 + 0.5;
        }

        vec3 getColor (float height) {
          if (height > uColor5.a) {
            return uColor5.rgb;
          }
          if (height > uColor4.a) {
            return uColor4.rgb;
          }
          if (height > uColor3.a) {
            return uColor3.rgb;
          }
          if (height > uColor2.a) {
            return uColor2.rgb;
          }
          if (height > uColor1.a) {
            return uColor1.rgb;
          }
          return uColor0.rgb;
        }

        float getHeight (vec2 point, vec2 offset) {
          float theta = PI * 1.0;
          float time = uTime * 0.1;
          float scale = 2.0;
          float height = 0.0;
          height += getSample(point, theta, time, scale, offset);
          theta += PI;
          scale = 1.8;
          time = uTime * 0.02;
          height += getSample(point, theta, time, scale, offset);
          height /= 2.0;
          float topLayerHeight = 0.0;
          theta = PI * 2.0;
          time = uTime * 0.125;
          scale = 1.8;
          topLayerHeight += getSample(point, theta, time, scale, offset);
          theta += PI;
          scale = 1.4;
          time = uTime * 0.03;
          topLayerHeight += getSample(point, theta, time, scale, offset);
          topLayerHeight /= 2.0;
          return height + step(uColor5.a, topLayerHeight);
        }

        vec3 getRelief (vec2 point, float thickness, float bumpScale) {
          float h00 = getHeight(point, vec2(0.0, 0.0));
          float h11 = getHeight(point, vec2(-thickness, thickness));
          float h = 0.0;
          h += step(uColor5.a, h00) - step(uColor5.a, h11);
          h += step(uColor4.a, h00) - step(uColor4.a, h11);
          h += step(uColor3.a, h00) - step(uColor3.a, h11);
          h += step(uColor2.a, h00) - step(uColor2.a, h11);
          h += step(uColor1.a, h00) - step(uColor1.a, h11);
          return vec3(max(h, 0.0) * bumpScale);
        }

        vec3 getShadow (vec2 point, float thickness, float bumpScale) {
          float h00 = getHeight(point, vec2(0.0, 0.0));
          float h11 = getHeight(point, vec2(-thickness, thickness));
          float h = 0.0;
          h += step(uColor5.a, h00) - step(uColor5.a, h11);
          h += step(uColor4.a, h00) - step(uColor4.a, h11);
          h += step(uColor3.a, h00) - step(uColor3.a, h11);
          h += step(uColor2.a, h00) - step(uColor2.a, h11);
          h += step(uColor1.a, h00) - step(uColor1.a, h11);
          return -vec3(min(h, 0.0) * bumpScale);
        }
      `],
      fragmentDiffuse: [`
        vec2 point = gl_FragCoord.xy / uResolution;
        point.x *= uResolution.x / uResolution.y;
        diffuseColor.rgb = vec3(0.5);
        ${useColor ? `
          float height = getHeight(point, vec2(0.00, 0.00));
          diffuseColor.rgb = getColor(height);
        ` : ''}
        ${useRelief ? `
          diffuseColor.rgb += getRelief(point, 0.01, 0.125);
        ` : ''}
        ${useShadow ? `
          diffuseColor.rgb -= getShadow(point, 0.025, 0.08);
        ` : ''}
      `] });

  }

  constructor({
    width = 2,
    height = 2,
    useColor = true,
    useShadow = true,
    useRelief = true })
  {
    const geometry = CutPaper.createGeometry(
    width,
    height);

    const material = CutPaper.createMaterial(
    useColor,
    useShadow,
    useRelief);

    super(geometry, material);
  }

  update() {
    this.material.uniforms.uResolution.value.x = window.innerWidth * window.devicePixelRatio;
    this.material.uniforms.uResolution.value.y = window.innerHeight * window.devicePixelRatio;
  }

  get time() {
    return this.material.uniforms.uTime.value;
  }

  set time(newTime) {
    this.material.uniforms.uTime.value = newTime;
  }}


function colorThreshold(r, g, b, threshold) {
  return [
  ...[r, g, b].map(i => i / 255),
  threshold];

}