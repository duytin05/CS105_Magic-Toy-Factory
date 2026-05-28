import * as THREE from 'three';

export function getCamera() {
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    camera.position.set(0, 10, 15); 
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    return camera;
}