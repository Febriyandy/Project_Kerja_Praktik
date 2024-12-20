const Pengajuan = require("../models/PengajuanBelanjaModel");
const Belanja = require("../models/BelanjaModel");
const Sequelize = require('sequelize'); 
const fs = require("fs");
const path = require("path");


// Create Rencana Pengajuan
exports.createPengajuan = async (req, res) => {
    const { npsn, bulan, tahun_pelajaran } = req.body;

    try {
        // Cek apakah siswa dengan NISN yang sama sudah ada di kelas yang diinputkan
        const existingPengajuan = await Pengajuan.findOne({
            where: {
                bulan: bulan,
                npsn: npsn,
                tahun_pelajaran: tahun_pelajaran
            }
        });

        if (existingPengajuan) {
            return res.status(409).json({ success: false, msg: "Pengajuan di bulan ini sudah ada dengan tahun pelajaran yang sama"});
        }

        await Pengajuan.create({
            npsn: npsn,
            bulan: bulan,
            tahun_pelajaran: tahun_pelajaran
        });

        res.status(201).json({ success: true, msg: "Simpan Data Pengajuan Berhasil" });
    } catch (error) {
        console.error("Error in create Pengajuan:", error);
        res.status(400).json({ msg: "Gagal Simpan Data Pengajuan", error: error.message });
    }
};


// Get Siswa by NPSN
exports.getPengajuanByNPSN = async (req, res) => {
    const { npsn } = req.params;

    try {
        const pengajuan = await Pengajuan.findAll({
            where: {
                npsn: npsn
            }
        });
        
        if (!pengajuan.length) {
            return res.status(404).json({ msg: "Pengajuan dengan NPSN ini tidak ditemukan" });
        }
        
        res.status(200).json(pengajuan);
    } catch (error) {
        console.error("Error in getPengajuanByNPSN:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Pengajuan", error: error.message });
    }
};


exports.getPengajuanById = async (req, res) => {
    const { id } = req.params;

    try {
        const pengajuan = await Pengajuan.findOne({
            where: {
                id: id
            }
        });
        
        if (!pengajuan) { // Corrected check
            return res.status(404).json({ msg: "Pengajuan dengan Id ini tidak ditemukan" });
        }
        
        res.status(200).json(pengajuan);
    } catch (error) {
        console.error("Error in getPengajuanById:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Pengajuan", error: error.message });
    }
};


exports.createBelanja = async (req, res) => {
    const { id_pengajuan } = req.params;
    const { tanggal_pengajuan, nama_barang, jumlah_barang, harga_satuan} = req.body;

    try {
        // Cek apakah pengajuan dengan id_pengajuan yang sama sudah ada
        const existingPengajuan = await Pengajuan.findOne({
            where: {
                id: id_pengajuan
            }
        });

        if (!existingPengajuan) {
            return res.status(409).json({ success: false, msg: "Belanja dengan Id pengajuan ini tidak ditemukan" });
        }

        // Hitung total_harga
        const total_harga = jumlah_barang * harga_satuan;
        const status_pengajuan = "Belum disetujui"
        // Buat data belanja baru
        await Belanja.create({
            id_pengajuan: id_pengajuan,
            tanggal_pengajuan: tanggal_pengajuan,
            nama_barang: nama_barang,
            jumlah_barang: jumlah_barang,
            harga_satuan: harga_satuan,
            total_harga: total_harga,
            status_pengajuan: status_pengajuan
        });
        

        res.status(201).json({ success: true, msg: "Simpan Data Belanja Berhasil" });
    } catch (error) {
        console.error("Error in create Belanja:", error);
        res.status(400).json({ msg: "Gagal Simpan Data Belanja", error: error.message });
    }
};

