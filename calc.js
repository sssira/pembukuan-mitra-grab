/**
 * Core Matematika & Manajemen Data Aplikasi Pembukuan Ojol
 * Seluruh rumus perhitungan dikunci di sini agar mudah diedit.
 */

let masterData = [];
let potonganHematManual = {}; 
let databasePolaLevel = {
    jawara: { argoMinDipotong: false, totalSampelHari: 0 },
    ksatria: { argoMinDipotong: true, totalSampelHari: 0 },
    pejuang: { argoMinDipotong: true, totalSampelHari: 0 },
    anggota: { argoMinDipotong: true, totalSampelHari: 0 }
};

let modeTampilan = 'hari'; 
let idDataSedangDiedit = null;

// Inisialisasi awal saat load script oleh index.html
function inisialisasiData() {
    // Set default tanggal hari ini
    document.getElementById('tanggalTrip').value = new Date().toISOString().slice(0,10);

    // Muat data dari localStorage jika ada
    if (localStorage.getItem('masterDataOjol')) masterData = JSON.parse(localStorage.getItem('masterDataOjol'));
    if (localStorage.getItem('potonganHematManualOjol')) potonganHematManual = JSON.parse(localStorage.getItem('potonganHematManualOjol'));
    if (localStorage.getItem('databasePolaLevelOjol')) databasePolaLevel = JSON.parse(localStorage.getItem('databasePolaLevelOjol'));

    // Tambahkan event listener agar setiap kali tanggal diubah manual lewat kalender, tabel otomatis ter-update
    document.getElementById('tanggalTrip').addEventListener('change', () => {
        if(modeTampilan === 'hari') prosesDanTampilkan();
    });

    updateLabelInput();
    prosesDanTampilkan();
}

function handleKeyPress(event) {
    if (event.key === "Enter") tambahTrip();
}

function toggleAccordion() {
    const content = document.getElementById('accContent');
    const arrow = document.getElementById('accArrow');
    if (content.style.display === "block") {
        content.style.display = "none";
        arrow.innerText = "▼";
    } else {
        content.style.display = "block";
        arrow.innerText = "▲";
    }
}

function updateLabelInput() {
    const layanan = document.getElementById('jenisLayanan').value;
    const label = document.getElementById('labelArgo');
    const input = document.getElementById('argoInput');
    
    if (layanan === 'standard') {
        label.innerText = "Net Masuk Dompet (Rp):";
        input.placeholder = "Contoh: 11200";
    } else {
        label.innerText = "Argo Aplikasi (Rp):";
        input.placeholder = "Contoh: 10200";
    }
}

function navigasiTanggal(hari) {
    const inputTanggal = document.getElementById('tanggalTrip');
    let tanggalSemula = new Date(inputTanggal.value);
    if (isNaN(tanggalSemula.getTime())) tanggalSemula = new Date();
    tanggalSemula.setDate(tanggalSemula.getDate() + hari);
    inputTanggal.value = tanggalSemula.toISOString().slice(0,10);
    if(modeTampilan === 'hari') prosesDanTampilkan();
}

function simpanPotonganManual() {
    const tanggalTerpilih = document.getElementById('tanggalTrip').value;
    const val = parseInt(document.getElementById('potonganAsliInput').value) || 0;
    if(val >= 0) {
        potonganHematManual[tanggalTerpilih] = val;
        localStorage.setItem('potonganHematManualOjol', JSON.stringify(potonganHematManual));
        latihDatabaseKecerdasan();
        prosesDanTampilkan();
    }
}

