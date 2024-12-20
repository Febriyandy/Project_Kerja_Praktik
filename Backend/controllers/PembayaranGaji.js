const Guru = require("../models/GuruModel");
const PembayaranGaji = require("../models/PembayaranGajiModel");
const Sekolah = require("../models/SekolahModel"); 
const Sequelize = require('sequelize'); 

exports.getPembayaranByNpsn = async (req, res) => {
    const { npsn } = req.params;

    try {
        // Cari data siswa dengan join ke tabel Sekolah untuk mendapatkan tingkat_sekolah
        const guru = await Guru.findAll({
            where: {
                npsn: npsn,
            },
            attributes: ['id', 'nama_guru', 'gaji_guru'],
            include: [{
                model: Sekolah,
                attributes: ['tingkat_sekolah'], // Hanya mengambil tingkat_sekolah
                as: 'sekolah' // Pastikan alias sesuai dengan yang digunakan di model Siswa
            }]
        });

        if (!guru.length) {
            return res.status(404).json({ msg: "Data Guru untuk npsn ini tidak ditemukan" });
        }

        // Ambil ID siswa
        const guruIds = guru.map(s => s.id);

        // Cari data pembayaran berdasarkan id guru
        const pembayaran = await PembayaranGaji.findAll({
            where: {
                id_guru: guruIds
            },
            attributes: [
                'id_guru',
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

        // Map data pembayaran dan guru
        const responseData = guru.map(s => {
            const pembayaranguru = pembayaran.find(p => p.id_guru === s.id) || {};
            return {
                id_guru: s.id, 
                nama_guru: s.nama_guru,
                gaji_guru: s.gaji_guru,
                tingkat_sekolah: s.sekolah?.tingkat_sekolah || null, // Tambahkan tingkat_sekolah
                tahun_pelajaran: pembayaranguru.tahun_pelajaran || null,
                januari: pembayaranguru.januari || null,
                februari: pembayaranguru.februari || null,
                maret: pembayaranguru.maret || null,
                april: pembayaranguru.april || null,
                mei: pembayaranguru.mei || null,
                juni: pembayaranguru.juni || null,
                juli: pembayaranguru.juli || null,
                agustus: pembayaranguru.agustus || null,
                september: pembayaranguru.september || null,
                oktober: pembayaranguru.oktober || null,
                november: pembayaranguru.november || null,
                desember: pembayaranguru.desember || null,
            };
        });

        // Kirimkan respon dengan data yang dihasilkan
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in getPembayaranByNpsn:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Pembayaran", error: error.message });
    }
};


exports.updatePembayaranGaji = async (req, res) => {
    const { id } = req.params;
    const { tahun_pelajaran, bulan, gaji_guru } = req.body;

    try {
        const guru = await Guru.findOne({ where: { id } });

        if (!guru) {
            return res.status(404).json({ message: 'guru tidak ditemukan' });
        }

        const updateData = {};
        updateData[bulan] = gaji_guru;

        const [updatedRows] = await PembayaranGaji.update(updateData, {
            where: {
                id_guru: guru.id,
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

exports.BatalPembayaranGaji = async (req, res) => {
    const { id } = req.params;
    const { tahun_pelajaran, bulan } = req.body;

    try {
        const guru = await Guru.findOne({ where: { id } });

        if (!guru) {
            return res.status(404).json({ message: 'guru tidak ditemukan' });
        }

        const updateData = {};
        updateData[bulan] = 0;

        const [updatedRows] = await PembayaranGaji.update(updateData, {
            where: {
                id_guru: guru.id,
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

exports.getAllPembayaranGaji = async (req, res) => {
    try {
        // Cari semua data pembayaran terlebih dahulu
        const pembayaran = await PembayaranGaji.findAll({
            attributes: [
                'id_guru',
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

        // Ambil ID guru dari data pembayaran
        const guruIds = pembayaran.map(p => p.id_guru);

        // Cari data guru berdasarkan id guru dari tabel pembayaran
        const guru = await Guru.findAll({
            where: {
                id: guruIds
            },
            attributes: ['id', 'nama_guru', 'gaji_guru'],
            include: [{
                model: Sekolah,
                attributes: ['tingkat_sekolah'],
                as: 'sekolah'
            }]
        });

        // Map data pembayaran dan guru
        const responseData = pembayaran.map(p => {
            const guruData = guru.find(s => s.id === p.id_guru) || {};
            return {
                id_guru: guruData.id || p.id_guru,
                nama_guru: guruData.nama_guru || null,
                gaji_guru: guruData.gaji_guru || null,
                tingkat_sekolah: guruData.sekolah?.tingkat_sekolah || null,
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

