document.addEventListener("DOMContentLoaded", function () {
    fetchTravelData();
});

async function fetchTravelData() {
    const API_URL = "http://localhost:3000/api/travel";
    const container = document.getElementById("travel-body");

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Gagal mengambil data travel");
        }

        const result = await response.json();
        const travelData = result.data;

        // Kosongkan container sebelum append
        container.innerHTML = "";

        // Append setiap data ke dalam container
        travelData.forEach(travel => {
            const card = document.createElement("a");
            card.href = "#"; // Ganti dengan link detail jika ada
            card.className = "bg-white shadow-lg rounded-lg p-4 flex flex-col items-center hover:scale-105 transition-transform duration-300";

            card.innerHTML = `
                <img src="${travel.logo_url}" alt="${travel.name}" class="w-20 h-20 object-cover mb-3">
                <h2 class="text-lg font-semibold text-gray-800">${travel.name}</h2>
                <div class="flex mt-2">${generateStars(travel.rating)}</div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("❌ Error:", error.message);
        container.innerHTML = `<p class="text-center text-gray-500">Gagal memuat data travel. Silakan coba lagi nanti.</p>`;
    }
}

function generateStars(rating) {
    const maxStars = 5;
    let stars = "";

    for (let i = 0; i < maxStars; i++) {
        stars += i < rating ? "⭐" : "☆";
    }

    return stars;
}