import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import gsap from 'gsap';

export const objectsArray = []; 
export let selectedObjects = []; 
export let transformCtrl;
const trashBin = []; 

export function showAlert(title, message) {
    const alertBox = document.getElementById('custom-alert');
    const alertOverlay = document.getElementById('alert-overlay'); 
    if (alertBox) {
        document.getElementById('alert-title').innerText = title;
        document.getElementById('alert-msg').innerText = message;
        alertBox.classList.remove('hidden');
        if (alertOverlay) alertOverlay.classList.remove('hidden');
        document.getElementById('btn-close-alert').onclick = () => {
            alertBox.classList.add('hidden');
            if (alertOverlay) alertOverlay.classList.add('hidden');
        };
    }
}

export function showToast(message, isSuccess = false) {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        const toast = document.createElement('div');
        toast.className = 'delete-toast';
        if (isSuccess) toast.style.background = 'linear-gradient(135deg, #00b894, #00cec9)';
        toast.innerText = message;
        toastContainer.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2000);
    }
}

export function initRaycaster(camera, scene, renderer, orbitControls) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    transformCtrl = new TransformControls(camera, renderer.domElement);
    transformCtrl.size = 1.5; 

    transformCtrl.addEventListener('dragging-changed', (event) => orbitControls.enabled = !event.value);
    transformCtrl.addEventListener('mouseDown', () => orbitControls.enabled = false);
    transformCtrl.addEventListener('mouseUp', () => orbitControls.enabled = true);

    transformCtrl.addEventListener('objectChange', () => {
        if (transformCtrl.object) {
            const obj = transformCtrl.object;
            const box = new THREE.Box3().setFromObject(obj);
            if (box.min.y < 0) {
                obj.position.y -= box.min.y;
            }
        }
    });

    scene.add(transformCtrl); 

    function clearSelection() {
        selectedObjects.forEach(obj => {
            if (obj.userData.colorTween) obj.userData.colorTween.kill();
            obj.traverse(child => {
                if (child.isMesh && child.userData.originalColor) {
                    child.material.color.copy(child.userData.originalColor);
                }
            });
        });
        selectedObjects.length = 0;
        if (transformCtrl) transformCtrl.detach(); 
        
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.innerText = "🎯 Đang chọn: 0 đồ chơi";
            statusText.classList.remove('active');
        }
    }

    window.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.glass-panel') || (transformCtrl && transformCtrl.dragging)) return;
        if (transformCtrl && transformCtrl.axis !== null) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(objectsArray, true);

        if (hits.length > 0) {
            let hitObject = null;
            let current = hits[0].object;
            
            while (current) {
                if (objectsArray.includes(current)) {
                    hitObject = current;
                    break;
                }
                current = current.parent;
            }

            if (!hitObject) return; 

            if (!event.shiftKey) {
                clearSelection();
                selectedObjects.push(hitObject);
            } else {
                if (!selectedObjects.includes(hitObject)) selectedObjects.push(hitObject);
                transformCtrl.detach(); 
            }

            hitObject.traverse(child => {
                if (child.isMesh && !child.userData.originalColor) {
                    child.userData.originalColor = child.material.color.clone();
                }
            });

            if (hitObject.userData.colorTween) hitObject.userData.colorTween.kill();
            
            hitObject.userData.tweenValue = { progress: 0 };
            hitObject.userData.colorTween = gsap.to(hitObject.userData.tweenValue, {
                progress: 1, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut',
                onUpdate: () => {
                    hitObject.traverse(child => {
                        if (child.isMesh && child.userData.originalColor) {
                            const c = child.userData.originalColor.clone();
                            const dark = c.clone().multiplyScalar(0.5); 
                            child.material.color.lerpColors(dark, c, hitObject.userData.tweenValue.progress);
                        }
                    });
                }
            });

            if (!hitObject.userData.isAnimating) {
                hitObject.userData.isAnimating = true;
                gsap.killTweensOf(hitObject.position);
                gsap.to(hitObject.position, { 
                    y: hitObject.position.y + 0.8, 
                    duration: 0.25, 
                    ease: 'power2.out', 
                    yoyo: true, 
                    repeat: 1, 
                    overwrite: 'auto',
                    onComplete: () => hitObject.userData.isAnimating = false 
                });
            }

            const statusText = document.getElementById('status-text');
            if (statusText) {
                statusText.innerText = `🎯 Đang chọn: ${selectedObjects.length} đồ chơi`;
                statusText.classList.add('active');
            }

            const renderModeSelect = document.getElementById('render-mode-select');
            if (renderModeSelect) {
                let firstMesh = null;
                hitObject.traverse(child => { if(child.isMesh && !firstMesh) firstMesh = child; });
                if (firstMesh) {
                    if (firstMesh.userData.pointsObj && firstMesh.userData.pointsObj.visible) renderModeSelect.value = 'points';
                    else if (firstMesh.material.wireframe) renderModeSelect.value = 'wireframe';
                    else renderModeSelect.value = 'solid';
                }
            }
        } else {
            clearSelection(); 
        }
    });

    window.addEventListener('keydown', (event) => {
        if (selectedObjects.length === 0) return; 
        switch (event.key.toLowerCase()) {
            case 't': transformCtrl.attach(selectedObjects[0]); transformCtrl.setMode('translate'); break;
            case 'r': transformCtrl.attach(selectedObjects[0]); transformCtrl.setMode('rotate'); break;
            case 's': transformCtrl.attach(selectedObjects[0]); transformCtrl.setMode('scale'); break;
            case 'escape': clearSelection(); break; 
        }
    });
}

