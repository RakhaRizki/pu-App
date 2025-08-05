// let mainBaseUrl = "https://kolaborasigroup.com/admin/";
let mainBaseUrl = "http://localhost:8080/sw/";

// cek apakah agen_session sudah ada dan belum expired
function checkAgenSessionExpired() {
    const session = localStorage.getItem("agen_session");
    if (session) {
        try {
            const data = JSON.parse(session);
            if (data.login_time) {
                const now = Date.now();
                const expiredTime = 7 * 24 * 60 * 60 * 1000; // 7 hari
                if (now - data.login_time > expiredTime) {
                    localStorage.removeItem("agen_session");
                    window.location.href = "login.html";
                }
            }
        } catch (e) {
            localStorage.removeItem("agen_session");
            window.location.href = "login.html";
        }
    }
}

// panggil fungsi cek session saat halaman dimuat
checkAgenSessionExpired();

// ambil nama agen dari localStorage dan tampilkan di halaman
const agenSession = localStorage.getItem("agen_session");
let nama = "";
try {
    if (agenSession) {
        const agenData = JSON.parse(agenSession);
        nama = agenData.nama || "";
        $('#nama').html(nama);
    }
} catch (e) {
    console.error("Gagal parsing agen_session:", e);
}

// Swiper slider inisialisasi
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
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    // Responsive breakpoints (opsional, Swiper sudah responsif by default)
    slidesPerView: 1,
    spaceBetween: 0,
    breakpoints: {
        640: {
            slidesPerView: 1,
            spaceBetween: 0,
        },
        768: {
            slidesPerView: 1,
            spaceBetween: 0,
        },
        1024: {
            slidesPerView: 1,
            spaceBetween: 0,
        },
    }
});

// Fungsi cek login dari localStorage
function isAgenLoggedIn() {
    return !!localStorage.getItem("agen_session");
}

// Fungsi toggle fee: sembunyikan/munculkan fee sesuai status login
function toggleFeeVisibility() {
    document.querySelectorAll('#fee').forEach(function(feeEl) {
        if (isAgenLoggedIn()) {
            feeEl.style.display = '';
        } else {
            feeEl.style.display = 'none';
        }
    });
}

// Tampilkan filter fee hanya jika sudah login
function toggleFeeFilter() {
    var feeFilter = document.getElementById('fee-filter');
    if (!feeFilter) return;
    if (isAgenLoggedIn()) {
        feeFilter.style.display = '';
    } else {
        feeFilter.style.display = 'none';
        // Reset filter jika logout
        feeFilter.value = '';
    }
}

// Fungsi update tombol logout
function updateLogoutButton() {
    var logoutBtn = document.getElementById('logout-btn');
    var logoutBtnMobile = document.getElementById('logout-btn-mobile');
    var salam = document.getElementById('salam');
    var textAgen = document.getElementById('text-agen');

    if (!logoutBtn) return;
    if (isAgenLoggedIn()) {
        logoutBtn.style.display = 'inline-block';
    if (logoutBtnMobile) logoutBtnMobile.style.display = 'flex';
    if (salam) salam.style.display = 'inline-block';
    if (textAgen) textAgen.style.display = 'none';
    } else {
        logoutBtn.style.display = 'none';
        if (logoutBtnMobile) logoutBtnMobile.style.display = 'none';
        if (salam) salam.style.display = 'none';
        if (textAgen) textAgen.style.display = 'block';
    }
}

// Fungsi untuk format angka ke Rupiah
function formatRupiah(angka) {
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

// Fungsi format tanggal ke "7 Januari 2025"
function formatTanggalIndo(tgl) {
    if (!tgl) return "-";
    // Ambil hanya bagian tanggal jika ada waktu
    tgl = tgl.split(' ')[0].split('T')[0];
    // Cek format tanggal
    let dateObj;
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(tgl)) {
        // Format: 2025-01-07 atau 2025/01/07
        dateObj = new Date(tgl.replace(/-/g, '/'));
    } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(tgl)) {
        // Format: 07-01-2025
        const [d, m, y] = tgl.split(/[-/]/);
        dateObj = new Date(`${y}/${m}/${d}`);
    } else {
        return tgl;
    }
    const bulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return dateObj.getDate() + " " + bulan[dateObj.getMonth()] + " " + dateObj.getFullYear();
}

