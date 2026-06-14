import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap'; 

import { getRenderer } from './core/renderer.js';
import { getCamera } from './core/camera.js';
import { getPlane } from './objects/createBasicShapes.js';
import { getAmbientLight, getSpotLight } from './core/lights.js';
import { getBox, getSphere, getCone, getCylinder, getTorus, getDodecahedron, getTorusKnot, getOctahedron } from './objects/createBasicShapes.js';
import { getTeapot } from './objects/createTeapot.js';
import { initTransformUI, objectsArray, selectedObjects, initRaycaster, deleteSelectedObject, deleteAllObjects,undoLastAction, redoLastAction, showToast, showAlert } from './controls/eventHandlers.js';
import { initToolPanel, applyRenderMode } from './ui/toolPanel.js'; 
import { initTeacherMode } from './ui/teacherMode.js';
import { initTextureUploader } from './ui/textureUploader.js';
import { initCustomModelLoader, mixers } from './objects/loadCustomModel.js';
import { initFactoryAnimation } from './animation/factoryAnimation.js'; 
import { startWelcomeAnimation } from './animation/welcomeAnimation.js';
import { loadSceneFromIndexedDB } from './core/SceneStorage.js';
import { saveActionToHistory } from './core/stateManager.js';

const clock = new THREE.Clock();

function init() {
    const scene = new THREE.Scene();

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    axesHelper.visible = false;

    const camera = getCamera();
    const renderer = getRenderer();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 

    const plane = getPlane(50);
    plane.rotation.x = -Math.PI / 2; 
    
    scene.add(plane);

    const ambientLight = getAmbientLight(0.7);
    scene.add(ambientLight);

    const spotLight = getSpotLight(1.8);
    spotLight.position.set(15, 40, 30);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.4);
    scene.add(hemisphereLight);

    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);
    spotLightHelper.visible = false; 

    initRaycaster(camera, scene, renderer, controls);
    initToolPanel(scene, 30, 2); 
    initTransformUI(); 
    initCustomModelLoader(scene); 

    const btnDelete = document.getElementById('btn-delete');
    if (btnDelete) {
        btnDelete.addEventListener('click', () => deleteSelectedObject(scene));
    }

    const btnDeleteAll = document.getElementById('btn-delete-all');
    if (btnDeleteAll) {
        btnDeleteAll.addEventListener('click', () => deleteAllObjects(scene));
    }

    document.getElementById('btn-undo')?.addEventListener('click', () => undoLastAction(scene));
    document.getElementById('btn-redo')?.addEventListener('click', () => redoLastAction(scene));

    const btnGuide = document.querySelector('.btn-guide');
    const guideModal = document.getElementById('guide-modal');
    const guideOverlay = document.getElementById('guide-overlay');
    const btnCloseGuide = document.getElementById('btn-close-guide');

    if (btnGuide && guideModal && btnCloseGuide && guideOverlay) {
        btnGuide.addEventListener('click', () => {
            guideModal.classList.remove('hidden');
            guideOverlay.classList.remove('hidden');
        });

        btnCloseGuide.addEventListener('click', () => {
            guideModal.classList.add('hidden');
            guideOverlay.classList.add('hidden');
        });

        guideOverlay.addEventListener('click', () => {
            guideModal.classList.add('hidden');
            guideOverlay.classList.add('hidden');
        });
    }

    initTeacherMode(camera, spotLight, spotLightHelper,axesHelper); 
    initTextureUploader();
    initFactoryAnimation();

    // --- XỬ LÝ NÚT "THAY ĐỔI" Ở BÊN BẢNG PHẢI ---
    const btnApplyMode = document.getElementById('btn-apply-mode');
    const editModeSelect = document.getElementById('edit-mode-select');
    
    if (btnApplyMode && editModeSelect) {
        btnApplyMode.addEventListener('click', () => {
            const mode = editModeSelect.value;
            const targetArray = selectedObjects.length > 0 ? selectedObjects : objectsArray;
            
            if (targetArray.length === 0) {
                showAlert("⚠️ Xưởng đang trống!", "Hãy thêm đồ chơi trước khi dùng đũa thần nha!");
                return;
            }

            saveActionToHistory(`Đổi sang ${mode}`);

            targetArray.forEach(obj => {
                obj.traverse(child => {
                    applyRenderMode(child, mode);
                });
            });
            showToast(` ✨ Đã hóa phép ${targetArray.length} đồ chơi sang ${mode}!`, true);
            
            const display = document.getElementById('current-mode-display');
            if (display) {
                if (mode === 'solid') { display.innerText = "Khối đặc (Solid)"; display.style.color = "#00cec9"; }
                else if (mode === 'lines') { display.innerText = "Đường nét (Lines)"; display.style.color = "#00cec9"; }
                else if (mode === 'point') { display.innerText = "Các điểm (Point)"; display.style.color = "#00cec9"; }
            }
        });
    }

    // --- QUÉT TRẠNG THÁI KHI CLICK CHỌN VẬT THỂ ---
    renderer.domElement.addEventListener('pointerdown', () => {
        setTimeout(() => {
            const display = document.getElementById('current-mode-display');
            if (!display) return;

            if (selectedObjects.length === 1) {
                let currentMode = "Khối đặc (Solid)"; 
                selectedObjects[0].traverse((child) => {
                    if (child.isMesh) {
                        if (child.material.wireframe) currentMode = "Đường nét (Lines)";
                        else if (child.material.opacity === 0) currentMode = "Các điểm (Point)";
                    }
                });
                display.innerText = currentMode;
                display.style.color = "#00cec9";
            } else if (selectedObjects.length > 1) {
                display.innerText = "Nhiều vật thể";
                display.style.color = "#fdcb6e"; 
            } else {
                display.innerText = "Chưa chọn";
                display.style.color = "#ff9800"; 
            }
        }, 100); 
    });

    const sidebarLeft = document.getElementById('sidebar-left');
    const btnToggleLeft = document.getElementById('btn-toggle-left');
    
    if (btnToggleLeft && sidebarLeft) {
        btnToggleLeft.addEventListener('click', () => {
            sidebarLeft.classList.toggle('collapsed-left');
            btnToggleLeft.innerText = sidebarLeft.classList.contains('collapsed-left') ? '❯' : '❮';
        });
    }

    const sidebarRight = document.getElementById('sidebar-right');
    const btnToggleRight = document.getElementById('btn-toggle-right');
    
    if (btnToggleRight && sidebarRight) {
        btnToggleRight.addEventListener('click', () => {
            sidebarRight.classList.toggle('collapsed-right');
            btnToggleRight.innerText = sidebarRight.classList.contains('collapsed-right') ? '❮' : '❯';
        });
    }

    update(renderer, scene, camera, controls);
    startWelcomeAnimation(camera, scene);

    setTimeout(() => {
        loadSceneFromIndexedDB(scene); 
    }, 1500);
}

function update(renderer, scene, camera, controls) {
    controls.update(); 
    
    const delta = clock.getDelta();
    if (mixers && mixers.length > 0) {
        for (let i = 0; i < mixers.length; i++) {
            mixers[i].update(delta);
        }
    }
    
    scene.traverse((obj) => {
        if (obj.type === 'SpotLightHelper') obj.update();
    });
    renderer.render(scene, camera);
    
    requestAnimationFrame(function() {
        update(renderer, scene, camera, controls);
    });
}

window.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault();
            undoLastAction(scene);
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
            event.preventDefault();
            redoLastAction(scene);
        }
    });

init();