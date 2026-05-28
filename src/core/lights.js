import * as THREE from 'three';

export function getAmbientLight(intensity) {
  return new THREE.AmbientLight('rgb(255,255,255)', intensity);
}

export function getSpotLight(intensity, color = 'rgb(255,255,255)') {
  const light = new THREE.SpotLight(color, intensity);
  light.castShadow = true;
  light.penumbra = 0.5;

  light.decay = 0;            // tắt attenuation
  light.distance = 0;         // 0 = không giới hạn
  light.angle = Math.PI / 6;  // mở rộng góc nón 

  light.shadow.mapSize.width = 4096 ;
  light.shadow.mapSize.height = 4096;
  light.shadow.bias = -0.00005;

  const camera = light.shadow.camera;
  camera.near = 0.5;
  camera.far = 200;
  camera.fov = THREE.MathUtils.radToDeg(light.angle) * 1.2; 

  return light;
}