let produkDataCache = []; // cache data produk untuk pencarian

// Fungsi untuk mengisi select tanggal keberangkatan unik
function populateTanggalFilter(dataProduk) {
    const tanggalFilter = document.getElementById('tanggal-filter');
    if (!tanggalFilter) return;
    // Ambil semua tanggal unik, urutkan ASC
    const tanggalArr = Array.from(new Set(
        dataProduk
            .map(item => item.tanggal_keberangkatan)
            .filter(Boolean)
    ));
    tanggalArr.sort((a, b) => new Date(a) - new Date(b));
    // Kosongkan dan isi ulang
    tanggalFilter.innerHTML = `<option value="">Filter Tanggal</option>`;
    tanggalArr.forEach(tgl => {
        tanggalFilter.innerHTML += `<option value="${tgl}">${formatTanggalIndo(tgl)}</option>`;
    });
}

// Render produk list
async function renderProdukList(filteredData = null, feeSort = "", tanggalFilterValue = "") {
    const productList = document.getElementById("product-list");
    const searchInfo = document.getElementById("search-result-info");
    if (!productList) return;

    let apiResult;
    if (!produkDataCache.length) {
        try {
            apiResult = await fetchDataProduk();
            if (apiResult && apiResult.status && Array.isArray(apiResult.data)) {
                produkDataCache = apiResult.data;
                // Populate tanggal filter saat pertama kali load data
                populateTanggalFilter(produkDataCache);
            }
        } catch (e) {
            productList.innerHTML = `<div class="col-span-4 text-center text-gray-500 py-8">Gagal mengambil data produk.</div>`;
            return;
        }
    } else if (!document.getElementById('tanggal-filter').options.length || document.getElementById('tanggal-filter').options.length === 1) {
        // Populate tanggal filter jika belum terisi
        populateTanggalFilter(produkDataCache);
    }

    // Data yang akan dirender: hasil filter atau semua data
    let dataToRender = filteredData || produkDataCache;

    // Filter by tanggal_keberangkatan jika ada
    if (tanggalFilterValue) {
        dataToRender = dataToRender.filter(item => item.tanggal_keberangkatan === tanggalFilterValue);
    }

    // Urutkan berdasarkan fee jika ada filter
    if (feeSort === "asc") {
        dataToRender = [...dataToRender].sort((a, b) => (parseInt(a.fee_agen) || 0) - (parseInt(b.fee_agen) || 0));
    } else if (feeSort === "desc") {
        dataToRender = [...dataToRender].sort((a, b) => (parseInt(b.fee_agen) || 0) - (parseInt(a.fee_agen) || 0));
    }

    // Validasi data
    if (!dataToRender || !dataToRender.length) {
        productList.innerHTML = `<div class="col-span-4 text-center text-gray-500 py-8">Produk tidak ditemukan.</div>`;
        if (searchInfo) searchInfo.textContent = "";
        return;
    }

    // Kosongkan dulu
    productList.innerHTML = "";

    dataToRender.forEach((item, idx) => {
        // Data fallback
        const imgSrc = item.image && item.image !== "" 
            ? `${mainBaseUrl}assets/backend/document/pu_produk_agen/${item.image}` 
            : "images/default.jpg";
        const travel = item.travel || "-";
        const tanggal = item.tanggal_keberangkatan ? formatTanggalIndo(item.tanggal_keberangkatan) : "-";
        const harga = item.harga_paket ? formatRupiah(item.harga_paket) : "-";
        const fee = item.fee_agen ? "Fee : " + Number(item.fee_agen).toLocaleString("id-ID") : "-";
        const sisaSeat = item.sisa_seat !== undefined ? item.sisa_seat : "-";
        const isLogin = isAgenLoggedIn && isAgenLoggedIn();

        // Card HTML
        const card = `
        <a href="javascript:void(0)" class="block no-underline text-inherit mb-3${idx >= 8 && !filteredData ? ' hidden-item' : ''}" tabindex="0">
            <div class="bg-white shadow-md rounded-lg overflow-hidden transform hover:scale-[1.03] transition duration-300">
                <div class="relative group">
                    <img src="${imgSrc}" alt="${travel}"
                    class="w-full h-32 md:h-48 object-cover object-top cursor-pointer transition hover:opacity-80"
                    loading="lazy" decoding="async"
                    onclick="openImgPreview('${imgSrc.replace(/'/g, "\\'")}', '${sisaSeat}')">
                    <!-- Watermark Sold Out jika seat 0 -->
                    ${item.sisa_seat !== undefined && Number(item.sisa_seat) === 0 ? `
                <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span class="bg-red-600/80 text-white text-lg md:text-2xl font-extrabold px-6 py-2 rounded-xl shadow-lg rotate-[-15deg] tracking-widest opacity-90 select-none"
                        style="backdrop-filter: blur(2px); letter-spacing: 0.15em;">
                        SOLD OUT
                    </span>
                </div>
            ` : ""}
            ${isLogin ? `
            <button onclick="event.stopPropagation(); downloadImage('${imgSrc.replace(/'/g, "\\'")}', '${travel.replace(/'/g, "\\'")}')" 
                class="absolute bottom-2 right-2 bg-orange-500 text-white rounded-full p-2 shadow-lg opacity-80 hover:opacity-100 hover:bg-orange-600 transition"
                title="Download Gambar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"/>
                </svg>
            </button>
            ` : ""}
            </div>
                <div class="p-3 md:p-4">
                    <!-- Nama Paket -->
                    <h3 class="text-xs md:text-base font-semibold text-gray-800">${travel}</h3>
                    <!-- Nama Hotel & Bintang -->
                    <div class="flex flex-wrap items-center text-[10px] md:text-sm text-gray-600 mt-1 md:mt-1">
                        <span class="font-medium">${tanggal}</span>
                    </div>
                    <!-- Harga Mulai dan Harga -->
                    <div class="flex flex-col md:flex-row md:items-center gap-0.5 mt-1 md:mt-1">
                        <span class="text-xs text-gray-500 font-semibold whitespace-nowrap md:mr-2">Harga Mulai</span>
                        <span class="text-sm md:text-lg font-extrabold bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text m-0">
                            ${harga}
                        </span>
                    </div>
                    <span style="font-size: 13px; color: #e62e04;" id="fee" class="mt-1">${fee}</span>
                    <div class="flex flex-wrap items-center text-[10px] md:text-sm text-gray-600 mt-1 md:mt-2">
                        <span class="font-medium">Sisa Seat : ${sisaSeat}</span>
                    </div>
                </div>
            </div>
        </a>    
        `;
    productList.insertAdjacentHTML("beforeend", card);
        });

        // Info hasil pencarian
        if (searchInfo) {
            if (filteredData) {
                searchInfo.textContent = `Menampilkan ${dataToRender.length} produk hasil pencarian.`;
            } else {
                searchInfo.textContent = "";
            }
        }

        // Sembunyikan produk ke-5 dst
        if (!filteredData) {
            // Hapus class show-all jika ada
            $('#product-list').removeClass('show-all');
            // Sembunyikan produk ke-5 dst
            $('#product-list a').each(function(i) {
                if (i >= 8) {
                    $(this).addClass('hidden-item');
                } else {
                    $(this).removeClass('hidden-item');
                }
            });
            // Atur tombol
            $('#product-list-button').text('Lihat Semua →');
            $('#product-list-button').off('click').on('click', function() {
                const $productList = $('#product-list');
                if ($productList.hasClass('show-all')) {
                    // Sembunyikan lagi produk ke-5 dst
                    $productList.removeClass('show-all');
                    $('#product-list a').each(function(i) {
                        if (i >= 8) {
                            $(this).addClass('hidden-item');
                        }
                    });
                    $(this).text('Lihat Semua →');
                } else {
                    // Tampilkan semua produk
                    $productList.addClass('show-all');
                    $('#product-list a').removeClass('hidden-item');
                    $(this).text('Sembunyikan Produk');
                }
            });
        } else {
            $('#product-list-button').off('click');
        }

        // Toggle fee sesuai status login
        toggleFeeVisibility();
    }

    // Event pencarian produk
    document.addEventListener("DOMContentLoaded", function () {
        // ...existing code...
        renderProdukList();

        const searchInput = document.getElementById('search-produk');
        const feeFilter = document.getElementById('fee-filter');
        const tanggalFilter = document.getElementById('tanggal-filter');
        let lastFiltered = null;
        let lastKeyword = "";
        let lastTanggal = "";

        function doSearchAndFilter() {
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            const tanggalVal = tanggalFilter ? tanggalFilter.value : "";
            let filtered = null;
            if (keyword) {
                filtered = produkDataCache.filter(item => {
                    const travel = (item.travel || '').toLowerCase();
                    const tanggal = item.tanggal_keberangkatan ? formatTanggalIndo(item.tanggal_keberangkatan).toLowerCase() : '';
                    const harga = item.harga_paket ? formatRupiah(item.harga_paket).toLowerCase() : '';
                    const fee = item.fee_agen ? String(item.fee_agen).toLowerCase() : '';
                    const sisaSeat = item.sisa_seat !== undefined ? String(item.sisa_seat).toLowerCase() : '';
                    return (
                        travel.includes(keyword) ||
                        tanggal.includes(keyword) ||
                        harga.includes(keyword) ||
                        fee.includes(keyword) ||
                        sisaSeat.includes(keyword)
                    );
                });
            }
            lastFiltered = filtered;
            lastKeyword = keyword;
            lastTanggal = tanggalVal;
            renderProdukList(filtered, feeFilter ? feeFilter.value : "", tanggalVal);
        }

        if (searchInput) {
            searchInput.addEventListener('input', doSearchAndFilter);
        }
        if (feeFilter) {
            feeFilter.addEventListener('change', doSearchAndFilter);
        }
        if (tanggalFilter) {
            tanggalFilter.addEventListener('change', doSearchAndFilter);
        }
    });
    // Mobile menu & cart dropdown
    document.addEventListener("DOMContentLoaded", function  () {
        // Swiper sudah diinisialisasi di atas

        // Render produk saat halaman dimuat
        renderProdukList();
        toggleFeeVisibility();
        toggleFeeFilter(); // <-- Pastikan ini dipanggil di sini!

        // Sembunyikan tombol register & login jika sudah login
        if (isAgenLoggedIn()) {
            var regBtn = document.getElementById('register-button');
            var loginBtn = document.getElementById('login-button');
            if (regBtn) regBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'none';
        }

        // Tampilkan tombol logout jika sudah login
        updateLogoutButton();
        var logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('agen_session');
                localStorage.removeItem('agen_referral');
                updateLogoutButton();
                toggleFeeVisibility();
                toggleFeeFilter(); // <-- Pastikan ini juga dipanggil saat logout!
                window.location.href = "login.html";
            });
        }

        // Mobile menu logic
        const menuBtn = document.querySelector(".mobile-menu-button");
        const menu = document.querySelector(".mobile-menu");
        const cartBtn = document.getElementById("cartButton");
        const cartDropdown = document.getElementById("cartDropdown");

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

    // Fungsi untuk buka modal preview gambar
    function openImgPreview(imgSrc, sisaSeat = null) {
        const modal = document.getElementById('img-preview-modal');
        const img = document.getElementById('img-preview-modal-img');
        const downloadBtn = document.getElementById('img-preview-download');
        img.src = imgSrc;
        downloadBtn.href = imgSrc;

        // Hapus overlay SOLD OUT jika ada
        const prevOverlay = modal.querySelector('.sold-out-overlay');
        if (prevOverlay) prevOverlay.remove();

        // Tambahkan overlay SOLD OUT jika seat 0
        if (sisaSeat !== null && Number(sisaSeat) === 0) {
            const overlay = document.createElement('div');
            overlay.className = 'sold-out-overlay absolute inset-0 flex items-center justify-center z-50 pointer-events-none';
            overlay.innerHTML = `
                <span class="bg-red-600/90 text-white text-2xl md:text-4xl font-extrabold px-8 py-4 rounded-xl shadow-lg rotate-[-15deg] tracking-widest opacity-95 select-none"
                    style="backdrop-filter: blur(2px); letter-spacing: 0.15em;">
                    SOLD OUT
                </span>
            `;
            // Tempelkan overlay ke parent img (relative)
            img.parentElement.appendChild(overlay);
            img.parentElement.classList.add('relative');
        }

        modal.classList.remove('hidden');
    }

    // Fungsi untuk tutup modal preview gambar
    function closeImgPreview(e) {
        // Jika dipanggil dari onclick modal (background), atau tombol X, tutup modal
        // Jika dipanggil dari dalam konten modal (event.stopPropagation()), tidak menutup
        document.getElementById('img-preview-modal').classList.add('hidden');
    }

    // Ganti fungsi downloadImage agar hasil download berupa gambar (bukan PDF) dengan barcode di atas gambar produk

