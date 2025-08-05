// let base_url = "https://kolaborasigroup.com/admin/";
let base_url = "http://localhost:8080/sw/";

async function fetchDataProduk() {
    try {
        const response = await fetch(`${base_url}pu_produk_agen/api_produk_agen`);
        const result = await response.json();
        // Filter hanya produk dengan is_active == 1
        if (result.status && Array.isArray(result.data)) {
            result.data = result.data.filter(item => String(item.is_active) === "1");
        }
        return result;
    } catch (error) {
        return { status: false, data: [], message: "Gagal mengambil data produk" };
    }
}