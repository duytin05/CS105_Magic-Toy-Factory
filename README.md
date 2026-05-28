
# Đồ án môn Đồ họa máy tính - ĐH CNTT (UIT)

## **Dự án: Magic 3D Toy Factory (Xưởng Chế Tạo Đồ Chơi 3D)**

## Thông tin nhóm

| Thông tin | Chi tiết |
|---|---|
| **MSSV** | 23521592 Đỗ Lê Duy Tín - 23521451 Nguyễn Nhựt Thành|
| **Môn học** | CS105 — Đồ họa máy tính |
| **Trường** | Đại học Công nghệ Thông tin — ĐHQG TP.HCM |
| **Khoa** | Khoa học Máy tính | 

---

## 🎯 Giới thiệu tổng quan

Đồ án "Magic 3D Toy Factory" là một ứng dụng dạng "Phòng thí nghiệm không gian" (Lab) chạy trực tiếp trên nền web. Dự án cho phép người dùng đóng vai kỹ sư, tự tay lắp ráp đồ chơi từ các khối hình học cơ bản, đồng thời khám phá các khái niệm vật lý/toán học qua việc tương tác trực quan với camera, ánh sáng và vật liệu. 

Dự án hiện thực hóa toàn bộ luồng xử lý đồ họa máy tính (3D Pipeline), đáp ứng đầy đủ các yêu cầu kỹ thuật đồ họa 3D căn bản đến nâng cao.

## ✨ Các tính năng kỹ thuật nổi bật

* **Khởi tạo & Quản lý Hình học (Modeling):**
  * Dựng sẵn 7 khối hình cơ bản: Hộp, Cầu, Nón, Trụ, Bánh xe, Đá quý, Ấm trà.
  * Hỗ trợ tải và hiển thị các mô hình 3D phức tạp (định dạng `.glb`) thông qua `GLTFLoader`.

* **Chế độ hiển thị (Render Modes):**
  * Chuyển đổi linh hoạt giữa 3 chế độ vẽ:
    * Point (Điểm)
    * Lines (Đường lưới Wireframe)
    * Solid (Khối đặc)

* **Camera & Chiếu phối cảnh (Perspective Projection):**
  * Điều chỉnh trực tiếp các thông số Camera:
    * Tọa độ (X, Y, Z)
    * Field of View (FOV)
    * Near Plane
    * Far Plane
  * Thông qua bảng điều khiển ẩn.

* **Phép biến đổi Affine trực quan:**
  * Thao tác trực tiếp trên vật thể qua `TransformControls`
    * Translate — Dời chỗ
    * Rotate — Xoay
    * Scale — Phóng to/Thu nhỏ
  * Kết hợp hệ thống phím tắt tiện lợi.

* **Chiếu sáng & Bóng đổ (Lighting & Shadows):**
  * Môi trường sử dụng:
    * `AmbientLight`
    * `SpotLight`
  * Hỗ trợ tính toán bóng đổ (Shadow Mapping) thời gian thực trên mặt sàn.

* **Áp dụng Vật liệu & Texture Mapping:**
  * Cho phép người dùng tải ảnh từ máy tính cá nhân (`.png`, `.jpg`, `.jpeg`) để áp làm Texture lên bề mặt đồ chơi 3D.

* **Chuyển động (Animation):**
  * Xử lý Hierarchical Animation thông qua `AnimationMixer`.
  * Kết hợp thư viện `GSAP` để tạo hiệu ứng chuyển cảnh UI mượt mà.

---

## 🚀 Cài đặt & Hướng dẫn sử dụng

Dự án đã được tối ưu hóa, loại bỏ các thư viện build trung gian (Vite, Webpack) để đảm bảo tính gọn nhẹ và dễ triển khai nhất.

### Bước 1: Clone dự án