async function downloadImage(url, travel) {
    // Ambil kode referral dari session agen_session.kode_referral
    let kode = "";
    const agenSession = localStorage.getItem("agen_session");
    if (agenSession) {
        try {
            const agenData = JSON.parse(agenSession);
            kode = agenData.kode_referral || "";
        } catch (e) {
            kode = "";
        }
    }
    const isLogin = !!kode;

    // Load gambar produk
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = function() {
        let canvas, ctx, width, height;
        if (isLogin && kode) {
            // Buat QR code dengan ukuran lebih kecil lagi
            const qrCanvas = document.createElement('canvas');
            qrCanvas.width = 120;
            qrCanvas.height = 120;
            const qr = new QRious({
                element: qrCanvas,
                value: `https://link.pengenumroh.com/?mb=${kode}`,
                size: 120,
                background: 'white'
            });

            // Tambahkan background & teks di tengah QR
            const qrCtx = qrCanvas.getContext('2d');
            const boxWidth = 42;
            const boxHeight = 10;
            const boxX = (qrCanvas.width - boxWidth) / 2;
            const boxY = (qrCanvas.height - boxHeight) / 2.05;
            qrCtx.save();
            qrCtx.globalAlpha = 0.85;
            qrCtx.fillStyle = '#fff';
            qrCtx.fillRect(boxX, boxY, boxWidth, boxHeight);
            qrCtx.restore();
            qrCtx.font = 'bold 9px Arial';
            qrCtx.fillStyle = '#111723';
            qrCtx.textAlign = 'center';
            qrCtx.textBaseline = 'middle';
            qrCtx.fillText(kode, qrCanvas.width / 2, qrCanvas.height / 2);

            // Gabungkan gambar produk + QR di bawah, dan teks di atas barcode (center)
            width = img.width;
            height = img.height + 180;
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, img.height);
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, img.height, width, 180);

            // Teks di atas barcode, center
            const text = "Scan barcode ini untuk info produk lebih lanjut";
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = "#e67e22";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(text, width / 2, img.height + 14);

            // Gambar barcode (QR) di bawah produk (center, lebih ke atas)
            const qrX = (width - 130) / 2;
            ctx.drawImage(qrCanvas, qrX, img.height + 35, 130, 130);
        } else {
            // Jika belum login atau tidak ada kode referral, hanya gambar produk saja
            width = img.width;
            height = img.height;
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, img.height);
        }

        // Download hasil gabungan sebagai gambar (JPEG) menggunakan Blob
        const finalImg = canvas.toDataURL("image/jpeg", 0.95);
        const blob = dataURLtoBlob(finalImg);
        const urlBlob = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = urlBlob;
        link.download = (travel || 'produk') + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(urlBlob);
    };
    img.onerror = function() {
        alert('Gagal memuat gambar produk.');
    };
}

