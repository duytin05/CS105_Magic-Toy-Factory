import gsap from 'gsap';
import { objectsArray, showToast, showAlert } from '../controls/eventHandlers.js';

export function initFactoryAnimation() {
    const btnRun = document.querySelector('.btn-run');
    if (!btnRun) return;

    btnRun.addEventListener('click', () => {
        if (objectsArray.length === 0) {
            showAlert("⚠️ Xưởng trống trơn!", "Hãy thêm vài món đồ chơi rồi mới chạy dây chuyền được!");
            return;
        }

        // KHÓA NÚT CHỐNG BẤM SPAM
        if (btnRun.disabled) return;
        btnRun.disabled = true;
        const originalText = btnRun.innerText;
        btnRun.innerText = "⏳ ĐANG CHẠY DÂY CHUYỀN...";
        btnRun.style.background = "#fdcb6e"; 

        showToast("🌪️ Kích hoạt bão ma thuật xáo trộn xưởng!!!", true);

        // TÍNH TOÁN vỊ TRÍ TIẾP ĐẤT
        const dropTargets = [];
        const PLANE_SIZE = 30; 
        const HALF_SIZE = PLANE_SIZE / 2;
        let currentSafeDist = 4.5; 

        for (let i = 0; i < objectsArray.length; i++) 
        {
            let safeX, safeZ;
            let isSafe = false;
            let attempts = 0;

            while (!isSafe && attempts < 200) {
                safeX = (Math.random() * (PLANE_SIZE - 4)) - (HALF_SIZE - 2);
                safeZ = (Math.random() * (PLANE_SIZE - 4)) - (HALF_SIZE - 2);
                isSafe = true;

                for (let j = 0; j < dropTargets.length; j++) {
                    const dx = dropTargets[j].x - safeX;
                    const dz = dropTargets[j].z - safeZ;
                    if (Math.sqrt(dx*dx + dz*dz) < currentSafeDist) 
                    {
                        isSafe = false;
                        break;
                    }
                }
                attempts++;
                if (attempts === 150) currentSafeDist -= 0.5;
            }
            dropTargets.push({ x: safeX, z: safeZ });
        }

        // KHỞI TẠO TIMELINE MA THUẬT VỚI GSAP
        const tl = gsap.timeline({
            onComplete: () => {
                btnRun.disabled = false;
                btnRun.innerText = originalText;
                btnRun.style.background = ""; 
                showToast("🎇Đã xáo trộn xong!", true);
            }
        });

        const positions = objectsArray.map(obj => obj.position);
        const rotations = objectsArray.map(obj => obj.rotation);
        const scales = objectsArray.map(obj => obj.scale);
        const originalYs = positions.map(p => p.y); 

        //  GIAI ĐOẠN 1: LÀN SÓNG BAY LÊN CAO
        tl.to(positions, {
            y: (i) => originalYs[i] + 12, 
            duration: 0.8,
            stagger: { each: 0.05, from: "start" },
            ease: "back.out(1.5)"
        }, "start"); 

        tl.to(rotations, {
            y: "+=" + Math.PI * 2,
            duration: 0.8,
            stagger: { each: 0.05, from: "start" },
            ease: "power2.inOut"
        }, "start");

        // GIAI ĐOẠN 2: LỘN SANTO & PHÓNG TO
        tl.to(rotations, {
            x: "+=" + Math.PI * 2,
            z: "+=" + Math.PI * 2,
            duration: 1,
            stagger: { each: 0.03, from: "center" },
            ease: "sine.inOut"
        }, "+=0.1"); 

        tl.to(scales, {
            x: (i, target) => target.x * 2,
            y: (i, target) => target.y * 2,
            z: (i, target) => target.z * 2,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            stagger: { each: 0.05, from: "center" },
            ease: "power1.inOut"
        }, "<"); 

        // GIAI ĐOẠN 3: LƠ LỬNG BỒNG BỀNH
        tl.to(positions, {
            x: "+=random(-3, 3)", 
            y: "+=random(-1, 1)", 
            z: "+=random(-3, 3)", 
            duration: 0.5,
            yoyo: true,  
            repeat: 3,   
            stagger: { each: 0.05, from: "center" },
            ease: "sine.inOut"
        }, "<"); 

        // GIAI ĐOẠN 4: TỤT XUỐNG CỰC NHANH
        tl.to(positions, {
            y: "-=8", 
            duration: 0.5,
            stagger: { each: 0.01, from: "random" }, 
            ease: "expo.in" 
        });

        // GIAI ĐOẠN 5: NHÚN LÒ XO BẮN TUNG LÊN TỪ TỪ
        tl.to(positions, {
            y: "+=15", 
            duration: 1.5, 
            stagger: { each: 0.05, from: "random" },
            ease: "power2.out" 
        });

        // GIAI ĐOẠN 6: TỪ TỪ ĐÁP XUỐNG VỊ TRÍ MỚI
        tl.to(positions, {
            x: (i) => dropTargets[i].x, 
            z: (i) => dropTargets[i].z, 
            y: (i) => originalYs[i],    
            duration: 1.5, 
            stagger: { each: 0.05, from: "random" }, 
            ease: "power2.inOut" 
        }, "-=0.2"); 
    });
}