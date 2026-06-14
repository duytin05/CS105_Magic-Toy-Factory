import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { objectsArray, showToast } from '../controls/eventHandlers.js';
import { mixers } from '../objects/loadCustomModel.js';
import { getBox, getSphere, getCone, getCylinder, getTorus, getDodecahedron, getTorusKnot, getOctahedron } from '../objects/createBasicShapes.js';
import { getTeapot } from '../objects/createTeapot.js';
import { applyRenderMode } from '../ui/toolPanel.js';

const DB_NAME = 'MagicToyFactoryDB';
const STORE_NAME = 'blueprintStore'; 

function getDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 2); 
        request.onupgradeneeded = (event) => { event.target.result.createObjectStore(STORE_NAME); };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveToDB(key, data) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(data, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function loadFromDB(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(tx.error);
    });
}

function extractTextureUrl(obj) {
    let texUrl = null;
    obj.traverse((child) => {
        if (!texUrl && child.isMesh && child.material && child.material.map && child.material.map.image && child.userData.baseColor) {
            const img = child.material.map.image;
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width || 256; canvas.height = img.height || 256;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                texUrl = canvas.toDataURL('image/jpeg', 0.8);
            } catch(e) { console.warn("Lỗi lưu ảnh bảo mật", e); }
        }
    });
    return texUrl;
}

function captureBlueprint() {
    const blueprint = [];
    objectsArray.forEach(obj => {
        let currentMode = 'solid';
        let mainColor = null;

        obj.traverse(child => {
            if (child.isMesh && !child.userData.isCollider) {
                if (child.material.wireframe) currentMode = 'lines';
                else if (child.material.opacity === 0) currentMode = 'point';
                
                if (mainColor === null) {
                    if (child.userData.baseColor) mainColor = child.userData.baseColor.getHex();
                    else if (child.userData.originalColor) mainColor = child.userData.originalColor.getHex();
                    else if (child.material && child.material.color) mainColor = child.material.color.getHex();
                }
            }
        });

        blueprint.push({
            uuid: obj.uuid,
            shapeType: obj.userData.shapeType || 'Unknown',
            params: obj.userData.params || {},
            modelUrl: obj.userData.modelUrl || null,
            customColor: obj.userData.customColor || null,
            useDefaultColor: obj.userData.useDefaultColor || false,
            renderMode: currentMode,
            textureUrl: extractTextureUrl(obj), 
            position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
            rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
            scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
            color: mainColor 
        });
    });
    return blueprint;
}

let autoSaveTimeout = null;

export function autoSaveScene() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => { saveSceneToIndexedDB(); }, 800);
}

export function forceSaveScene() {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    saveSceneToIndexedDB();
}

async function saveSceneToIndexedDB() {
    if (objectsArray.length === 0) {
        await saveToDB('factoryBlueprint', null);
        return;
    }
    const blueprint = captureBlueprint();
    await saveToDB('factoryBlueprint', blueprint);
    console.log("📜 [Auto-Save] Đã cất bản đồ Xưởng vào kho an toàn!");
}

function getTightBoundingBox(object) {
    const box = new THREE.Box3(); box.makeEmpty();
    object.updateMatrixWorld(true);
    object.traverse((child) => {
        if (child.isMesh && child.visible && !child.userData.isCollider) {
            if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
            const childBox = child.geometry.boundingBox.clone();
            childBox.applyMatrix4(child.matrixWorld);
            box.union(childBox);
        }
    });
    return box;
}

function applyTextureToMesh(mesh, textureUrl) {
    const img = new Image();
    img.src = textureUrl;
    img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        mesh.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.map = texture;
                
                if (!child.userData.baseColor) {
                    child.userData.baseColor = child.userData.originalColor ? child.userData.originalColor.clone() : child.material.color.clone();
                }
                
                child.material.color.setHex(0xffffff);
                if (child.userData.originalColor) child.userData.originalColor.setHex(0xffffff);

                child.material.vertexColors = false;
                child.material.needsUpdate = true;
            }
        });
    };
}

