// let base_url = "https://kolaborasigroup.com/admin/";
let base_url = "http://localhost:8080/sw/";

document.addEventListener("DOMContentLoaded", function () {
        // ===================== Navbar & Mobile Menu =====================
const menuBtn = document.querySelector(".mobile-menu-button");
const menu = document.querySelector(".mobile-menu");
const cartBtn = document.getElementById("cartButton");
const cartDropdown = document.getElementById("cartDropdown");

// Toggle Mobile Menu
if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
        if (menu.classList.contains("hidden")) {
            menu.classList.remove("hidden");
            setTimeout(() => {
                menu.classList.remove("opacity-0", "scale-95", "-translate-y-5");
                menu.classList.add("opacity-100", "scale-100", "translate-y-0");
            }, 10);
        } else {
            menu.classList.remove("opacity-100", "scale-100", "translate-y-0");
            menu.classList.add("opacity-0", "scale-95", "-translate-y-5");
            setTimeout(() => {
                menu.classList.add("hidden");
            }, 300);
        }
    });
}

// Toggle Cart Dropdown
if (cartBtn && cartDropdown) {
    cartBtn.addEventListener("click", () => {
        cartDropdown.classList.toggle("hidden");
    });
}

// ===================== Swiper =====================
if (typeof Swiper !== "undefined") {
    var swiper = new Swiper(".mySwiper", {
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });
}

// ===================== Register Form Handler =====================
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nama = document.getElementById('nama').value.trim();
        const no_telp = document.getElementById('telepon').value.trim();
        const alamat = document.getElementById('alamat').value.trim();
        const password = document.getElementById('password').value;
        const repassword = document.getElementById('repassword').value;
        const foto_ktp = document.getElementById('foto_ktp').files[0];
        const kelurahan = document.getElementById('kelurahan').value.trim();
        const provinsi = document.getElementById('provinsi').value.trim();
        const successDiv = document.getElementById('register-success');

        // Validasi password harus sama
        if (password !== repassword) {
            successDiv.textContent = "Password tidak sama!";
            successDiv.classList.remove('text-green-600');
            successDiv.classList.add('text-red-600');
            successDiv.classList.remove('hidden');
            return;
        }
        // Validasi ukuran file KTP maksimal 2MB
        if (foto_ktp && foto_ktp.size > 2 * 1024 * 1024) {
            successDiv.textContent = "Ukuran foto KTP maksimal 2MB!";
            successDiv.classList.remove('text-green-600');
            successDiv.classList.add('text-red-600');
            successDiv.classList.remove('hidden');
            return;
        }

        try {
            // Cek apakah nomor telepon sudah terdaftar
            const cekResponse = await fetch(`${base_url}pu_data_agen/api_data_agen`);
            const cekResult = await cekResponse.json();
            if (cekResult.status && Array.isArray(cekResult.data)) {
                const sudahAda = cekResult.data.some(item =>
                    item.no_telp === no_telp || item.no_telp === "+62" + no_telp.replace(/^0/, "")
                );
                if (sudahAda) {
                    successDiv.textContent = "Nomor telepon ini sudah terdaftar. Silakan gunakan nomor lain atau login jika sudah punya akun.";
                    successDiv.classList.remove('text-green-600');
                    successDiv.classList.add('text-red-600');
                    successDiv.classList.remove('hidden');
                    return;
                }
            }

            // Kirim data ke API backend menggunakan FormData
            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('no_telp', no_telp);
            formData.append('alamat', alamat);
            formData.append('password', password);
            formData.append('foto_ktp', foto_ktp);
            formData.append('kelurahan', kelurahan);
            formData.append('provinsi', provinsi);

            try {
                // Fetch ke endpoint CodeIgniter3 untuk tambah agen
                const response = await fetch(`${base_url}pu_data_agen/api_tambah_agen`, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                // Jika sukses, tampilkan pesan sukses
                if (result.status) {
                    successDiv.textContent = "Pendaftaran berhasil! Anda akan diarahkan ke WhatsApp admin untuk aktivasi akun.";
                    successDiv.classList.remove('text-red-600');
                    successDiv.classList.add('text-green-600');
                    successDiv.classList.remove('hidden');
                    this.reset();

                    // Redirect ke WhatsApp admin dengan pesan otomatis
                    const pesan = `Assalamu'alaikum wr wb, saya ingin mendaftar sebagai agen dengan nomor telepon ${no_telp}. Mohon bantuannya untuk mengaktifkan akun saya. Terima kasih.`;
                    const waUrl = `https://wa.me/62811917988?text=${encodeURIComponent(pesan)}`;
                    setTimeout(() => {
                        window.location.href = waUrl;
                    }, 1500); // beri jeda 1.5 detik agar user sempat lihat pesan sukses
                } else {
                    // Jika gagal, tampilkan pesan error dari API
                    successDiv.textContent = result.message || "Pendaftaran gagal!";
                    successDiv.classList.remove('text-green-600');
                    successDiv.classList.add('text-red-600');
                    successDiv.classList.remove('hidden');
                }
            } catch (error) {
                // Jika error koneksi, tampilkan pesan error
                successDiv.textContent = "Terjadi kesalahan koneksi ke server!";
                successDiv.classList.remove('text-green-600');
                successDiv.classList.add('text-red-600');
                successDiv.classList.remove('hidden');
            }
        } catch (error) {
            // Jika error koneksi, tampilkan pesan error
            successDiv.textContent = "Terjadi kesalahan koneksi ke server!";
            successDiv.classList.remove('text-green-600');
            successDiv.classList.add('text-red-600');
            successDiv.classList.remove('hidden');
        }
    });
}
});

// ===================== Toggle Password Handler =====================
function togglePassword(id, btn) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        // Ganti ikon mata menjadi "mata terbuka"
        btn.querySelector('svg').innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.671-2.568A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18"/>
        `;
    } else {
        input.type = "password";
        // Ganti ikon mata menjadi "mata tertutup"
        btn.querySelector('svg').innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268-2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        `;
    }
}

// ===================== SESSION DENGAN EXPIRED 2 HARI =====================

// Gunakan fungsi ini saat login berhasil
// function setAgenSession(data) {
//     const expiredAt = Date.now() + 5 * 1000; // 2 hari dalam ms
//     const sessionData = {
//         ...data,
//         expiredAt: expiredAt
//     };
//     localStorage.setItem("agen_session", JSON.stringify(sessionData));
// }

// // Gunakan fungsi ini untuk cek status login & expired
// function isAgenLoggedIn() {
//     const session = localStorage.getItem("agen_session");
//     if (!session) return false;
//     try {
//         const data = JSON.parse(session);
//         if (data.expiredAt && Date.now() < data.expiredAt) {
//             return true;
//         } else {
//             // Hapus session jika sudah expired
//             localStorage.removeItem("agen_session");
//             return false;
//         }
//     } catch {
//         localStorage.removeItem("agen_session");
//         return false;
//     }
// }