// Ganti bagian download gambar di fungsi downloadImage dengan Blob agar browser langsung download tanpa preview

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

// Tampilkan nama agen di navbar jika login
function updateNavbarProfile() {
    const profileName = document.getElementById('navbar-profile-name');
    const agenSession = localStorage.getItem("agen_session");
    if (profileName && agenSession) {
        try {
            const agen = JSON.parse(agenSession);
            // Ambil huruf pertama nama agen, uppercase
            const initial = (agen.nama || "-").charAt(0).toUpperCase();
            // Tampilkan sebagai lingkaran avatar kecil
            profileName.innerHTML = `
                <span class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold text-lg border border-orange-300 shadow-sm">
                    ${initial}
                </span>
            `;
            profileName.style.display = "inline-block";
            profileName.onclick = openProfileModal;
        } catch (e) {
            profileName.style.display = "none";
        }
    } else if (profileName) {
        profileName.style.display = "none";
    }
}

// Buka modal profile
async function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const agenSession = localStorage.getItem("agen_session");
    const ajukanBtn = document.getElementById('ajukan-pencairan-btn');
    if (agenSession) {
        try {
            const agen = JSON.parse(agenSession);
            document.getElementById('profile-nama').textContent = agen.nama || "-";
            document.getElementById('profile-telepon').textContent = agen.no_telp || "-";
            // Ambil saldo terbaru dari API (pakai await!)
            const saldo = await getSaldoAgen(agen.id);
            document.getElementById('profile-saldo').textContent = "Rp " + saldo.toLocaleString("id-ID");
            // Avatar inisial
            const initial = (agen.nama || "-").charAt(0).toUpperCase();
            document.getElementById('profile-avatar').textContent = initial;
            // Logic tampilkan/sembunyikan tombol pencairan fee
            if (ajukanBtn) {
                if (saldo > 0) {
                    ajukanBtn.style.display = '';
                } else {
                    ajukanBtn.style.display = 'none';
                }
            }
        } catch (e) {}
    }
    modal.classList.remove('hidden');
}

