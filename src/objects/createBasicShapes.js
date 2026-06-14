import * as THREE from 'three';

export function getMaterial(type, color = '#ffffff') {
    const materialOptions = { color: color };
    let selectedMaterial;
    switch (type) {
        case 'basic': selectedMaterial = new THREE.MeshBasicMaterial(materialOptions); break;
        case 'lambert': selectedMaterial = new THREE.MeshLambertMaterial(materialOptions); break;
        case 'standard': selectedMaterial = new THREE.MeshStandardMaterial(materialOptions); break;
        default: selectedMaterial = new THREE.MeshPhongMaterial(materialOptions); break;
    }
    return selectedMaterial;
}

export function getPlane(size) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = getMaterial('standard', '#faf0e6');
    material.side = THREE.DoubleSide; 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true; 
    mesh.userData = { shapeType: 'Plane', params: { size } };
    return mesh;
}

export function getBox(w, h, d) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = getMaterial('standard', '#ff4b4b'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true; 
    mesh.position.y = h ? h / 2 : 0.5;
    
    // Gắn thẻ nhớ: Hình gì + Kích thước bao nhiêu
    mesh.userData = { shapeType: 'Box', params: { w, h, d } };
    return mesh;
}

export function getSphere(radius) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = getMaterial('standard', '#4caf50'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Sphere', params: { radius } };
    return mesh;
}

export function getCone(radius, height) {
    const geometry = new THREE.ConeGeometry(radius, height, 32);
    const material = getMaterial('standard', '#ffeb3b'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Cone', params: { radius, height } };
    return mesh;
}

export function getCylinder(radius, height) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = getMaterial('standard', '#2196f3'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Cylinder', params: { radius, height } };
    return mesh;
}

export function getTorus(radius, tube) {
    const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
    const material = getMaterial('standard', '#9c27b0'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Torus', params: { radius, tube } };
    return mesh;
}

export function getDodecahedron(radius) {
    const geometry = new THREE.DodecahedronGeometry(radius);
    const material = getMaterial('standard', '#00bcd4'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Dodecahedron', params: { radius } };
    return mesh;
}

export function getTorusKnot(radius, tube) {
    const geometry = new THREE.TorusKnotGeometry(radius, tube, 100, 16);
    const material = getMaterial('standard', '#ff5722'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'TorusKnot', params: { radius, tube } };
    return mesh;
}

export function getOctahedron(radius) {
    const geometry = new THREE.OctahedronGeometry(radius);
    const material = getMaterial('standard', '#8bc34a'); 
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData = { shapeType: 'Octahedron', params: { radius } };
    return mesh;
}