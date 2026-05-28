import gsap from 'gsap';
import { showToast } from '../controls/eventHandlers.js';

export function startWelcomeAnimation(camera, scene) {
    const overlay = document.getElementById('welcome-overlay');
    const loaderLine = document.querySelector('.loader-line');
    const logo = document.querySelector('.welcome-logo');
    const rocket = document.querySelector('.rocket-model'); 
    
    if (!overlay || !loaderLine || !logo || !rocket) return; 

    // 1. Chữ 3D nảy ra ban đầu
    gsap.to(logo, { scale: 1, duration: 1.2, ease: "elastic.out(1, 0.4)" });

    // 2. Thanh Loading (4 giây)
    const tl = gsap.timeline();
    tl.to(loaderLine, { width: "80%", duration: 2, ease: "power1.out" });
    tl.to(loaderLine, { width: "100%", duration: 0.5, ease: "power2.in" }, "+=1.5");

    setTimeout(() => {
        const topBar = document.getElementById('top-bar');
        const realLogo = topBar.querySelector('.logo');
        
        topBar.style.visibility = 'hidden'; 
        const realRect = realLogo.getBoundingClientRect();
        const realStyle = window.getComputedStyle(realLogo);
        topBar.style.visibility = '';

        const logoRect = logo.getBoundingClientRect();
        logo.style.position = 'fixed';
        logo.style.top = logoRect.top + 'px';
        logo.style.left = logoRect.left + 'px';
        logo.style.zIndex = '10001';
        document.body.appendChild(logo);

        const rocketRect = rocket.getBoundingClientRect();
        rocket.style.position = 'fixed';
        rocket.style.top = rocketRect.top + 'px';
        rocket.style.left = rocketRect.left + 'px';
        rocket.style.zIndex = '10001';
        document.body.appendChild(rocket);

        gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: () => overlay.remove() });

        // --- CẤT CÁNH TÊN LỬA---
        // Tên lửa bay lên góc trên bên phải
        gsap.to(rocket, {
            top: "-300px", 
            left: (window.innerWidth - 300) + "px", 
            rotation: 45, 
            duration: 0.8,
            ease: "back.in(2)", 
            onComplete: () => rocket.remove()
        });

        // Chữ thu nhỏ bay vào menu
        gsap.to(logo, {
            top: realRect.top + "px",
            left: realRect.left + "px",
            fontSize: realStyle.fontSize,
            letterSpacing: realStyle.letterSpacing,
            color: realStyle.color,
            textShadow: "0px 0px 0px transparent",
            duration: 0.8, 
            ease: "power2.inOut",
            onComplete: () => {
                logo.remove();
                topBar.classList.add('show-ui');
            }
        });

        // --- CAMERA BAY VÀO ---
        camera.position.set(0, 150, 250);
        camera.lookAt(0, 0, 0);
        gsap.to(camera.position, { x: 0, y: 35, z: 65, duration: 2, ease: "power2.inOut" });

        const plane = scene.children.find(child => child.geometry?.type === 'PlaneGeometry');
        if (plane) {
            plane.scale.set(0, 0, 0);
            gsap.to(plane.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "back.out(1.2)" });
        }

        setTimeout(() => {
            document.getElementById('sidebar-left')?.classList.add('show-ui');
            document.getElementById('sidebar-right')?.classList.add('show-ui');
            document.getElementById('bottom-bar')?.classList.add('show-ui');
            showToast("✨ Chào mừng bạn đến với Xưởng Ma Thuật!", true);
        }, 800); 

    }, 4200);
}