exports.getBelanjaByIdPengajuan = async (req, res) => {
    const { id_pengajuan } = req.params;

    try {
        const belanja = await Belanja.findAll({
            where: {
                id_pengajuan: id_pengajuan
            },
            attributes: ['id', 'id_pengajuan', 'kode_nota', 'tanggal_pengajuan', 'nama_barang','jumlah_barang', 'harga_satuan', 'total_harga', 'status_pengajuan', 'keterangan'],
            include: [{
                model: Pengajuan, 
                attributes: ['tahun_pelajaran'],
                as: 'pengajuan_belanja' 
            }]
        });
        
        if (!belanja.length) {
            return res.status(404).json({ msg: "Belanja dengan Id ini tidak ditemukan" });
        }

        // Format response data agar menyertakan tahun_pelajaran dari tabel Pengajuan
        const responseData = belanja.map(item => ({
            id: item.id,
            id_pengajuan: item.id_pengajuan,
            kode_nota: item.kode_nota,
            tanggal_pengajuan: item.tanggal_pengajuan,
            nama_barang: item.nama_barang,
            jumlah_barang: item.jumlah_barang,
            harga_satuan: item.harga_satuan,
            total_harga: item.total_harga,
            status_pengajuan: item.status_pengajuan,
            keterangan: item.keterangan,
            tahun_pelajaran: item.pengajuan_belanja?.tahun_pelajaran || null // Sesuaikan alias ini juga
        }));

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in getBelanjaById:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Belanja", error: error.message });
    }
};

exports.updateBelanja = async (req, res) => {
    const { id } = req.params;
    const { tanggal_pengajuan, nama_barang, jumlah_barang, harga_satuan } = req.body;

    try {
        // Cek apakah belanja dengan id yang diberikan ada
        const belanja = await Belanja.findOne({ where: { id: id } });

        if (!belanja) {
            return res.status(404).json({ msg: "Belanja dengan Id ini tidak ditemukan" });
        }

        // Hitung ulang total_harga jika jumlah_barang atau harga_satuan diperbarui
        const total_harga = jumlah_barang * harga_satuan;

        // Update data belanja
        await belanja.update({
            tanggal_pengajuan,
            nama_barang,
            jumlah_barang,
            harga_satuan,
            total_harga,
        });

        res.status(200).json({ success: true, msg: "Update Data Belanja Berhasil" });
    } catch (error) {
        console.error("Error in update Belanja:", error);
        res.status(400).json({ msg: "Gagal Update Data Belanja", error: error.message });
    }
};

exports.updateBelanjaByAdmin = async (req, res) => {
    const { id } = req.params;
    const { tanggal_pengajuan, nama_barang, jumlah_barang, harga_satuan, status_pengajuan, keterangan } = req.body;

    try {
        // Cek apakah belanja dengan id yang diberikan ada
        const belanja = await Belanja.findOne({ where: { id: id } });

        if (!belanja) {
            return res.status(404).json({ msg: "Belanja dengan Id ini tidak ditemukan" });
        }

        // Hitung ulang total_harga jika jumlah_barang atau harga_satuan diperbarui
        const total_harga = jumlah_barang * harga_satuan;

        // Update data belanja
        await belanja.update({
            tanggal_pengajuan,
            nama_barang,
            jumlah_barang,
            harga_satuan,
            total_harga,
            status_pengajuan,
            keterangan
        });

        res.status(200).json({ success: true, msg: "Update Data Belanja Berhasil" });
    } catch (error) {
        console.error("Error in update Belanja:", error);
        res.status(400).json({ msg: "Gagal Update Data Belanja", error: error.message });
    }
};

