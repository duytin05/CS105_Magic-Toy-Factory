import GUI from 'lil-gui';

export function initTeacherMode(camera, spotLight, spotLightHelper, axesHelper) { 
    const gui = new GUI({ title: '🎓 BẢNG ĐIỀU KHIỂN GIÁO VIÊN' });
    
    gui.domElement.style.position = 'fixed';
    gui.domElement.style.top = '0px'; 
    gui.domElement.style.left = '50%';
    gui.domElement.style.transform = 'translateX(-50%)'; 
    gui.domElement.style.margin = '0';
    gui.domElement.style.zIndex = '1000'; 

    gui.hide(); 

    // Ấn phím H để ẩn/hiển bảng điều khiển
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'h') {
            if (gui.domElement.style.display === 'none') {
                gui.show();
            } else {
                gui.hide();
            }
        }
    });

    const defaultState = {
        camX: camera.position.x, camY: camera.position.y, camZ: camera.position.z,
        camFov: camera.fov, camNear: camera.near, camFar: camera.far,
        lightX: spotLight.position.x, lightY: spotLight.position.y, lightZ: spotLight.position.z,
        intensity: spotLight.intensity, angle: spotLight.angle, penumbra: spotLight.penumbra,
        showLightHelper: false,
        showAxesHelper: false
    };

    const helperConfig = { 
        showLightHelper: false,
        showAxesHelper: false 
    }; 

    // ==========================================
    // QUẢN LÝ CAMERA
    // ==========================================
    const cameraFolder = gui.addFolder('🎥 Góc nhìn Camera');
    cameraFolder.add(camera.position, 'x', -100, 100, 1).name('Trục X');
    cameraFolder.add(camera.position, 'y', 0, 100, 1).name('Trục Y');
    cameraFolder.add(camera.position, 'z', -100, 100, 1).name('Trục Z');
    cameraFolder.add(camera, 'fov', 10, 150, 1).name('Góc nhìn (FOV)').onChange(() => camera.updateProjectionMatrix());
    cameraFolder.add(camera, 'near', 0.1, 50, 0.1).name('Điểm gần (Near)').onChange(() => camera.updateProjectionMatrix());
    cameraFolder.add(camera, 'far', 10, 2000, 10).name('Điểm xa (Far)').onChange(() => camera.updateProjectionMatrix());

    // ==========================================
    // QUẢN LÝ ĐÈN SPOTLIGHT
    // ==========================================
    const lightFolder = gui.addFolder('💡 Ánh sáng Spotlight');
    lightFolder.add(spotLight, 'intensity', 0, 50, 0.1).name('Cường độ sáng');
    lightFolder.add(spotLight.position, 'x', -50, 50, 1).name('Vị trí X');
    lightFolder.add(spotLight.position, 'y', 0, 100, 1).name('Vị trí Y');
    lightFolder.add(spotLight.position, 'z', -50, 50, 1).name('Trục Z');
    lightFolder.add(spotLight, 'angle', 0, Math.PI / 2, 0.01).name('Góc chiếu (Angle)').onChange(() => {
        if (spotLightHelper) spotLightHelper.update();
    });
    lightFolder.add(spotLight, 'penumbra', 0, 1, 0.01).name('Độ mờ viền (Penumbra)');
    
    // ==========================================
    // KHUNG, TRỤC HỖ TRỢ & NÚT RESET
    // ==========================================
    const helperFolder = gui.addFolder('📐 Khung & Trục hỗ trợ');
    
    if (spotLightHelper) {
        helperFolder.add(helperConfig, 'showLightHelper').name('💡 Hiện tia sáng đèn').onChange((value) => {
            spotLightHelper.visible = value;
            if (value) spotLightHelper.update();
        });
    }
    
    if (axesHelper) {
        helperFolder.add(helperConfig, 'showAxesHelper').name('🧭 Hiện trục giữa sàn').onChange((value) => {
            axesHelper.visible = value;
        });
    }

    // Định nghĩa chức năng Reset
    const teacherActions = {
        resetAll: () => {
            camera.position.set(defaultState.camX, defaultState.camY, defaultState.camZ);
            camera.fov = defaultState.camFov; camera.near = defaultState.camNear; camera.far = defaultState.camFar;
            camera.updateProjectionMatrix();

            spotLight.position.set(defaultState.lightX, defaultState.lightY, defaultState.lightZ);
            spotLight.intensity = defaultState.intensity; spotLight.angle = defaultState.angle; spotLight.penumbra = defaultState.penumbra;
            
            if (spotLightHelper) {
                helperConfig.showLightHelper = false;
                spotLightHelper.visible = false;
                spotLightHelper.update();
            }

            if (axesHelper) {
                helperConfig.showAxesHelper = false;
                axesHelper.visible = false;
            }

            gui.controllersRecursive().forEach(controller => controller.updateDisplay());
        }
    };

    helperFolder.add(teacherActions, 'resetAll').name('🔄 Khôi phục cài đặt gốc');
}