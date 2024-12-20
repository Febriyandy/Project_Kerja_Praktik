const Siswa = require("../models/SiswaModel");
const Pembayaran = require("../models/PembayaranModel");
const Sekolah = require("../models/SekolahModel"); 
const Sequelize = require('sequelize'); 

exports.getPembayaranByNpsnAndKelas = async (req, res) => {
    const { kelas } = req.params;

    try {
        // Cari data siswa dengan join ke tabel Sekolah untuk mendapatkan tingkat_sekolah
        const siswa = await Siswa.findAll({
            where: {
                kelas: kelas,
            },
            attributes: ['id', 'nisn', 'nama_siswa', 'biaya_spp', 'nama_orangtua', 'no_hp_orangtua'],
            include: [{
                model: Sekolah,
                attributes: ['tingkat_sekolah'], // Hanya mengambil tingkat_sekolah
                as: 'sekolah' // Pastikan alias sesuai dengan yang digunakan di model Siswa
            }]
        });

        if (!siswa.length) {
            return res.status(404).json({ msg: "Data siswa untuk kelas ini tidak ditemukan" });
        }

        // Ambil ID siswa
        const siswaIds = siswa.map(s => s.id);

        // Cari data pembayaran berdasarkan id siswa
        const pembayaran = await Pembayaran.findAll({
            where: {
                id_siswa: siswaIds
            },
            attributes: [
                'id_siswa',
                'tahun_pelajaran',
                'januari',
                'februari',
                'maret',
                'april',
                'mei',
                'juni',
                'juli',
                'agustus',
                'september',
                'oktober',
                'november',
                'desember'
            ]
        });

        // Map data pembayaran dan siswa
        const responseData = siswa.map(s => {
            const pembayaranSiswa = pembayaran.find(p => p.id_siswa === s.id) || {};
            return {
                id_siswa: s.id, // Tambahkan id_siswa
                nisn: s.nisn,
                nama_siswa: s.nama_siswa,
                biaya_spp: s.biaya_spp,
                nama_orangtua: s.nama_orangtua,
                no_hp_orangtua: s.no_hp_orangtua,
                tingkat_sekolah: s.sekolah?.tingkat_sekolah || null, // Tambahkan tingkat_sekolah
                tahun_pelajaran: pembayaranSiswa.tahun_pelajaran || null,
                januari: pembayaranSiswa.januari || null,
                februari: pembayaranSiswa.februari || null,
                maret: pembayaranSiswa.maret || null,
                april: pembayaranSiswa.april || null,
                mei: pembayaranSiswa.mei || null,
                juni: pembayaranSiswa.juni || null,
                juli: pembayaranSiswa.juli || null,
                agustus: pembayaranSiswa.agustus || null,
                september: pembayaranSiswa.september || null,
                oktober: pembayaranSiswa.oktober || null,
                november: pembayaranSiswa.november || null,
                desember: pembayaranSiswa.desember || null,
            };
        });

        // Kirimkan respon dengan data yang dihasilkan
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in getPembayaranByNpsnAndKelas:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Pembayaran", error: error.message });
    }
};


