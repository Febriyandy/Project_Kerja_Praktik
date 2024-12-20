const ArusDonatur = require("../models/ArusDonatur");
const Donatur = require("../models/DonaturModel");
const Sequelize = require("sequelize");


// Membuat Data Kas Sekolah
exports.createDonaturYayasan = async (req, res) => {
  const { tahun_pelajaran } = req.body;

  try {
    const existingDonatur = await Donatur.findOne({
      where: {
        tahun_pelajaran: tahun_pelajaran,
      },
    });

    if (existingDonatur) {
      return res.status(409).json({
        success: false,
        msg: "Donatur Pada tahun pelajaran ini sudah ada",
      });
    }

    await Donatur.create({
      tahun_pelajaran: tahun_pelajaran,
    });
    res
      .status(201)
      .json({ success: true, msg: "Simpan Data Donatur Yayasan Berhasil" });
  } catch (error) {
    console.error("Error in create Donatur Yayasan:", error);
    res
      .status(400)
      .json({ msg: "Gagal Simpan Data Donatur Yayasan", error: error.message });
  }
};


exports.getDonaturYayasanById = async (req, res) => {
  const { id } = req.params;

  try {
    const donatur_yayasan = await Donatur.findOne({
      where: {
        id: id,
      },
    });

    if (!donatur_yayasan) {
      return res
        .status(404)
        .json({ msg: "donatur_yayasan dengan Id ini tidak ditemukan" });
    }

    res.status(200).json(donatur_yayasan);
  } catch (error) {
    console.error("Error in getdonatur_yayasanById:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data donatur_yayasan", error: error.message });
  }
};


exports.getDonaturAll = async (req, res) => {
  try {
    const donatur_yayasan = await Donatur.findAll();

    if (donatur_yayasan.length === 0) {
      return res.status(404).json({ msg: "Data Donatur tidak ditemukan" });
    }

    const result = await Promise.all(
      donatur_yayasan.map(async (donaturYayasan) => {
        const arusDonaturList = await ArusDonatur.findAll({
          where: { id_donaturYayasan: donaturYayasan.id },
          order: [['createdAt', 'DESC']],
          limit: 1,
        });

        // Mendapatkan saldo terbaru atau 0 jika tidak ada data
        const latestSaldo = arusDonaturList.length > 0 ? arusDonaturList[0].saldo : 0;

        // Mengembalikan data dengan saldo terbaru
        return {
          ...donaturYayasan.dataValues,
          latestSaldo,
        };
      })
    );

    // Mengirimkan data hasil
    res.status(200).json(result);
  } catch (error) {
    // Menangani error dan mengirimkan pesan kesalahan
    console.error("Error in getDonaturAll:", error);
    res.status(500).json({ msg: "Gagal mengambil data Donatur", error: error.message });
  }
};


//Membuat data arus kas
exports.createArusDonatur = async (req, res) => {
  const { id_donaturYayasan } = req.params;
  const {bulan, tanggal, keterangan, debit, kredit, saldo } =
    req.body;

  try {
    const existingArusDonatur = await Donatur.findOne({
      where: {
        id: id_donaturYayasan,
      },
    });

    if (!existingArusDonatur) {
      return res.status(409).json({
        success: false,
        msg: "Arus dengan Id Donatur yayasan ini tidak ditemukan",
      });
    }

    await ArusDonatur.create({
      id_donaturYayasan: id_donaturYayasan,
      bulan: bulan,
      tanggal: tanggal,
      keterangan: keterangan,
      debit: debit,
      kredit: kredit,
      saldo: saldo,
    });

    res
      .status(201)
      .json({ success: true, msg: "Simpan Data Arus Donatur Berhasil" });
  } catch (error) {
    console.error("Error in create Arus Donatur:", error);
    res
      .status(400)
      .json({ msg: "Gagal Simpan Data Arus Donatur", error: error.message });
  }
};