// Tutup modal profile
function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

// Panggil saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
    updateNavbarProfile();
    // Ajukan pencairan fee logic
    const ajukanBtn = document.getElementById('ajukan-pencairan-btn');
    const formPencairan = document.getElementById('form-pencairan-fee');
    const jumlahInput = document.getElementById('jumlah-pencairan');
    const errorMsg = document.getElementById('pencairan-error');
    const kirimBtn = document.getElementById('kirim-pencairan-btn');
    const noRekInput = document.getElementById('no-rekening');
    const namaRekInput = document.getElementById('nama-rekening');

    if (ajukanBtn && formPencairan && jumlahInput && errorMsg && kirimBtn) {
        ajukanBtn.onclick = function() {
            formPencairan.classList.remove('hidden');
            jumlahInput.value = '';
            errorMsg.classList.add('hidden');
            errorMsg.textContent = '';
            jumlahInput.focus();
        };

        jumlahInput.addEventListener('input', async function() {
            // Format input jadi rupiah bertitik
            let raw = jumlahInput.value.replace(/\./g, "");
            jumlahInput.value = formatInputRupiah(raw);

            // Validasi tidak boleh lebih dari saldo
            const agenSession = localStorage.getItem("agen_session");
            // Ambil saldo terbaru dari database (bukan dari session)
            let saldo = 0;
            if (agenSession) {
                try {
                    const agen = JSON.parse(agenSession);
                    saldo = await getSaldoAgen(agen.id);
                } catch (e) {}
            }
            let val = Number(raw);
            if (val > saldo) {
                errorMsg.textContent = "Nominal tidak boleh lebih dari saldo Anda.";
                errorMsg.classList.remove('hidden');
                jumlahInput.value = formatInputRupiah(String(saldo));
            } else {
                errorMsg.classList.add('hidden');
                errorMsg.textContent = '';
            }
        });

        kirimBtn.onclick = async function() {
            const agenSession = localStorage.getItem("agen_session");
            let saldo = 0;
            let telepon = "";
            if (agenSession) {
                try {
                    const agen = JSON.parse(agenSession);
                    saldo = await getSaldoAgen(agen.id);
                    telepon = agen.no_telp || "";
                } catch (e) {}
            }
            let val = Number(jumlahInput.value.replace(/\./g, ""));
            const noRek = noRekInput.value.trim();
            const namaRek = namaRekInput.value.trim();
            const namaBank = document.getElementById('nama-bank').value;

            if (!val || val < 1) {
                errorMsg.textContent = "Masukkan nominal pencairan yang valid.";
                errorMsg.classList.remove('hidden');
                return;
            }
            if (val > saldo) {
                errorMsg.textContent = "Nominal tidak boleh lebih dari saldo Anda.";
                errorMsg.classList.remove('hidden');
                return;
            }
            if (!noRek) {
                errorMsg.textContent = "Nomor rekening wajib diisi.";
                errorMsg.classList.remove('hidden');
                return;
            }
            if (!namaBank) {
                errorMsg.textContent = "Nama bank wajib dipilih.";
                errorMsg.classList.remove('hidden');
                return;
            }
            if (!namaRek) {
                errorMsg.textContent = "Nama pemilik rekening wajib diisi.";
                errorMsg.classList.remove('hidden');
                return;
            }
            errorMsg.classList.add('hidden');
            errorMsg.textContent = '';

            // Kirim data ke API via POST
            try {
                const formData = new FormData();
                formData.append('no_telp', telepon);
                formData.append('no_rek', noRek);
                formData.append('nama_bank', namaBank);
                formData.append('nama_pemilik_rek', namaRek);
                formData.append('nominal', val);

                const response = await fetch(`${mainBaseUrl}pu_data_agen/api_tambah_pencairan`, {
                    method: "POST",
                    body: formData
                });
                const result = await response.json();
                if (result.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Permintaan Diterima!',
                        text: 'Permintaan pencairan fee Anda berhasil diajukan dan akan diproses dalam waktu maksimal 3 x 24 jam.',
                        confirmButtonColor: '#16a34a'
                    }).then(() => {
                        window.location.reload();
                    });
                    formPencairan.classList.add('hidden');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: result.message || "Gagal mengajukan pencairan.",
                        confirmButtonColor: '#e62e04'
                    });
                    errorMsg.textContent = result.message || "Gagal mengajukan pencairan.";
                    errorMsg.classList.remove('hidden');
                }
            } catch (e) {
                errorMsg.textContent = "Terjadi kesalahan koneksi. Silakan coba lagi.";
                errorMsg.classList.remove('hidden');
            }
        };
    }
});

