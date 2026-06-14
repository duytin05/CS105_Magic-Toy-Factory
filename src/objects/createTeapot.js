import * as THREE from 'three';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
import { getMaterial } from './createBasicShapes.js'; 

export function getTeapot(size) {
    const geometry = new TeapotGeometry(size, 15);
    const material = getMaterial('standard', '#e91e63'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Teapot', params: { size } };
    return mesh;
}