//Mendapatkan data arus kas berdasarkan id kas sekolah
exports.getArusDonaturByIdDonaturYayasan = async (req, res) => {
    const { id_donaturYayasan } = req.params;
  
    try {
      const arus_donatur = await ArusDonatur.findAll({
        where: {
          id_donaturYayasan: id_donaturYayasan,
        },
        attributes: [
          "id",
          "id_donaturYayasan",
          "bulan",
          "tanggal",
          "keterangan",
          "debit",
          "kredit",
          "saldo",
        ],
        include: [
          {
            model: Donatur,
            attributes: ["tahun_pelajaran"],
            as: "kas_donatur",
          },
        ],
      });
  
      if (!arus_donatur.length) {
        return res
          .status(404)
          .json({ msg: "Arus Donatur dengan Id ini tidak ditemukan" });
      }
  
      const responseData = arus_donatur.map((item) => ({
        id: item.id,
        id_donaturYayasan: item.id_donaturYayasan,
        bulan: item.bulan,
        tanggal: item.tanggal,
        keterangan: item.keterangan,
        debit: item.debit,
        kredit: item.kredit,
        saldo: item.saldo,
        tahun_pelajaran: item.kas_donatur?.tahun_pelajaran || null,
      }));
  
      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error in getArusDonaturByIdDonaturYayasan:", error);
      res
        .status(500)
        .json({ msg: "Gagal Ambil Data Arus Donatur", error: error.message });
    }
  };
  

//Menghapus data arus kas
exports.deleteArusDonatur = async (req, res) => {
  const { id } = req.params;

  try {
    const arus_donatur = await ArusDonatur.findOne({ where: { id: id } });

    if (!arus_donatur) {
      return res
        .status(404)
        .json({ msg: "Arus Donatur dengan Id ini tidak ditemukan" });
    }

    await arus_donatur.destroy();

    res
      .status(200)
      .json({ success: true, msg: "Hapus Data Arus Donatur Berhasil" });
  } catch (error) {
    console.error("Error in delete Arus Donatur:", error);
    res
      .status(500)
      .json({ msg: "Gagal Hapus Data Arus Donatur", error: error.message });
  }
};



exports.getTahunPelajaran = async (req, res) => {
  try {
    const tahunPelajaran = await Donatur.findAll({
      attributes: [
        [
          Sequelize.fn("DISTINCT", Sequelize.col("tahun_pelajaran")),
          "tahun_pelajaran",
        ],
      ],
      order: [["tahun_pelajaran", "ASC"]],
    });

    if (!tahunPelajaran.length) {
      return res.status(404).json({ msg: "Tahun Pelajaran tidak ditemukan" });
    }
    res.status(200).json(tahunPelajaran.map((item) => item.tahun_pelajaran));
  } catch (error) {
    console.error("Error in getTahunPelajaran:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data Tahun Pelajaran", error: error.message });
  }
};

const getNamaBulan = (bulan) => {
  const bulanTeks = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const bulanAngka = bulan.split("-")[1]; // Ambil bagian bulan saja
  return bulanTeks[parseInt(bulanAngka, 10) - 1]; // Kembalikan nama bulan
};

// Mendapatkan saldo per bulan dengan total debit dikurangi total kredit dan tahun pelajaran dari Donatur
exports.getSaldoPerBulan = async (req, res) => {
  try {
    // Query untuk mendapatkan total debit, total kredit, dan id_donaturYayasan
    const saldoPerBulan = await ArusDonatur.findAll({
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("tanggal"), "%Y-%m"), "bulan"], // Format bulan
        [Sequelize.fn("SUM", Sequelize.col("debit")), "total_debit"], // Total debit per bulan
        [Sequelize.fn("SUM", Sequelize.col("kredit")), "total_kredit"], // Total kredit per bulan
        "id_donaturYayasan"
      ],
      group: ["bulan", "id_donaturYayasan"], // Group by bulan dan id_donaturYayasan
      order: [[Sequelize.literal("bulan"), "ASC"]], // Urutkan berdasarkan bulan
    });

    if (!saldoPerBulan.length) {
      return res.status(404).json({ msg: "Data Arus Donatur tidak ditemukan" });
    }

    // Iterasi saldo per bulan untuk menambahkan tahun pelajaran dari Donatur
    const result = await Promise.all(
      saldoPerBulan.map(async (item) => {
        // Ambil tahun_pelajaran dari Donatur berdasarkan id_donaturYayasan
        const donatur = await Donatur.findOne({
          where: { id: item.id_donaturYayasan },
          attributes: ["tahun_pelajaran"],
        });

        return {
          bulan: getNamaBulan(item.getDataValue("bulan")), // Ubah format bulan ke nama bulan saja
          total_debit: item.getDataValue("total_debit"),
          total_kredit: item.getDataValue("total_kredit"),
          saldo: item.getDataValue("total_debit") - item.getDataValue("total_kredit"),
          tahun_pelajaran: donatur ? donatur.tahun_pelajaran : null, // Tambahkan tahun pelajaran
        };
      })
    );

    // Mengirimkan hasil ke client
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSaldoPerBulan:", error);
    res
      .status(500)
      .json({ msg: "Gagal mengambil saldo per bulan", error: error.message });
  }
};