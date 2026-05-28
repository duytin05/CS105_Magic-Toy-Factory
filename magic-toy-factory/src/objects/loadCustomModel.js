import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objectsArray, showToast, showAlert } from '../controls/eventHandlers.js';
import { getSafePosition, applyRenderMode } from '../ui/toolPanel.js'; // 🎯 ĐÃ IMPORT BÍ KÍP
import gsap from 'gsap';

export const mixers = []; 

function getTightBoundingBox(object) {
    const box = new THREE.Box3();
    box.makeEmpty();
    object.updateMatrixWorld(true);
    object.traverse((child) => {
        if (child.isMesh && child.visible) {
            if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
            const childBox = child.geometry.boundingBox.clone();
            childBox.applyMatrix4(child.matrixWorld);
            box.union(childBox);
        }
    });
    return box;
}

export function initCustomModelLoader(scene) {
    const btnAdd = document.getElementById('btn-add-custom-model');
    const select = document.getElementById('custom-model-select');
    const colorPicker = document.getElementById('custom-model-color');
    const cbUseDefault = document.getElementById('custom-use-default'); 

    if (!btnAdd || !select || !colorPicker) return;

    const loader = new GLTFLoader();

    btnAdd.addEventListener('click', () => {
        const modelUrl = select.value;
        const pickedColorHex = colorPicker.value; 
        const useDefault = cbUseDefault ? cbUseDefault.checked : false;
        
        loader.load(
            modelUrl,
            (gltf) => {
                const model = gltf.scene;
                const wrapper = new THREE.Group();
                                
                const currentMode = document.getElementById('create-mode-select').value;

                model.traverse((child) => {
                    if (child.isMesh || child.isSkinnedMesh) {
                        
                        // Phát hiện hộp tàng hình và gắn thẻ
                        if ((child.material.transparent && child.material.opacity === 0) || 
                            child.name.toLowerCase().includes('bound') || 
                            child.name.toLowerCase().includes('collider') ||
                            child.name.toLowerCase().includes('hitbox') ||
                            child.name.toLowerCase().includes('dummy')) {
                            
                            child.visible = false;
                            child.userData.isCollider = true; 
                        }
                        
                        // Nếu KHÔNG PHẢI là hộp tàng hình thì mới tô màu và cho hiển thị
                        if (!child.userData.isCollider) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.material = child.material.clone(); 
                            
                            if (!useDefault) {
                                if (child.userData.originalVertexColors === undefined) {
                                    child.userData.originalVertexColors = child.material.vertexColors;
                                }
                                child.material.vertexColors = false; 
                                child.material.color.set(pickedColorHex); 
                                child.userData.originalColor = new THREE.Color(pickedColorHex);
                            } else {
                                if (child.userData.originalVertexColors !== undefined) {
                                    child.material.vertexColors = child.userData.originalVertexColors;
                                }
                                child.userData.originalColor = child.material.color ? child.material.color.clone() : new THREE.Color(0xffffff);
                            }

                            applyRenderMode(child, currentMode);
                        }
                    }
                });

                const tightBox = getTightBoundingBox(model);
                const size = new THREE.Vector3();
                tightBox.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = 3.5 / maxDim; 
                    model.scale.set(scale, scale, scale);
                }

                const scaledBox = getTightBoundingBox(model);
                const center = new THREE.Vector3();
                scaledBox.getCenter(center);
                model.position.set(-center.x, -center.y, -center.z);
                wrapper.add(model);

                const hasSpace = getSafePosition(wrapper, 30, 3);
                if (hasSpace) {
                    if (gltf.animations && gltf.animations.length > 0) {
                        const mixer = new THREE.AnimationMixer(model);
                        const action = mixer.clipAction(gltf.animations[0]); 
                        action.play();
                        mixers.push(mixer);
                    }
                    scene.add(wrapper);
                    objectsArray.push(wrapper);

                    const finalY = wrapper.position.y;
                    wrapper.position.y += 15; 
                    gsap.to(wrapper.position, { y: finalY, duration: 1.2, ease: "bounce.out" });
                    showToast(`✨ Sinh vật đã đáp xuống an toàn!`, true);
                } else {
                    showAlert("🧸 Xưởng đầy rồi!", "Xưởng bừa bộn quá rồi, dọn dẹp bớt thôi nào!");
                }
            },
            undefined,
            (error) => {
                console.error("Lỗi tải GLB:", error);
                showAlert("⚠️ Lỗi chế tạo!", "Không tìm thấy file 3D! Kiểm tra lại thư mục nha!");
            }
        );
    });
}

