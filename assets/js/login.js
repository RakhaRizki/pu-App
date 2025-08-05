// let base_url = "https://kolaborasigroup.com/admin/";
let base_url = "http://localhost:8080/sw/";

// ===================== Navbar & Mobile Menu =====================
document.addEventListener("DOMContentLoaded", function () {
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
});

// ===================== Register Form Handler =====================
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Validasi password sama
        const pass = document.getElementById('password').value;
        const repass = document.getElementById('repassword').value;
        const successDiv = document.getElementById('register-success');
        if(pass !== repass) {
            successDiv.textContent = "Password tidak sama!";
            successDiv.classList.remove('text-green-600');
            successDiv.classList.add('text-red-600');
            successDiv.classList.remove('hidden');
            return;
        }
        // jika sukses, tampilkan pesan sukses
        successDiv.textContent = "Pendaftaran berhasil! Kami akan segera menghubungi Anda.";
        successDiv.classList.remove('text-red-600');
        successDiv.classList.add('text-green-600');
        successDiv.classList.remove('hidden');
        this.reset();
    });
}

// ===================== Login Form Handler =====================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const telepon = document.getElementById('telepon').value.trim();
        const password = document.getElementById('password').value.trim();
        // Hash password input user
        const passwordHash = md5(password); // pastikan hash sesuai backend
        const successDiv = document.getElementById('login-success');
        successDiv.classList.add('hidden');
        successDiv.textContent = "";

        try {
            // Fetch data agen dari API
            const response = await fetch(`${base_url}pu_data_agen/api_data_agen`);    
            if (!response.ok) throw new Error("Gagal mengambil data agen");
            const result = await response.json();

            if (result.status && Array.isArray(result.data)) {
                // Cari user yang cocok
                const agen = result.data.find(item =>
                    (item.no_telp === telepon || item.no_telp === "+62" + telepon.replace(/^0/, "")) &&
                    item.password === passwordHash
                );

                if (agen) {
                    if (agen.is_active === "0" || agen.is_active === 0) {
                        successDiv.textContent = "Akun Anda belum aktif. Silakan hubungi admin untuk aktivasi akun agar dapat mengakses layanan kami.";
                        successDiv.classList.remove('text-green-600');
                        successDiv.classList.add('text-red-600');
                        successDiv.classList.remove('hidden');
                        return;
                    }
                    // Simpan session di localStorage
                    localStorage.setItem("agen_session", JSON.stringify({
                        id: agen.id,
                        nama: agen.nama,
                        no_telp: agen.no_telp,
                        alamat: agen.alamat,
                        ktp: agen.ktp,
                        saldo: agen.saldo,
                        kode_referral: agen.kode_referral,
                        login_time: Date.now()
                    }));
                    // Redirect ke index.html
                    window.location.href = "index.html";
                } else {
                    successDiv.textContent = "No. Telepon atau Password salah!";
                    successDiv.classList.remove('text-green-600');
                    successDiv.classList.add('text-red-600');
                    successDiv.classList.remove('hidden');
                }
            } else {
                successDiv.textContent = "Gagal mengambil data agen!";
                successDiv.classList.remove('text-green-600');
                successDiv.classList.add('text-red-600');
                successDiv.classList.remove('hidden');
            }
        } catch (error) {
            successDiv.textContent = "Terjadi kesalahan koneksi ke server!";
            successDiv.classList.remove('text-green-600');
            successDiv.classList.add('text-red-600');
            successDiv.classList.remove('hidden');
            console.error(error);
        }
    });
}

// Swiper
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