function tambahTrip() {
    const inputTanggal = document.getElementById('tanggalTrip').value;
    const inputArgo = document.getElementById('argoInput');
    const layanan = document.getElementById('jenisLayanan').value;
    const levelSaatIni = document.getElementById('levelDriverInput').value;
    const nilaiInput = parseInt(inputArgo.value);

    if (!inputTanggal) return alert("Pilih tanggal terlebih dahulu!");
    if (isNaN(nilaiInput) || nilaiInput <= 0) return alert("Masukkan nominal angka argo!");

    let gross = 0, potongan = 0, net = 0;

    if (layanan === 'standard') {
        net = nilaiInput;
        gross = Math.round((net * (100 / 92)) / 100) * 100; 
        potongan = gross - net; 
    } else {
        gross = nilaiInput;
        potongan = 0; 
        net = gross;
    }

    if (idDataSedangDiedit !== null) {
        masterData = masterData.map(item => {
            if (item.id === idDataSedangDiedit) {
                return { ...item, tanggal: inputTanggal, layanan, level_driver: levelSaatIni, gross, potongan, net };
            }
            return item;
        });
        idDataSedangDiedit = null;
        document.getElementById('btnSubmitTrip').innerText = "Tambah Trip Baru";
    } else {
        masterData.push({
            id: Date.now() + Math.random(),
            tanggal: inputTanggal,
            layanan,
            level_driver: levelSaatIni,
            gross,
            potongan,
            net
        });
    }

    localStorage.setItem('masterDataOjol', JSON.stringify(masterData));
    latihDatabaseKecerdasan();
    inputArgo.value = '';
    inputArgo.focus();
    gantiTampilan('hari');
}

function toggleDropdown(event, idUnik) {
    event.stopPropagation();
    tutupSemuaDropdown();
    const menu = document.getElementById(`drop-${idUnik}`);
    if (menu) menu.style.display = "block";
}

function tutupSemuaDropdown() {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = "none");
}

function editBaris(idUnik) {
    const item = masterData.find(t => t.id === idUnik);
    if (!item) return;
    idDataSedangDiedit = idUnik;
    document.getElementById('tanggalTrip').value = item.tanggal;
    document.getElementById('jenisLayanan').value = item.layanan;
    if(item.level_driver) document.getElementById('levelDriverInput').value = item.level_driver;
    updateLabelInput();
    document.getElementById('argoInput').value = item.layanan === 'standard' ? item.net : item.gross;
    document.getElementById('btnSubmitTrip').innerText = "💾 Simpan Perubahan";
    document.getElementById('argoInput').focus();
}

function hapusBaris(idUnik) {
    if (confirm("Hapus data trip ini?")) {
        masterData = masterData.filter(item => item.id !== idUnik);
        localStorage.setItem('masterDataOjol', JSON.stringify(masterData));
        latihDatabaseKecerdasan();
        prosesDanTampilkan();
    }
}

function gantiTampilan(mode) {
    modeTampilan = mode;
    document.querySelectorAll('.tab-btn-modern').forEach(btn => btn.classList.remove('active'));
    if(mode === 'hari') document.getElementById('tabHari').classList.add('active');
    if(mode === 'minggu') document.getElementById('tabMinggu').classList.add('active');
    if(mode === 'bulan') document.getElementById('tabBulan').classList.add('active');
    prosesDanTampilkan();
}

function getAwalMinggu(d) {
    let date = new Date(d);
    let day = date.getDay();
    let diff = date.getDate() - day + (day == 0 ? -6 : 1); 
    return new Date(date.setDate(diff)).toISOString().slice(0,10);
}

function latihDatabaseKecerdasan() {
    const levelSaatIni = document.getElementById('levelDriverInput').value;
    let sampelHariLalu = Object.keys(potonganHematManual);
    let totalHariValidasi = 0;
    let hariArgoMinBebasPotongan = 0;

    sampelHariLalu.forEach(tgl => {
        let tripHematHariItu = masterData.filter(item => item.tanggal === tgl && item.layanan === 'hemat');
        let hanyaArgoMinimum = tripHematHariItu.length > 0 && tripHematHariItu.every(item => item.gross <= 10200);
        let potonganAsliHariItu = potonganHematManual[tgl] || 0;

        if (hanyaArgoMinimum) {
            totalHariValidasi++;
            if (potonganAsliHariItu === 0) hariArgoMinBebasPotongan++;
        }
    });

    if (totalHariValidasi > 0) {
        databasePolaLevel[levelSaatIni].argoMinDipotong = (hariArgoMinBebasPotongan / totalHariValidasi) < 0.5;
        databasePolaLevel[levelSaatIni].totalSampelHari = totalHariValidasi;
    } else {
        databasePolaLevel[levelSaatIni].argoMinDipotong = (levelSaatIni !== 'jawara');
        databasePolaLevel[levelSaatIni].totalSampelHari = 0;
    }
    localStorage.setItem('databasePolaLevelOjol', JSON.stringify(databasePolaLevel));
}