function formatInputRupiah(angka) {
    angka = angka.replace(/[^0-9]/g, "");
    if (!angka) return "";
    return angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk mengambil saldo agen dari backend
async function getSaldoAgen(idAgen) {
    try {
        // Ganti URL sesuai endpoint backend kamu
        const res = await fetch(`${mainBaseUrl}pu_data_agen/getSaldoAgen/${idAgen}`);
        const data = await res.json();
        if (data && data.saldo !== undefined) {
            return Number(data.saldo);
        }
    } catch (e) {}
    return 0;
}

// History Transaksi logic
document.addEventListener("DOMContentLoaded", function () {
    const historyBtn = document.getElementById('history-transaksi-btn');
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');

    if (historyBtn) {
        historyBtn.addEventListener('click', async function () {
            // Tampilkan modal
            historyModal.classList.remove('hidden');

            // Ambil data history transaksi dari API
            const agenSession = localStorage.getItem("agen_session");
            let noTelp = "";
            if (agenSession) {
                try {
                    const agenData = JSON.parse(agenSession);
                    noTelp = agenData.no_telp || "";
                } catch (e) {
                    noTelp = "";
                }
            }

            if (!noTelp) {
                historyList.innerHTML = `<div class="text-center text-gray-500 py-8">Akun tidak valid. Silakan login kembali.</div>`;
                return;
            }

            // Loading state
            historyList.innerHTML = `<div class="text-center text-gray-400 py-4">Memuat data...</div>`;

            try {
                const response = await fetch(`${mainBaseUrl}pu_data_agen/getHistoryTransaksi/${encodeURIComponent(noTelp)}`);
                const result = await response.json();

                if (result && Array.isArray(result.data)) {
                    historyList.innerHTML = "";
                    // ...dalam bagian render history transaksi...
                    result.data.forEach(item => {
                        const tanggalObj = item.created_at ? new Date(item.created_at.replace(/-/g, '/')) : null;
                        let tanggal = "-";
                        let jam = "";
                        if (tanggalObj && !isNaN(tanggalObj)) {
                            tanggal = formatTanggalIndo(item.created_at);
                            // Ambil jam:menit:detik dari waktu
                            const pad = n => n.toString().padStart(2, '0');
                            jam = pad(tanggalObj.getHours()) + ":" + pad(tanggalObj.getMinutes()) + ":" + pad(tanggalObj.getSeconds());
                        }
                        const nominal = item.nominal ? formatRupiah(item.nominal) : "-";
                        let status = "";
                        let statusClass = "";
                        if (item.payment_status === "1") {
                            status = "Berhasil";
                            statusClass = "text-green-600";
                        } else if (item.payment_status === "2") {
                            status = "Pending";
                            statusClass = "text-yellow-500";
                        } else if (item.payment_status === "3") {
                            status = "Insentif+";
                            statusClass = "text-blue-600";
                        } else {
                            status = "Gagal";
                            statusClass = "text-red-600";
                        }

                        const historyItem = `
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-lg shadow-md p-4 mb-4">
                                <div class="flex-1 min-w-0 mr-3">
                                    <h3 class="text-base font-bold text-gray-800">${nominal}</h3>
                                    <p class="text-sm text-gray-500 truncate">${item.description || "-"}</p>
                                    <p class="text-xs text-gray-400">${tanggal}${jam ? ' - ' + jam : ''}</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <span class="text-xs ${statusClass} font-semibold">${status}</span>
                                </div>
                            </div>
                        `;
                        historyList.insertAdjacentHTML("beforeend", historyItem);
                    });
                } else {
                    historyList.innerHTML = `<div class="text-center text-gray-500 py-8">Tidak ada data history transaksi.</div>`;
                }
            } catch (e) {
                historyList.innerHTML = `<div class="text-center text-red-500 py-8">Gagal memuat data history transaksi.</div>`;
            }
        });
    }

    // Close modal on outside click
    window.closeHistoryModal = function (e) {
        // Jika dipanggil tanpa event (dari tombol X), atau klik di luar konten modal
        const modal = document.getElementById('history-modal');
        if (!e || e.target === modal) {
            modal.classList.add('hidden');
        }
    };
});