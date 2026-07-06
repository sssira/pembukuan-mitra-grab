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
    document.getElementById('tanggalTrip').value = new Date().toISOString().slice(0,10);

    if (localStorage.getItem('masterDataOjol')) masterData = JSON.parse(localStorage.getItem('masterDataOjol'));
    if (localStorage.getItem('potonganHematManualOjol')) potonganHematManual = JSON.parse(localStorage.getItem('potonganHematManualOjol'));
    if (localStorage.getItem('databasePolaLevelOjol')) databasePolaLevel = JSON.parse(localStorage.getItem('databasePolaLevelOjol'));

    // Tambahkan event listener agar setiap ganti tanggal otomatis render ulang
    document.getElementById('tanggalTrip').addEventListener('change', prosesDanTampilkan);

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
    prosesDanTampilkan();
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
        boxPotongan.style.display = "block";
        boxSaran.style.display = "block"; 
        header.innerHTML = `<th>No</th><th>Layanan</th><th>Argo</th><th>Potongan</th><th>Net</th><th>Aksi</th>`;
        document.getElementById('judulRingkasan').innerText = `Tanggal: ${tanggalTerpilih}`;
        
        if (levelDriver === 'jawara' || !polaArgoMinDipotong) {
            isiSaran.innerHTML = `Akun terdeteksi <b style='color:var(--color-grab)'>JAWARA</b> (Bebas potongan penyesuaian).<br>` + 
                                 `🎯 Sikat habis orderan <b>GrabBike Hemat Argo Minimum (Rp 10.200)</b> untuk efisiensi bahan bakar tanpa pangkasan komisi.`;
        } else {
            isiSaran.innerHTML = `Akun terdeteksi terkena penyesuaian komisi pada tarif dasar.<br>` + 
                                 `⚠️ Batasi mengambil Hemat minimum jika area macet. Targetkan orderan <b>Hemat Rp 15.000 ke atas</b> atau maksimalkan <b>Bike Standard</b>.`;
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
        let kunciArgoMinimumAman = (rasioPotonganHematManual <= 0.08);

        dataHariIni.forEach((trip, index) => {
            totalGross += trip.gross;
            let potBaris = 0;
            let netBaris = 0;

            if (trip.layanan === 'standard') {
                trip.prediksiPotonganItem = trip.potongan;
                totalPotonganStandard += trip.potongan;
                potBaris = trip.potongan;
                netBaris = trip.net;
            } else {
                if (potonganHematManual[tanggalTerpilih] !== undefined && potonganHematManual[tanggalTerpilih] !== 0) {
                    let totalManual = potonganHematManual[tanggalTerpilih];
                    
                    if (kunciArgoMinimumAman) {
                        if (trip.gross <= 10200) {
                            potBaris = 0;
                        } else {
                            let hitungPotonganSaja = totalPrediksiArgoBesarSaja > 0 ? (trip.prediksiPotonganItem / totalPrediksiArgoBesarSaja) * totalManual : 0;
                            potBaris = Math.round(hitungPotonganSaja / 100) * 100;
                        }
                    } else {
                        let hitungPotonganSaja = prediksiPotonganHematOtomatis > 0 ? (trip.prediksiPotonganItem / prediksiPotonganHematOtomatis) * totalManual : 0;
                        potBaris = Math.round(hitungPotonganSaja / 100) * 100;
                    }
                } else {
                    potBaris = trip.prediksiPotonganItem;
                }
                netBaris = trip.gross - potBaris;
                trip.net = netBaris;
                trip.potongan = potBaris;
            }

            let lencanaLayanan = trip.layanan === 'standard' ? `<span class="badge bg-standard">Standard</span>` : `<span class="badge bg-hemat">Hemat</span>`;
            let argoTampil = trip.layanan === 'standard' ? Math.floor(trip.gross / 100) * 100 : trip.gross;
            let potBarisTampil = trip.layanan === 'standard' ? argoTampil - trip.net : potBaris;

            tbody.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${lencanaLayanan}</td>
                <td>Rp ${Math.floor(argoTampil).toLocaleString('id-ID')}</td>
                <td class="text-danger">Rp ${Math.floor(potBarisTampil).toLocaleString('id-ID')}</td>
                <td class="text-success font-bold">Rp ${Math.floor(netBaris).toLocaleString('id-ID')}</td>
                <td class="action-cell">
                    <button class="btn-gear" onclick="toggleDropdown(event, ${trip.id})">⚙️</button>
                    <div class="dropdown-menu" id="drop-${trip.id}">
                        <button onclick="editBaris(${trip.id})">Ubah</button>
                        <button class="opt-delete" onclick="hapusBaris(${trip.id})">Hapus</button>
                    </div>
                </td>
            </tr>`;
        });

        inputPlaceholderHemat.placeholder = `Prediksi otomatis: Rp ${prediksiPotonganHematOtomatis.toLocaleString('id-ID')}`;
        document.getElementById('potonganAsliInput').value = potonganHematManual[tanggalTerpilih] || '';

        let labelHematStatus = potonganHematManual[tanggalTerpilih] !== undefined && potonganHematManual[tanggalTerpilih] !== 0 ? " (Asli)" : " (Prediksi)";
        totalPotonganHemat = potonganHematManual[tanggalTerpilih] !== undefined && potonganHematManual[tanggalTerpilih] !== 0 ? potonganHematManual[tanggalTerpilih] : prediksiPotonganHematOtomatis;
        
        let totalPotonganKombinasi = totalPotonganStandard + totalPotonganHemat;
        totalNet = totalGross - totalPotonganKombinasi;

        let persenHemat = totalGross > 0 ? ((totalPotonganHemat / totalGross) * 100).toFixed(1) : "0.0";
        let persenTotal = totalGross > 0 ? ((totalPotonganKombinasi / totalGross) * 100).toFixed(1) : "0.0";

        document.getElementById('sumPotonganStandard').innerText = `Rp ${Math.floor(totalPotonganStandard).toLocaleString('id-ID')}`;
        document.getElementById('sumPotonganHemat').innerText = `Rp ${Math.floor(totalPotonganHemat).toLocaleString('id-ID')}${labelHematStatus} (${persenHemat}%)`;
        document.getElementById('sumPotonganTotal').innerText = `Rp ${Math.floor(totalPotonganKombinasi).toLocaleString('id-ID')} (${persenTotal}%)`;

    } else {
        boxPotongan.style.display = "none"; 
        boxSaran.style.display = "none"; 
        if (modeTampilan === 'minggu') {
            header.innerHTML = `<th>Senin</th><th>Order</th><th>Kotor (Gross)</th><th>Potongan</th><th>Bersih (Net)</th>`;
            let kelompokMingguan = {};
            masterData.forEach(item => {
                let senin = getAwalMinggu(item.tanggal);
                if (!kelompokMingguan[senin]) kelompokMingguan[senin] = { order: 0, gross: 0, potStd: 0, potHmt: 0 };
                kelompokMingguan[senin].order += 1;
                kelompokMingguan[senin].gross += item.gross;
                if(item.layanan === 'standard') {
                    kelompokMingguan[senin].potStd += item.potongan;
                } else {
                    let potItemPrediksi = item.potongan || item.prediksiPotonganItem || 0;
                    kelompokMingguan[senin].potHmt += (potonganHematManual[item.tanggal] !== undefined) ? 0 : potItemPrediksi;
                }
            });
            Object.keys(potonganHematManual).forEach(tgl => {
                let senin = getAwalMinggu(tgl);
                if (kelompokMingguan[senin]) kelompokMingguan[senin].potHmt += potonganHematManual[tgl];
            });
            Object.keys(kelompokMingguan).sort().reverse().forEach(minggu => {
                let k = kelompokMingguan[minggu];
                let totalPotRow = k.potStd + k.potHmt;
                totalGross += k.gross; totalPotonganStandard += k.potStd; totalPotonganHemat += k.potHmt; totalOrder += k.order;
                tbody.innerHTML += `<tr><td>${minggu}</td><td>${k.order}</td><td>Rp ${Math.floor(k.gross).toLocaleString('id-ID')}</td><td class="text-danger">Rp ${Math.floor(totalPotRow).toLocaleString('id-ID')}</td><td class="text-success font-bold">Rp ${Math.floor(k.gross - totalPotRow).toLocaleString('id-ID')}</td></tr>`;
            });
        } else if (modeTampilan === 'bulan') {
            header.innerHTML = `<th>Bulan</th><th>Order</th><th>Kotor (Gross)</th><th>Potongan</th><th>Bersih (Net)</th>`;
            let kelompokBulanan = {};
            masterData.forEach(item => {
                let bulan = item.tanggal.substring(0, 7);
                if (!kelompokBulanan[bulan]) kelompokBulanan[bulan] = { order: 0, gross: 0, potStd: 0, potHmt: 0 };
                kelompokBulanan[bulan].order += 1;
                kelompokBulanan[bulan].gross += item.gross;
                if(item.layanan === 'standard') {
                    kelompokBulanan[bulan].potStd += item.potongan;
                } else {
                    let potItemPrediksi = item.potongan || item.prediksiPotonganItem || 0;
                    kelompokBulanan[bulan].potHmt += (potonganHematManual[item.tanggal] !== undefined) ? 0 : potItemPrediksi;
                }
            });
            Object.keys(potonganHematManual).forEach(tgl => {
                let bulan = tgl.substring(0, 7);
                if (kelompokBulanan[bulan]) kelompokBulanan[bulan].potHmt += potonganHematManual[tgl];
            });
            Object.keys(kelompokBulanan).sort().reverse().forEach(bln => {
                let b = kelompokBulanan[bln];
                let totalPotRow = b.potStd + b.potHmt;
                totalGross += b.gross; totalPotonganStandard += b.potStd; totalPotonganHemat += b.potHmt; totalOrder += b.order;
                tbody.innerHTML += `<tr><td>${bln}</td><td>${b.order}</td><td>Rp ${Math.floor(b.gross).toLocaleString('id-ID')}</td><td class="text-danger">Rp ${Math.floor(totalPotRow).toLocaleString('id-ID')}</td><td class="text-success font-bold">Rp ${Math.floor(b.gross - totalPotRow).toLocaleString('id-ID')}</td></tr>`;
            });
        }
        let totalPotKombinasiSeluruh = totalPotonganStandard + totalPotonganHemat;
        totalNet = totalGross - totalPotKombinasiSeluruh;
        
        let persenTotal = totalGross > 0 ? ((totalPotKombinasiSeluruh / totalGross) * 100).toFixed(1) : "0.0";
        document.getElementById('sumPotonganTotal').innerText = `Rp ${Math.floor(totalPotKombinasiSeluruh).toLocaleString('id-ID')} (${persenTotal}%)`;
        document.getElementById('judulRingkasan').innerText = modeTampilan === 'minggu' ? 'Rekap Mingguan' : 'Rekap Bulanan';
    }

    // UPDATE: Render nilai ke elemen header statistik global
    document.getElementById('sumNet').innerText = `Rp ${Math.floor(totalNet).toLocaleString('id-ID')}`;
    document.getElementById('sumGross').innerText = `Rp ${Math.floor(totalGross).toLocaleString('id-ID')}`;
    document.getElementById('totalOrder').innerText = totalOrder;
}

// ================= UTILITAS BACKUP & MANAGEMENT DATA =================
function exportDataKeJSON() {
    let dataBackup = { masterData, potonganHematManual, databasePolaLevel };
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataBackup));
    let downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_ojol_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function pemicuPilihFileJSON() {
    document.getElementById('fileJSONInput').click();
}

function importDataDariJSON(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            let parsed = JSON.parse(e.target.result);
            if (parsed.masterData) masterData = parsed.masterData;
            if (parsed.potonganHematManual) potonganHematManual = parsed.potonganHematManual;
            if (parsed.databasePolaLevel) databasePolaLevel = parsed.databasePolaLevel;
            
            localStorage.setItem('masterDataOjol', JSON.stringify(masterData));
            localStorage.setItem('potonganHematManualOjol', JSON.stringify(potonganHematManual));
            localStorage.setItem('databasePolaLevelOjol', JSON.stringify(databasePolaLevel));
            
            alert("Data berhasil direstore!");
            prosesDanTampilkan();
        } catch(err) {
            alert("File JSON tidak valid!");
        }
    }
    fileReader.readAsText(event.target.files[0]);
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Tanggal,Layanan,Level,Gross,Potongan,Net\n";
    masterData.forEach(item => {
        csvContent += `${item.tanggal},${item.layanan},${item.level_driver || '-'},${item.gross},${item.potongan},${item.net}\n`;
    });
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pembukuan_ojol_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function resetData() {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh data permanen? Tindakan ini tidak bisa dibatalkan.")) {
        localStorage.clear();
        masterData = [];
        potonganHematManual = {};
        alert("Seluruh database telah dibersihkan.");
        window.location.reload();
    }
}
