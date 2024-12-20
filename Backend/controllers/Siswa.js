const Siswa = require("../models/SiswaModel");
const Pembayaran = require("../models/PembayaranModel");
const Sequelize = require('sequelize'); 

exports.Home = async (req, res) => {
    res.send('Welcome to Yayasan Muhammadiyah Tanjungpinang server!');
}

// Create Siswa for SMA
exports.createSiswa = async (req, res) => {
    const { npsn, nisn, nama_siswa, kelas, tahun_pelajaran, nama_orangtua, no_hp_orangtua, biaya_spp } = req.body;

    try {
        // Cek apakah siswa dengan NISN yang sama sudah ada di kelas yang diinputkan
        const existingSiswa = await Siswa.findOne({
            where: {
                nisn: nisn,
                kelas: kelas,
                npsn: npsn,
                tahun_pelajaran: tahun_pelajaran
            }
        });

        if (existingSiswa) {
            return res.status(409).json({ success: false, msg: "Siswa dengan NISN ini sudah ada di kelas yang diinputkan untuk tahun pelajaran yang sama." });
        }

        const siswaBaru = await Siswa.create({
            npsn: npsn,
            nisn: nisn,
            nama_siswa: nama_siswa,
            kelas: kelas,
            tahun_pelajaran: tahun_pelajaran,
            nama_orangtua: nama_orangtua,
            no_hp_orangtua: no_hp_orangtua,
            biaya_spp: biaya_spp,
        });

        // Setelah siswa baru dibuat, tambahkan data ke tabel Pembayaran
        await Pembayaran.create({
            id_siswa: siswaBaru.id, // Ambil id_siswa dari data siswa baru
            nisn: nisn,
            tahun_pelajaran: tahun_pelajaran
            // Tambahkan kolom lain yang diperlukan dari tabel Pembayaran
        });
        
        res.status(201).json({ success: true, msg: "Simpan Data Siswa Berhasil" });
    } catch (error) {
        console.error("Error in create Siswa:", error);
        res.status(400).json({ msg: "Gagal Simpan Data Siswa", error: error.message });
    }
};

// Get All Siswa
exports.getAllSiswa = async (req, res) => {
    try {
        const siswa = await Siswa.findAll();
        res.status(200).json(siswa);
    } catch (error) {
        console.error("Error in getAllSiswa:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Siswa", error: error.message });
    }
}

// Get Siswa by NPSN Dan Kelas
exports.getSiswaByNpsnAndKelas = async (req, res) => {
    const { npsn, kelas } = req.params;

    try {
        const siswa = await Siswa.findAll({
            where: {
                npsn: npsn,
                kelas: kelas
            }
        });
        
        if (!siswa.length) {
            return res.status(404).json({ msg: "Siswa dengan NPSN dan kelas ini tidak ditemukan" });
        }
        
        res.status(200).json(siswa);
    } catch (error) {
        console.error("Error in getSiswaByNpsnAndKelas:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Siswa", error: error.message });
    }
};

// Get Siswa by NPSN 
exports.getSiswaByNpsn = async (req, res) => {
    const { npsn } = req.params;

    try {
        const siswa = await Siswa.findAll({
            where: {
                npsn: npsn,
            }
        });
        
        if (!siswa.length) {
            return res.status(404).json({ msg: "Siswa dengan NPSN  ini tidak ditemukan" });
        }
        
        res.status(200).json(siswa);
    } catch (error) {
        console.error("Error in getSiswaByNpsn:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Siswa", error: error.message });
    }
};


// Get Siswa by NISN
exports.getSiswaByNisn = async (req, res) => {
    const { nisn } = req.params;

    try {
        const siswa = await Siswa.findOne({ where: { nisn: nisn } });
        if (!siswa) {
            return res.status(404).json({ msg: "Siswa dengan NISN ini tidak ditemukan" });
        }
        res.status(200).json(siswa);
    } catch (error) {
        console.error("Error in getSiswaByNisn:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Siswa", error: error.message });
    }
}

// Update Siswa 
exports.updateSiswa = async (req, res) => {
    const { nisn, nama_siswa, kelas, tahun_pelajaran, nama_orangtua, no_hp_orangtua, biaya_spp, npsn } = req.body;

    try {
        // Cari siswa berdasarkan nisn, tahun_pelajaran, kelas, dan npsn
        const siswa = await Siswa.findOne({ 
            where: { 
                nisn: nisn, 
                tahun_pelajaran: tahun_pelajaran, 
                kelas: kelas,
                npsn: npsn
            }
        });

        // Jika siswa tidak ditemukan, kirimkan respon 404
        if (!siswa) {
            return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }

        // Perbarui data siswa
        await siswa.update({
            nama_siswa: nama_siswa,
            kelas: kelas,
            nama_orangtua: nama_orangtua,
            no_hp_orangtua: no_hp_orangtua,
            biaya_spp: biaya_spp,
        });

         // Setelah siswa baru dibuat, tambahkan data ke tabel Pembayaran
        // await Pembayaran.create({
        //     id_siswa: siswaBaru.id, // Ambil id_siswa dari data siswa baru
        //     nisn: nisn,
        //     tahun_pelajaran: tahun_pelajaran
        //     // Tambahkan kolom lain yang diperlukan dari tabel Pembayaran
        // });
        
        // Kirimkan respon sukses
        res.status(200).json({ success: true, msg: "Update Data Siswa Berhasil" });
    } catch (error) {
        console.error("Error in updateSiswa:", error);
        res.status(400).json({ msg: "Gagal Update Data Siswa", error: error.message });
    }
};


// Get Unique Tahun Pelajaran
exports.getTahunPelajaran = async (req, res) => {
    try {
        // Mengambil semua tahun pelajaran unik dari tabel Siswa
        const tahunPelajaran = await Siswa.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('tahun_pelajaran')), 'tahun_pelajaran']],
            order: [['tahun_pelajaran', 'ASC']]
        });

        // Memeriksa jika data ditemukan
        if (!tahunPelajaran.length) {
            return res.status(404).json({ msg: "Tahun Pelajaran tidak ditemukan" });
        }

        // Mengirimkan data tahun pelajaran sebagai respon
        res.status(200).json(tahunPelajaran.map(item => item.tahun_pelajaran));
    } catch (error) {
        console.error("Error in getTahunPelajaran:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Tahun Pelajaran", error: error.message });
    }
};

// Delete Siswa
exports.deleteSiswa = async (req, res) => {
    const { nisn, tahun_pelajaran, npsn, kelas } = req.params;

    try {
        // Dekode tahun_pelajaran
        const decodedTahunPelajaran = decodeURIComponent(tahun_pelajaran);

        // Cari siswa berdasarkan nisn, tahun_pelajaran, kelas, dan npsn
        const siswa = await Siswa.findOne({
            where: {
                nisn: nisn,
                tahun_pelajaran: decodedTahunPelajaran,
                kelas: kelas,
                npsn: npsn
            }
        });

        if (!siswa) {
            return res.status(404).json({ msg: "Siswa tidak ditemukan" });
        }

        // Hapus data siswa
        await siswa.destroy();

        // Kirimkan respon sukses
        res.status(200).json({ success: true, msg: "Hapus Data Siswa Berhasil" });
    } catch (error) {
        console.error("Error in deleteSiswa:", error);
        res.status(400).json({ msg: "Gagal Hapus Data Siswa", error: error.message });
    }
};