```bash
git clone https://github.com/duytin05/Magic-3D-Toy-Factory.git
cd Magic-3D-Toy-Factory
````

### Bước 2: Khởi chạy ứng dụng

Do dự án sử dụng các module ES6 (`<script type="module">`), bạn cần một Local Server để chạy, không thể mở trực tiếp file `index.html` bằng cách nháy đúp.

#### Cách khuyên dùng (VS Code)

1. Cài đặt Extension **Live Server**
2. Nhấp chuột phải vào file `index.html`
3. Chọn `"Open with Live Server"`

#### Cách dùng Python (Nếu có sẵn Python)

Mở terminal tại thư mục gốc và chạy:

```bash
python -m http.server 8080
```

Sau đó truy cập:

```text
http://localhost:8080
```

---

## 🎮 Phím tắt trong quá trình sử dụng

| Phím / Thao tác        | Chức năng                 |
| ---------------------- | ------------------------- |
| Chuột trái             | Chọn 1 món đồ chơi        |
| Shift + Click          | Chọn nhiều vật thể        |
| Chuột phải (Giữ & Kéo) | Xoay camera quanh xưởng   |
| Lăn chuột              | Zoom in / Zoom out        |
| T                      | Translate Mode            |
| R                      | Rotate Mode               |
| S                      | Scale Mode                |
| H                      | Ẩn / Hiện bảng điều khiển |
| ESC                    | Hủy chọn vật thể          |

---

## 📂 Cấu trúc thư mục

```text
/magic-toy-factory
├── index.html              # File khởi chạy chính
├── welcome.css             # Hiệu ứng màn hình chờ
├── style.css               # UI chính (Glass-morphism)
├── models/                 # Chứa tài nguyên mô hình 3D (.glb)
├── src/                    # Logic xử lý lõi
│   ├──  animation/          # Hiệu ứng GSAP
│   ├── controls/           # Xử lý sự kiện Raycaster, Affine Transform
│   ├── core/               # Khởi tạo Scene, Camera, Light, Renderer
│   ├── data/
│   ├── objects/            # Sinh vật thể cơ bản & Load Custom Model
│   ├── ui/                 # Xử lý logic bảng điều khiển, Texture Upload
│   └──main.js             # Entry point    
└── README.md               # Tài liệu dự án
```

---

## 🏆 Nguồn Tài Nguyên (Credits & Attributions)

Dự án có sử dụng các mô hình 3D miễn phí với giấy phép bản quyền (Creative Commons) từ nền tảng cộng đồng. Xin gửi lời cảm ơn đến các tác giả:

* **Super Robot !** — by Romain Revert [CC-BY]
  Source: https://poly.pizza/m/eV232rQZrgh

* **Animated Robot** — by Quaternius
  Source: https://poly.pizza/m/QCm7qe9uNJ

* **cartoon banana car** — by Felipe Lujan-Bear [CC-BY]
  Source: https://poly.pizza/m/1RjuCX8gI9w

* **Parasaurolophus** — by Quaternius
  Source: https://poly.pizza/m/KeeQrrouRK

* **Cute Red Dino** — by Exceptional_3D
  Source: https://poly.pizza/m/WAkBnE6ydO

* **Rocketship** — by Gabriel Valdivia [CC-BY]
  Source: https://poly.pizza/m/a5ChWS6uW0y

---

## 📚 Tham khảo

* Three.js Documentation
  https://threejs.org/docs/

* GSAP Animation Library
  https://gsap.com/

* lil-gui Documentation
  https://lil-gui.georgealways.com/

* Tài liệu học phần Đồ họa Máy tính — Trường Đại học Công nghệ Thông tin (UIT)

---

## 🧠 Công nghệ sử dụng

* HTML5
* CSS3
* JavaScript (ES6 Modules)
* Three.js
* GSAP
* lil-gui

---

## 📌 Ghi chú

Đây là đồ án học thuật phục vụ cho môn học Đồ họa Máy tính tại Trường Đại học Công nghệ Thông tin (UIT).
Dự án được xây dựng với mục tiêu học tập, nghiên cứu pipeline đồ họa 3D và tương tác trực quan trên nền web.

```
```