exports.getBelanjaById = async (req, res) => {
    const { id } = req.params;

    try {
        const belanja = await Belanja.findOne({
            where: { id: id },
            attributes: ['id', 'id_pengajuan', 'kode_nota', 'tanggal_pengajuan', 'nama_barang', 'jumlah_barang', 'harga_satuan', 'total_harga', 'status_pengajuan', 'keterangan'],
            include: [{
                model: Pengajuan, 
                attributes: ['tahun_pelajaran'],
                as: 'pengajuan_belanja' // Sesuaikan alias ini dengan yang digunakan dalam asosiasi
            }]
        });

        if (!belanja) {
            return res.status(404).json({ msg: "Belanja dengan Id ini tidak ditemukan" });
        }

        // Format response data agar menyertakan tahun_pelajaran dari tabel Pengajuan
        const responseData = {
            id: belanja.id,
            id_pengajuan: belanja.id_pengajuan,
            kode_nota: belanja.kode_nota,
            tanggal_pengajuan: belanja.tanggal_pengajuan,
            nama_barang: belanja.nama_barang,
            jumlah_barang: belanja.jumlah_barang,
            harga_satuan: belanja.harga_satuan,
            total_harga: belanja.total_harga,
            status_pengajuan: belanja.status_pengajuan,
            keterangan: belanja.keterangan,
            tahun_pelajaran: belanja.pengajuan_belanja?.tahun_pelajaran || null // Sesuaikan alias ini juga
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error in getBelanjaById:", error);
        res.status(500).json({ msg: "Gagal Ambil Data Belanja", error: error.message });
    }
};


exports.deleteBelanja = async (req, res) => {
    const { id } = req.params;

    try {
        // Cek apakah belanja dengan id yang diberikan ada
        const belanja = await Belanja.findOne({ where: { id: id } });

        if (!belanja) {
            return res.status(404).json({ msg: "Belanja dengan Id ini tidak ditemukan" });
        }

        // Hapus data belanja
        await belanja.destroy();

        res.status(200).json({ success: true, msg: "Hapus Data Belanja Berhasil" });
    } catch (error) {
        console.error("Error in delete Belanja:", error);
        res.status(500).json({ msg: "Gagal Hapus Data Belanja", error: error.message });
    }
};


exports.updateTTDPengajuanBelanja = async (req, res) => {
    const { id } = req.params;
  
    try {
      const pengajuan_belanja = await Pengajuan.findByPk(id);
  
      if (!pengajuan_belanja) {
        return res.status(404).json({ msg: "Pengajuan Belanja tidak ditemukan" });
      }
  
      let link_ttd_kasir = pengajuan_belanja.ttd_kasir;
      let link_ttd_bendahara = pengajuan_belanja.ttd_bendahara;
  
      // Proses ttd_kasir
      if (req.files && req.files.ttd_kasir) {
        const kasir = Array.isArray(req.files.ttd_kasir) ? req.files.ttd_kasir[0] : req.files.ttd_kasir;
        const nama_ttd_kasir = kasir.md5 + path.extname(kasir.name);
        link_ttd_kasir = `${req.protocol === 'https' ? 'https' : 'http'}://${req.get('host')}/ttd_kasir/${nama_ttd_kasir}`;
  
        const uploadPathKasir = path.join(__dirname, '../public/ttd_kasir', nama_ttd_kasir);
  
        // Hapus file lama jika ada
        if (pengajuan_belanja.ttd_kasir) {
          const oldTtdKasirPath = path.join(__dirname, '../public/ttd_kasir', path.basename(pengajuan_belanja.ttd_kasir));
          if (fs.existsSync(oldTtdKasirPath)) {
            fs.unlinkSync(oldTtdKasirPath);
          }
        }
  
        // Pindahkan file yang baru diunggah
        await kasir.mv(uploadPathKasir);
      }
  
      // Proses ttd_bendahara
      if (req.files && req.files.ttd_bendahara) {
        const bendahara = Array.isArray(req.files.ttd_bendahara) ? req.files.ttd_bendahara[0] : req.files.ttd_bendahara;
        const nama_ttd_bendahara = bendahara.md5 + path.extname(bendahara.name);
        link_ttd_bendahara = `${req.protocol === 'https' ? 'https' : 'http'}://${req.get('host')}/ttd_bendahara/${nama_ttd_bendahara}`;
  
        const uploadPathBendahara = path.join(__dirname, '../public/ttd_bendahara', nama_ttd_bendahara);
  
        // Hapus file lama jika ada
        if (pengajuan_belanja.ttd_bendahara) {
          const oldTtdBendaharaPath = path.join(__dirname, '../public/ttd_bendahara', path.basename(pengajuan_belanja.ttd_bendahara));
          if (fs.existsSync(oldTtdBendaharaPath)) {
            fs.unlinkSync(oldTtdBendaharaPath);
          }
        }
  
        // Pindahkan file yang baru diunggah
        await bendahara.mv(uploadPathBendahara);
      }
  
      // Update data pengajuan
      await Pengajuan.update({
        ttd_kasir: link_ttd_kasir,
        ttd_bendahara: link_ttd_bendahara
      }, {
        where: { id: id }
      });
  
      res.status(200).json({ msg: "Pengajuan Belanja berhasil diperbarui" });
    } catch (error) {
      console.error("Error in update Pengajuan Belanja:", error);
      res.status(400).json({ msg: "Gagal memperbarui Pengajuan Belanja", error: error.message });
    }
  };