function prosesDanTampilkan() {
    const tbody = document.querySelector('#tabelTrip tbody');
    const header = document.getElementById('headerTabel');
    const boxPotongan = document.getElementById('boxPotonganAsliHemat');
    const inputPlaceholderHemat = document.getElementById('potonganAsliInput');
    const boxSaran = document.getElementById('boxRekomendasiArgo');
    const isiSaran = document.getElementById('isiRekomendasi');
    tbody.innerHTML = '';

    let totalGross = 0, totalNet = 0, totalOrder = 0;
    let totalPotonganStandard = 0, totalPotonganHemat = 0;
    
    const tanggalTerpilih = document.getElementById('tanggalTrip').value;
    const levelDriver = document.getElementById('levelDriverInput').value;
    let polaArgoMinDipotong = databasePolaLevel[levelDriver]?.argoMinDipotong;

    if (modeTampilan === 'hari') {
        boxPotongan.style.display = "flex";
        boxSaran.style.display = "block"; 
        header.innerHTML = `<th>No</th><th>Layanan</th><th>Argo</th><th>Potongan</th><th>Net</th><th>Aksi</th>`;
        document.getElementById('judulRingkasan').innerText = `Tanggal: ${tanggalTerpilih}`;
        
        if (levelDriver === 'jawara' || !polaArgoMinDipotong) {
            isiSaran.innerHTML = `Akun terdeteksi <b style='color:var(--color-grab)'>JAWARA</b> (Bebas potongan penyesuaian).<br>` + 
                                 `🎯 Sikat habis orderan <b>GrabBike Hemat Argo Minimum (Rp 10.200)</b> untuk efisiensi bahan bakar dan perolehan ritase instan tanpa pangkasan komisi.`;
        } else {
            isiSaran.innerHTML = `Akun terdeteksi terkena penyesuaian komisi pada tarif dasar.<br>` + 
                                 `⚠️ Batasi mengambil Hemat minimum jika area macet. Targetkan orderan <b>Hemat Rp 15.000 ke atas</b> atau maksimalkan <b>Bike Standard</b> untuk menjaga rasio profit harian.`;
        }

        let dataHariIni = masterData.filter(item => item.tanggal === tanggalTerpilih);
        totalOrder = dataHariIni.length;
        
        let totalGrossHematHariIni = 0;
        let prediksiPotonganHematOtomatis = 0;
        let totalPrediksiArgoBesarSaja = 0;

        dataHariIni.forEach((trip) => {
            if (trip.layanan === 'hemat') {
                totalGrossHematHariIni += trip.gross;
                if (trip.gross <= 10200 && !polaArgoMinDipotong) {
                    trip.prediksiPotonganItem = 0; 
                } else {
                    let hitungPotonganMentah = trip.gross * 0.08;
                    trip.prediksiPotonganItem = Math.floor(hitungPotonganMentah / 100) * 100; 
                    totalPrediksiArgoBesarSaja += trip.prediksiPotonganItem;
                }
                prediksiPotonganHematOtomatis += trip.prediksiPotonganItem;
            }
        });

        if (prediksiPotonganHematOtomatis > 0) {
            prediksiPotonganHematOtomatis = Math.max(0, prediksiPotonganHematOtomatis - 100);
        }

        let inputManualHariIni = potonganHematManual[tanggalTerpilih] || 0;
        let rasioPotonganHematManual = totalGrossHematHariIni > 0 ? (inputManualHariIni / totalGrossHematHariIni) : 0;
        let kunciArgo
