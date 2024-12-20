const Guru = require("../models/GuruModel");
const PembayaranGaji = require("../models/PembayaranGajiModel");
const Sequelize = require('sequelize'); 

// Create Siswa for SMA
exports.createGuru = async (req, res) => {
    const { npsn, nama_guru, tahun_pelajaran, gaji_guru } = req.body;

    try {
        // Cek apakah siswa dengan NISN yang sama sudah ada di kelas yang diinputkan
        const existingGuru = await Guru.findOne({
            where: {
                nama_guru: nama_guru,
                npsn: npsn,
                tahun_pelajaran: tahun_pelajaran
            }
        });

        if (existingGuru) {
            return res.status(409).json({ success: false, msg: "Guru dengan NPSN ini sudah ada yang diinputkan untuk tahun pelajaran yang sama." });
        }

        const guruBaru = await Guru.create({
            npsn: npsn,
            nama_guru: nama_guru,
            tahun_pelajaran: tahun_pelajaran,
            gaji_guru: gaji_guru,
        });

        // Setelah siswa baru dibuat, tambahkan data ke tabel Pembayaran
        await PembayaranGaji.create({
            id_guru: guruBaru.id, 
            tahun_pelajaran: tahun_pelajaran
            // Tambahkan kolom lain yang diperlukan dari tabel Pembayaran
        });
        
        res.status(201).json({ success: true, msg: "Simpan Data Guru Berhasil" });
    } catch (error) {
        console.error("Error in create Guru:", error);
        res.status(400).json({ msg: "Gagal Simpan Data Guru", error: error.message });
    }
};

// Get All Siswa
exports.getAllGuru = async (req, res) => {
    try {
        const guru = await Guru.findAll();
        res.status(200).json(guru);
    } catch (error) {
        console.error("Error in getAllGuru:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Guru", error: error.message });
    }
}

// Get Siswa by NPSN Dan Kelas
exports.getGuruByNpsn = async (req, res) => {
    const { npsn } = req.params;

    try {
        const guru = await Guru.findAll({
            where: {
                npsn: npsn,
            }
        });
        
        if (!guru.length) {
            return res.status(404).json({ msg: "Guru dengan NPSN  ini tidak ditemukan" });
        }
        
        res.status(200).json(guru);
    } catch (error) {
        console.error("Error in getGuruByNpsn:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Guru", error: error.message });
    }
};


// Get Siswa by NISN
exports.getGuruById = async (req, res) => {
    const { id } = req.params;

    try {
        const guru = await Guru.findOne({ where: { id: id } });
        if (!guru) {
            return res.status(404).json({ msg: "Guru dengan id ini tidak ditemukan" });
        }
        res.status(200).json(guru);
    } catch (error) {
        console.error("Error in getGuruByid:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Guru", error: error.message });
    }
}

// Update Siswa 
exports.updateGuru = async (req, res) => {
    const { nama_guru, gaji_guru } = req.body;
    const {id} = req.params;

    try {
        // Cari Guru berdasarkan nisn, tahun_pelajaran, kelas, dan npsn
        const guru = await Guru.findOne({ 
            where: {  
                id: id
            }
        });

        // Jika Guru tidak ditemukan, kirimkan respon 404
        if (!guru) {
            return res.status(404).json({ msg: "Guru tidak ditemukan" });
        }

        // Perbarui data Guru
        await guru.update({
            nama_guru: nama_guru,
            gaji_guru: gaji_guru,
        });
        // Kirimkan respon sukses
        res.status(200).json({ success: true, msg: "Update Data Guru Berhasil" });
    } catch (error) {
        console.error("Error in updateGuru:", error);
        res.status(400).json({ msg: "Gagal Update Data Guru", error: error.message });
    }
};


// Get Unique Tahun Pelajaran
exports.getTahunPelajaran = async (req, res) => {
    try {
        // Mengambil semua tahun pelajaran unik dari tabel Siswa
        const tahunPelajaran = await Guru.findAll({
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

exports.deleteGuru = async (req, res) => {
    const { id } = req.params;

    try {
        // Hapus data dari tabel pembayaran_gaji terlebih dahulu
        await PembayaranGaji.destroy({
            where: {
                id_guru: id
            }
        });

        // Hapus data dari tabel guru setelah pembayaran gaji terhapus
        await Guru.destroy({
            where: {
                id: id
            }
        });

        res.status(200).json({ success: true, msg: "Data guru dan pembayaran gaji berhasil dihapus." });
    } catch (error) {
        console.error("Error in deleteGuru:", error);
        res.status(500).json({ msg: "Gagal menghapus data guru.", error: error.message });
    }
};