export function initTransformUI() {
    function attachAndSetMode(mode) {
        if (selectedObjects.length > 0) { 
            transformCtrl.attach(selectedObjects[0]); 
            transformCtrl.setMode(mode); 
        } 
        else { 
            showAlert("⚠️ Ôi bạn ơi!", "Bạn chưa chọn đồ chơi nào để dùng Đũa Thần!"); 
        }
    }
    document.getElementById('btn-translate')?.addEventListener('click', () => attachAndSetMode('translate'));
    document.getElementById('btn-rotate')?.addEventListener('click', () => attachAndSetMode('rotate'));
    document.getElementById('btn-scale')?.addEventListener('click', () => attachAndSetMode('scale'));
}

export function deleteSelectedObject(scene) {
    if (selectedObjects.length === 0) { showAlert("⚠️ Ôi bạn ơi!", "Bạn chưa chọn đồ chơi nào để xóa!"); return 0; }
    const deletedBatch = [];
    selectedObjects.forEach(obj => {
        if (transformCtrl) transformCtrl.detach();
        try { gsap.killTweensOf(obj.position); if (obj.userData.colorTween) obj.userData.colorTween.kill(); } catch (e) {}
        scene.remove(obj);
        const index = objectsArray.indexOf(obj);
        if (index > -1) objectsArray.splice(index, 1);
        deletedBatch.push(obj); 
    });
    trashBin.push(deletedBatch);
    selectedObjects.length = 0;
    const statusText = document.getElementById('status-text');
    if (statusText) { statusText.innerText = "🎯 Đang chọn: 0 đồ chơi"; statusText.classList.remove('active'); }
    showToast(`💥 Bạn đã xóa ${deletedBatch.length} món đồ chơi!`);
}

export function deleteAllObjects(scene) {
    if (objectsArray.length === 0) return 0;
    const deletedBatch = [];
    if (transformCtrl) transformCtrl.detach();
    objectsArray.forEach(obj => {
        try { gsap.killTweensOf(obj.position); if (obj.userData.colorTween) obj.userData.colorTween.kill(); } catch (e) {}
        scene.remove(obj);
        deletedBatch.push(obj);
    });
    objectsArray.length = 0; selectedObjects.length = 0;
    trashBin.push(deletedBatch);
    const statusText = document.getElementById('status-text');
    if (statusText) { statusText.innerText = "🎯 Đang chọn: 0 đồ chơi"; statusText.classList.remove('active'); }
    showToast(`🌪️ Đã dọn sạch sẽ ${deletedBatch.length} đồ chơi!`);
}

export function undoLastAction(scene) {
    if (trashBin.length === 0) { showAlert("🤷‍♂️ Trống rỗng!", "Bạn chưa xóa đồ chơi nào để mà khôi phục!"); return; }
    const lastBatch = trashBin.pop(); 
    lastBatch.forEach(obj => { scene.add(obj); objectsArray.push(obj); });
    showToast(`✨ Đã lấy lại ${lastBatch.length} món đồ chơi!`, true);
}