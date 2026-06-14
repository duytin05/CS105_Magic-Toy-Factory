import * as THREE from 'three';
import { objectsArray, showToast, showAlert } from '../controls/eventHandlers.js';
import { autoSaveScene } from './SceneStorage.js';
import { applyRenderMode } from '../ui/toolPanel.js'; 

const undoStack = [];
const redoStack = [];
const objectRegistry = new Map();

export function registerObject(obj) {
    if (!objectRegistry.has(obj.uuid)) {
        objectRegistry.set(obj.uuid, obj);
    }
}

function captureRAMState() {
    const state = [];
    objectsArray.forEach(obj => {
        registerObject(obj); 

        let currentMode = 'solid'; 
        const meshStates = [];

        obj.traverse(child => {
            if (child.isMesh && !child.userData.isCollider && child.material) {
                
                if (child.material.wireframe) currentMode = 'lines';
                else if (child.material.opacity === 0) currentMode = 'point';

                meshStates.push({
                    uuid: child.uuid,
                    color: child.material.color ? child.material.color.getHex() : null,
                    baseColor: child.userData.baseColor ? child.userData.baseColor.getHex() : null,
                    originalColor: child.userData.originalColor ? child.userData.originalColor.getHex() : null,
                    map: child.material.map,
                    vertexColors: child.material.vertexColors 
                });
            }
        });

        state.push({
            uuid: obj.uuid,
            position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
            rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
            scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
            meshStates: meshStates,
            renderMode: currentMode 
        });
    });
    return state;
}

export function saveActionToHistory(actionName = "Thao tác") {
    undoStack.push({ state: captureRAMState(), actionName: actionName });
    if (undoStack.length > 50) undoStack.shift(); 
    redoStack.length = 0; 
}

function applyState(stateToApply, scene) {
    objectsArray.forEach(obj => scene.remove(obj));
    objectsArray.length = 0;

    stateToApply.forEach(savedData => {
        const obj = objectRegistry.get(savedData.uuid);
        if (obj) {
            obj.position.set(savedData.position.x, savedData.position.y, savedData.position.z);
            obj.rotation.set(savedData.rotation.x, savedData.rotation.y, savedData.rotation.z);
            obj.scale.set(savedData.scale.x, savedData.scale.y, savedData.scale.z);

            obj.traverse(child => {
                if (child.isMesh && !child.userData.isCollider && child.material) {
                    
                    const mState = savedData.meshStates.find(ms => ms.uuid === child.uuid);
                    if (mState) {
                        if (mState.color !== null) child.material.color.setHex(mState.color);
                        if (mState.baseColor !== null && child.userData.baseColor) child.userData.baseColor.setHex(mState.baseColor);
                        if (mState.originalColor !== null && child.userData.originalColor) child.userData.originalColor.setHex(mState.originalColor);

                        child.material.map = mState.map;
                        child.material.vertexColors = mState.vertexColors; 

                        if (mState.map) {
                            child.material.color.setHex(0xffffff);
                            if (child.userData.originalColor) child.userData.originalColor.setHex(0xffffff);
                            child.material.vertexColors = false;
                        }

                        child.material.needsUpdate = true;
                    }
                    
                    applyRenderMode(child, savedData.renderMode);
                }
            });

            scene.add(obj);
            objectsArray.push(obj);
        }
    });

    autoSaveScene();
}

export function performUniversalUndo(scene) {
    if (undoStack.length === 0) {
        showAlert("🤷‍♂️ Trống rỗng!", "Không có thao tác nào để hoàn tác nữa!");
        return;
    }
    const previousData = undoStack.pop(); 
    redoStack.push({ state: captureRAMState(), actionName: previousData.actionName }); 
    applyState(previousData.state, scene);
    showToast(`⏪ Đã hoàn tác: ${previousData.actionName}`, true);
}

export function performUniversalRedo(scene) {
    if (redoStack.length === 0) {
        showAlert("🤷‍♂️ Trống rỗng!", "Không có thao tác nào để làm lại nữa!");
        return;
    }
    const nextData = redoStack.pop(); 
    undoStack.push({ state: captureRAMState(), actionName: nextData.actionName }); 
    applyState(nextData.state, scene);
    showToast(`⏩ Đã làm lại: ${nextData.actionName}`, true);
}