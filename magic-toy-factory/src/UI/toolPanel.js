import * as THREE from 'three';
import { shapeCreators } from '../data/shapes.js';
import { objectsArray } from '../controls/eventHandlers.js';

export function applyRenderMode(child, mode) {
    if (child.userData.isCollider) return;

    if (child.isMesh || child.isSkinnedMesh) {
        if (mode === 'solid') {
            child.material.wireframe = false; 
            child.material.transparent = false; 
            child.material.opacity = 1;
            child.castShadow = true; 
            child.material.needsUpdate = true; 
            if (child.userData.pointsObj) child.userData.pointsObj.visible = false;
            
        } else if (mode === 'lines') { 
            child.material.wireframe = true; 
            child.material.transparent = false; 
            child.material.opacity = 1;
            child.castShadow = true; 
            child.material.needsUpdate = true; 
            if (child.userData.pointsObj) child.userData.pointsObj.visible = false;
            
        } else if (mode === 'point') { 
            child.material.wireframe = false; 
            child.material.transparent = true; 
            child.material.opacity = 0; 
            child.castShadow = false; 
            child.material.needsUpdate = true; 
            
            if (!child.userData.pointsObj) {
                const pointsMat = new THREE.PointsMaterial({ size: 0.1, color: child.userData.originalColor || child.material.color });
                const pointsObj = new THREE.Points(child.geometry, pointsMat);
                child.add(pointsObj);
                child.userData.pointsObj = pointsObj;
            }
            child.userData.pointsObj.visible = true;
        }
    }
}

export function getSafePosition(mesh, planeSize = 30, minSpacing = 2) {
    mesh.updateMatrixWorld(true);
    const size = new THREE.Vector3();
    const tempBox = new THREE.Box3().setFromObject(mesh);
    tempBox.getSize(size);
    
    const yPos = size.y > 0 ? size.y / 2 : (mesh.position.y || 0);
    const halfSize = planeSize / 2 - Math.max(size.x, size.z) / 2;

    const checkCollision = (x, z) => {
        mesh.position.set(x, yPos, z);
        mesh.updateMatrixWorld(true);
        const newBox = new THREE.Box3().setFromObject(mesh);
        newBox.expandByScalar(minSpacing / 2);

        const existingBox = new THREE.Box3();
        for (let obj of objectsArray) {
            existingBox.setFromObject(obj);
            existingBox.expandByScalar(minSpacing / 2);
            if (newBox.intersectsBox(existingBox)) return true; 
        }
        return false; 
    };

    for (let i = 0; i < 200; i++) {
        const x = (Math.random() * 2 - 1) * halfSize;
        const z = (Math.random() * 2 - 1) * halfSize;
        if (!checkCollision(x, z)) return true;
    }
    return false; 
}

export function initToolPanel(scene, planeSize = 30, minSpacing = 2) {
    const select = document.getElementById('basic-shape-select');
    const colorPicker = document.getElementById('basic-shape-color');
    const btnAdd = document.getElementById('btn-add-basic-shape');
    const cbUseDefault = document.getElementById('basic-use-default'); 

    if (!select || !btnAdd || !colorPicker) return;

    shapeCreators.forEach((shape, index) => {
        const opt = document.createElement('option');
        opt.value = index; 
        opt.textContent = shape.label;
        opt.style.color = "black";
        select.appendChild(opt);
    });

    btnAdd.addEventListener('click', () => {
        const selectedIndex = select.value;
        const mesh = shapeCreators[selectedIndex].fn();

        if (mesh.material) {
            mesh.material = mesh.material.clone();
        }

        const useDefault = cbUseDefault ? cbUseDefault.checked : false;
        if (!useDefault) {
            const pickedColor = colorPicker.value;
            mesh.material.color.set(pickedColor);
            mesh.userData.originalColor = new THREE.Color(pickedColor);
        } else {
            mesh.userData.originalColor = mesh.material.color.clone();
        }

        const currentMode = document.getElementById('create-mode-select').value;
        applyRenderMode(mesh, currentMode);

        const hasSpace = getSafePosition(mesh, planeSize, minSpacing);

        if (hasSpace) {
            scene.add(mesh);
            objectsArray.push(mesh);
        } else {
            const alertBox = document.getElementById('custom-alert');
            const alertOverlay = document.getElementById('alert-overlay');
            if (alertBox) {
                document.getElementById('alert-title').innerText = "🧸 Xưởng đầy rồi!";
                document.getElementById('alert-msg').innerText = "Xưởng bừa bộn quá rồi, dọn dẹp bớt thôi nào!";
                alertBox.classList.remove('hidden');
                if (alertOverlay) alertOverlay.classList.remove('hidden');
                document.getElementById('btn-close-alert').onclick = () => {
                    alertBox.classList.add('hidden');
                    if (alertOverlay) alertOverlay.classList.add('hidden');
                };
            }
        }
    });
}