export async function loadSceneFromIndexedDB(scene) {
    try {
        const parsedState = await loadFromDB('factoryBlueprint');
        if (!parsedState || parsedState.length === 0) return;

        console.log("🔄 Đang phục hồi xưởng từ Bản Đồ Gen...");
        const loader = new GLTFLoader();

        parsedState.forEach(savedData => {
            if (savedData.shapeType === 'CustomModel' && savedData.modelUrl) {
                loader.load(savedData.modelUrl, (gltf) => {
                    const model = gltf.scene;
                    const wrapper = new THREE.Group();
                    
                    model.traverse((child) => {
                        if (child.isMesh || child.isSkinnedMesh) {
                            if ((child.material.transparent && child.material.opacity === 0) || 
                                child.name.toLowerCase().includes('bound') || 
                                child.name.toLowerCase().includes('collider') ||
                                child.name.toLowerCase().includes('hitbox') ||
                                child.name.toLowerCase().includes('dummy')) {
                                
                                child.visible = false;
                                child.userData.isCollider = true; 
                            }
                            if (!child.userData.isCollider) {
                                child.castShadow = true; child.receiveShadow = true;
                                child.material = child.material.clone();
                                if (!savedData.useDefaultColor && savedData.customColor) {
                                    child.material.vertexColors = false; 
                                    child.material.color.set(savedData.customColor);
                                }
                                child.userData.originalColor = child.material.color.clone();
                                applyRenderMode(child, savedData.renderMode || 'solid');
                            }
                        }
                    });
                    
                    const tightBox = getTightBoundingBox(model);
                    const size = new THREE.Vector3(); tightBox.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) {
                        const scale = 3.5 / maxDim; model.scale.set(scale, scale, scale);
                    }
                    const scaledBox = getTightBoundingBox(model);
                    const center = new THREE.Vector3(); scaledBox.getCenter(center);
                    model.position.set(-center.x, -center.y, -center.z);
                    
                    wrapper.add(model);
                    wrapper.position.set(savedData.position.x, savedData.position.y, savedData.position.z);
                    wrapper.rotation.set(savedData.rotation.x, savedData.rotation.y, savedData.rotation.z);
                    wrapper.scale.set(savedData.scale.x, savedData.scale.y, savedData.scale.z);

                    wrapper.userData.shapeType = 'CustomModel';
                    wrapper.userData.modelUrl = savedData.modelUrl;
                    wrapper.userData.customColor = savedData.customColor;
                    wrapper.userData.useDefaultColor = savedData.useDefaultColor;
                    
                    if (savedData.textureUrl) applyTextureToMesh(wrapper, savedData.textureUrl);

                    if (gltf.animations && gltf.animations.length > 0) {
                        const mixer = new THREE.AnimationMixer(model);
                        mixer.clipAction(gltf.animations[0]).play();
                        mixers.push(mixer);
                    }
                    
                    scene.add(wrapper);
                    objectsArray.push(wrapper);
                });

            } 
            else if (savedData.shapeType !== 'Unknown' && savedData.shapeType !== 'Plane') {
                let newObj = null;
                const p = savedData.params || {}; 
                switch(savedData.shapeType) {
                    case 'Box': newObj = getBox(p.w, p.h, p.d); break;
                    case 'Sphere': newObj = getSphere(p.radius); break;
                    case 'Cone': newObj = getCone(p.radius, p.height); break;
                    case 'Cylinder': newObj = getCylinder(p.radius, p.height); break;
                    case 'Torus': newObj = getTorus(p.radius, p.tube); break;
                    case 'Dodecahedron': newObj = getDodecahedron(p.radius); break;
                    case 'TorusKnot': newObj = getTorusKnot(p.radius, p.tube); break;
                    case 'Octahedron': newObj = getOctahedron(p.radius); break;
                    case 'Teapot': newObj = getTeapot(p.size); break;
                }

                if (newObj) {
                    newObj.position.set(savedData.position.x, savedData.position.y, savedData.position.z);
                    newObj.rotation.set(savedData.rotation.x, savedData.rotation.y, savedData.rotation.z);
                    newObj.scale.set(savedData.scale.x, savedData.scale.y, savedData.scale.z);

                    if (savedData.color !== null && newObj.material) {
                        newObj.material.color.setHex(savedData.color);
                        newObj.userData.originalColor = newObj.material.color.clone();
                    }
                    
                    applyRenderMode(newObj, savedData.renderMode || 'solid');
                    if (savedData.textureUrl) applyTextureToMesh(newObj, savedData.textureUrl);

                    newObj.userData = { shapeType: savedData.shapeType, params: p };
                    scene.add(newObj);
                    objectsArray.push(newObj);
                }
            }
        });
        
        setTimeout(() => showToast("🔄 Đã tải lại 100% Xưởng Đồ Chơi!", true), 800);
    } catch (error) {
        console.error("Lỗi khi truy xuất IndexedDB:", error);
    }
}