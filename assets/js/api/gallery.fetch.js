document.addEventListener("DOMContentLoaded", function () {
    fetchGlleryCategory();
});

const API_BASE_URL = "http://localhost:3000/api/galleries";

async function fetchGlleryCategory() {
    try {
        const response = await fetch(`${API_BASE_URL}/galleryCategory`);
        if (!response.ok) {
            throw new Error("Gagal mengambil data galleri category");
        }
        const result = await response.json();
        console.log(result);
        renderGalleryCategory(result.data);
    } catch (error) {
        console.log()
    }
}

async function fetchGallery(category = null) {
    try {
        let url = `${API_BASE_URL}/gallery`;
        if (category && category !== "all") {
            url += `?category=${category}`;
        }

        const response = await fetch(url);
        console.log(response);
        if (!response.ok) {
            throw new Error("Gagal mengambil data galeri");
        }
        const result = await response.json();
        renderGallery(result.data);
    } catch (error) {
        console.error("❌ Error:", error.message);
        document.getElementById("gallery-container").innerHTML = `
            <p>Gagal memuat galeri. Silakan coba lagi nanti.</p>
        `;
    }
}


function renderGalleryCategory(data) {
    const container = document.getElementById("category");

    // Tambahkan tombol "Semua" manual di awal
    const allBtn = document.createElement("button");
    allBtn.className = "category-btn px-4 py-2 rounded-full text-sm font-semibold shadow-md transition bg-orange-500 text-white";
    allBtn.setAttribute("data-category", "all");
    allBtn.textContent = "Semua";
    container.appendChild(allBtn);

    // Render kategori lain
    data.forEach(item => {
        const card = document.createElement("button");
        card.className = "category-btn px-4 py-2 rounded-full text-sm font-semibold shadow-md transition bg-white text-gray-700";
        card.setAttribute("data-category", item.slug);
        card.textContent = item.name;
        container.appendChild(card);
    });

    // Tambahkan event listener ke semua tombol
    const buttons = container.querySelectorAll(".category-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Reset semua
            buttons.forEach(b => {
                b.classList.remove("bg-orange-500", "text-white");
                b.classList.add("bg-white", "text-gray-700");
            });

            // Aktifkan tombol yang diklik
            btn.classList.remove("bg-white", "text-gray-700");
            btn.classList.add("bg-orange-500", "text-white");

            const selectedCategory = btn.getAttribute("data-category");
            fetchGallery(selectedCategory); // trigger ambil galeri
        });
    });

    // Trigger pertama kali = "Semua"
    fetchGallery("all");
}

function renderGallery(data) {
    const container = document.getElementById("gallery");
    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500">Galeri kosong.</p>`;
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "gallery-item all umrah relative overflow-hidden rounded-lg shadow-lg";

        card.innerHTML = `
            <a href="detail-galeri.html">
                <img src="${item.image_url}" alt="${item.title}"
                    class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
            </a>
        `;
        container.appendChild(card);
    });
}