exports.UpdatePembayaran = async (req, res) => {
    const { id } = req.params;
    const { tahun_pelajaran, bulan, biaya_spp } = req.body;

    try {
        const siswa = await Siswa.findOne({ where: { id } });

        if (!siswa) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }

        const updateData = {};
        updateData[bulan] = biaya_spp;

        const [updatedRows] = await Pembayaran.update(updateData, {
            where: {
                id_siswa: siswa.id,
                tahun_pelajaran: tahun_pelajaran
            }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan atau tidak ada perubahan' });
        }


        res.json({ message: 'Pembayaran berhasil diupdate dan pesan WhatsApp telah dikirim' });
    } catch (error) {
        console.error("Error updating pembayaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate pembayaran', error });
    }
};

exports.BatalPembayaran = async (req, res) => {
    const { id } = req.params;
    const { tahun_pelajaran, bulan} = req.body;

    try {
        const siswa = await Siswa.findOne({ where: { id } });

        if (!siswa) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan' });
        }

        const updateData = {};
        updateData[bulan] = 0;

        const [updatedRows] = await Pembayaran.update(updateData, {
            where: {
                id_siswa: siswa.id,
                tahun_pelajaran: tahun_pelajaran
            }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan atau tidak ada perubahan' });
        }


        res.json({ message: 'Pembatalan pembayaran berhasil' });
    } catch (error) {
        console.error("Error updating pembayaran:", error);
        res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate pembayaran', error });
    }
};

exports.getAllPembayaran = async (req, res) => {
    try {
        // Cari semua data pembayaran terlebih dahulu
        const pembayaran = await Pembayaran.findAll({
            attributes: [
                'id_siswa',
                'tahun_pelajaran',
                'januari',
                'februari',
                'maret',
                'april',
                'mei',
                'juni',
                'juli',
                'agustus',
                'september',
                'oktober',
                'november',
                'desember'
            ]
        });

        if (!pembayaran.length) {
            return res.status(404).json({ msg: "Data pembayaran tidak ditemukan" });
        }

        // Ambil ID siswa dari data pembayaran
        const siswaIds = pembayaran.map(p => p.id_siswa);

        // Cari data siswa berdasarkan id siswa dari tabel pembayaran
        const siswa = await Siswa.findAll({
            where: {
                id: siswaIds
            },
            attributes: ['id', 'nisn', 'nama_siswa', 'biaya_spp', 'kelas'],
            include: [{
                model: Sekolah,
                attributes: ['tingkat_sekolah'],
                as: 'sekolah'
            }]
        });

        // Map data pembayaran dan siswa
        const responseData = pembayaran.map(p => {
            const siswaData = siswa.find(s => s.id === p.id_siswa) || {};
            return {
                id_siswa: siswaData.id || p.id_siswa,
                nisn: siswaData.nisn || null,
                nama_siswa: siswaData.nama_siswa || null,
                biaya_spp: siswaData.biaya_spp || null,
                kelas: siswaData.kelas || null,
                tingkat_sekolah: siswaData.sekolah?.tingkat_sekolah || null,
                tahun_pelajaran: p.tahun_pelajaran,
                januari: p.januari || null,
                februari: p.februari || null,
                maret: p.maret || null,
                april: p.april || null,
                mei: p.mei || null,
                juni: p.juni || null,
                juli: p.juli || null,
                agustus: p.agustus || null,
                september: p.september || null,
                oktober: p.oktober || null,
                november: p.november || null,
                desember: p.desember || null,
            };
        });

        // Kirimkan respon dengan data yang dihasilkan
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in getAllPembayaran:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Pembayaran", error: error.message });
    }
};


exports.getTingkatSekolah = async (req, res) => {
    try {
        
        const tingkat_sekolah = await Sekolah.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('tingkat_sekolah')), 'tingkat_sekolah']],
            order: [['tingkat_sekolah', 'ASC']]
        });

        
        if (!tingkat_sekolah.length) {
            return res.status(404).json({ msg: "Tingkat Sekolah tidak ditemukan" });
        }

        
        res.status(200).json(tingkat_sekolah.map(item => item.tingkat_sekolah));
    } catch (error) {
        console.error("Error in getTingkatSekolah:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Tingkat Sekolah", error: error.message });
    }
};


exports.getAllPembayaranByNPSN = async (req, res) => {
    try {
        const { npsn } = req.params; // Get NPSN from request parameters

        // First, find all students with the given NPSN
        const siswa = await Siswa.findAll({
            where: { npsn: npsn },
            attributes: ['id', 'nisn', 'nama_siswa', 'biaya_spp', 'kelas', 'npsn'],
            include: [{
                model: Sekolah,
                attributes: ['tingkat_sekolah'],
                as: 'sekolah'
            }]
        });

        if (!siswa.length) {
            return res.status(404).json({ msg: "Tidak ada siswa ditemukan untuk NPSN ini" });
        }

        // Get all student IDs
        const siswaIds = siswa.map(s => s.id);

        // Find all payment data for these students
        const pembayaran = await Pembayaran.findAll({
            where: {
                id_siswa: siswaIds
            },
            attributes: [
                'id_siswa',
                'tahun_pelajaran',
                'januari',
                'februari',
                'maret',
                'april',
                'mei',
                'juni',
                'juli',
                'agustus',
                'september',
                'oktober',
                'november',
                'desember'
            ]
        });

        if (!pembayaran.length) {
            return res.status(404).json({ msg: "Data pembayaran tidak ditemukan untuk siswa-siswa ini" });
        }

        // Map data pembayaran and siswa
        const responseData = pembayaran.map(p => {
            const siswaData = siswa.find(s => s.id === p.id_siswa) || {};
            return {
                id_siswa: siswaData.id || p.id_siswa,
                nisn: siswaData.nisn || null,
                nama_siswa: siswaData.nama_siswa || null,
                biaya_spp: siswaData.biaya_spp || null,
                kelas: siswaData.kelas || null,
                tingkat_sekolah: siswaData.sekolah?.tingkat_sekolah || null,
                npsn: siswaData.npsn || null,
                tahun_pelajaran: p.tahun_pelajaran,
                januari: p.januari || null,
                februari: p.februari || null,
                maret: p.maret || null,
                april: p.april || null,
                mei: p.mei || null,
                juni: p.juni || null,
                juli: p.juli || null,
                agustus: p.agustus || null,
                september: p.september || null,
                oktober: p.oktober || null,
                november: p.november || null,
                desember: p.desember || null,
            };
        });

        // Send response with generated data
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in getAllPembayaran:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Pembayaran", error: error.message });
    }
};