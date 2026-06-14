import * as THREE from 'three';
import { selectedObjects, showAlert, showToast } from '../controls/eventHandlers.js'; 
import { autoSaveScene } from '../core/SceneStorage.js';
import { saveActionToHistory } from '../core/stateManager.js';

function checkInvalidRenderMode() {
    let isInvalid = false;
    selectedObjects.forEach(obj => {
        obj.traverse(child => {
            if (child.isMesh && (child.material.wireframe || child.material.opacity === 0)) {
                isInvalid = true;
            }
        });
    });
    return isInvalid;
}

export function initTextureUploader() {
    const btnUpload = document.getElementById('btn-upload-texture');
    const fileInput = document.getElementById('texture-upload');
    const btnRemove = document.getElementById('btn-remove-texture');
    if (!btnUpload || !fileInput) return;

    // 1. TẢI ẢNH TỪ MÁY TÍNH
    btnUpload.addEventListener('click', () => {
        if (selectedObjects.length === 0) { 
            showAlert("⚠️ Khoan đã!", "Bạn chưa chọn đồ chơi nào để dán nhãn!"); 
            return; 
        }
        
        // 🚫 BỘ LỌC CẢNH BÁO TEXTURE
        if (checkInvalidRenderMode()) {
            showAlert("⚠️ Không thể dán nhãn!", "Đồ chơi đang ở dạng Point hoặc Lines. Vui lòng đổi trạng thái về Solid để dán nhãn nha!");
            return;
        }

        fileInput.click(); 
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(e.target.result, (texture) => {
                saveActionToHistory("Dán Texture từ máy tính");
                texture.colorSpace = THREE.SRGBColorSpace;
                selectedObjects.forEach(obj => {
                    obj.traverse(child => {
                        if (child.isMesh) {
                            child.material.map = texture;
                            
                            if (child.userData.originalVertexColors === undefined) {
                                child.userData.originalVertexColors = child.material.vertexColors;
                            }
                            child.material.vertexColors = false; 

                            if (!child.userData.baseColor) child.userData.baseColor = child.userData.originalColor ? child.userData.originalColor.clone() : child.material.color.clone();
                            child.material.color.setHex(0xffffff);
                            if (child.userData.originalColor) child.userData.originalColor.setHex(0xffffff);
                            child.material.needsUpdate = true; 
                        }
                    });
                });
                showToast(`🎨 Đã dán nhãn thành công!`, true);
                saveActionToHistory("Dán nhãn");
                autoSaveScene();
            });
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    });

    // 2. TẨY NHÃN VÀ KHÔI PHỤC MÀU SƠN GỐC
    if (btnRemove) {
        btnRemove.addEventListener('click', () => {
            if (selectedObjects.length === 0) { showAlert("⚠️ Khoan đã!", "Bạn chưa chọn đồ chơi nào để tẩy nhãn!"); return; }
            saveActionToHistory("Tẩy Texture");
            selectedObjects.forEach(obj => {
                obj.traverse(child => {
                    if (child.isMesh) {
                        child.material.map = null; 
                        
                        if (child.userData.originalVertexColors !== undefined) {
                            child.material.vertexColors = child.userData.originalVertexColors;
                        }
                        
                        if (child.userData.baseColor) {
                            child.material.color.copy(child.userData.baseColor);
                            if (child.userData.originalColor) child.userData.originalColor.copy(child.userData.baseColor);
                        }
                        child.material.needsUpdate = true;
                    }
                });
            });
            showToast(`🧽 Đã tẩy nhãn sạch sẽ!`, true);
            autoSaveScene();
        });
    }

    // 3. DÁN NHÃN BẰNG 5 HÌNH MẪU CÓ SẴN
    const presetImages = document.querySelectorAll('.preset-tex');
    presetImages.forEach(img => {
        img.addEventListener('click', () => {
            if (selectedObjects.length === 0) { 
                showAlert("⚠️ Khoan đã!", "Hãy chọn 1 món đồ chơi trước khi dán nhãn!"); 
                return; 
            }

            if (checkInvalidRenderMode()) {
                showAlert("⚠️ Không thể dán nhãn!", "Đồ chơi đang ở dạng Point hoặc Lines. Vui lòng đổi trạng thái về Solid để dán nhãn nha!");
                return;
            }

            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(img.src, (texture) => {
                saveActionToHistory("Dán Texture có sẵn");
                texture.colorSpace = THREE.SRGBColorSpace;
                selectedObjects.forEach(obj => {
                    obj.traverse(child => {
                        if (child.isMesh) {
                            child.material.map = texture;

                            if (child.userData.originalVertexColors === undefined) {
                                child.userData.originalVertexColors = child.material.vertexColors;
                            }
                            child.material.vertexColors = false; 

                            if (!child.userData.baseColor) child.userData.baseColor = child.userData.originalColor ? child.userData.originalColor.clone() : child.material.color.clone();
                            child.material.color.setHex(0xffffff);
                            if (child.userData.originalColor) child.userData.originalColor.setHex(0xffffff);
                            child.material.needsUpdate = true; 
                        }
                    });
                });
                showToast(`🎨 Đã dán nhãn mẫu thành công!`, true);
                autoSaveScene();
            });
        });
    });
}