const ArusInfaq = require("../models/ArusInfaqModel");
const InfaqYayasan = require("../models/InfaqYayasanModel");
const Sequelize = require("sequelize");


// Membuat Data Kas Sekolah
exports.createInfaqYayasan = async (req, res) => {
  const { tahun_pelajaran } = req.body;

  try {
    const existingInfaq = await InfaqYayasan.findOne({
      where: {
        tahun_pelajaran: tahun_pelajaran,
      },
    });

    if (existingInfaq) {
      return res.status(409).json({
        success: false,
        msg: "Infaq Pada tahun pelajaran ini sudah ada",
      });
    }

    await InfaqYayasan.create({
      tahun_pelajaran: tahun_pelajaran,
    });
    res
      .status(201)
      .json({ success: true, msg: "Simpan Data Infaq Yayasan Berhasil" });
  } catch (error) {
    console.error("Error in create Infaq Yayasan:", error);
    res
      .status(400)
      .json({ msg: "Gagal Simpan Data Infaq Yayasan", error: error.message });
  }
};

//Mendapatkan data infaq yayasan berdasarkan id
exports.getInfaqYayasanById = async (req, res) => {
  const { id } = req.params;

  try {
    const Infaq = await InfaqYayasan.findOne({
      where: {
        id: id,
      },
    });

    if (!Infaq) {
      return res
        .status(404)
        .json({ msg: "Infaq dengan Id ini tidak ditemukan" });
    }

    res.status(200).json(Infaq);
  } catch (error) {
    console.error("Error in getInfaqById:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data Infaq", error: error.message });
  }
};

// Mengambil data Infaq Sekolah berdasarkan Id
exports.getInfaqAll = async (req, res) => {
  try {
    // Mengambil semua data Infaq
    const infaqYayasanList = await InfaqYayasan.findAll();

    if (infaqYayasanList.length === 0) {
      return res.status(404).json({ msg: "Data Infaq tidak ditemukan" });
    }

    // Mengambil saldo terbaru untuk setiap Infaq
    const result = await Promise.all(
      infaqYayasanList.map(async (infaqYayasan) => {
        // Mengambil data terbaru dari ArusInfaq berdasarkan id_infaqYayasan
        const arusInfaqList = await ArusInfaq.findAll({
          where: { id_infaqYayasan: infaqYayasan.id },
          order: [['createdAt', 'DESC']],
          limit: 1,
        });

        // Mendapatkan saldo terbaru atau 0 jika tidak ada data
        const latestSaldo = arusInfaqList.length > 0 ? arusInfaqList[0].saldo : 0;

        // Mengembalikan data dengan saldo terbaru
        return {
          ...infaqYayasan.dataValues,
          latestSaldo,
        };
      })
    );

    // Mengirimkan data hasil
    res.status(200).json(result);
  } catch (error) {
    // Menangani error dan mengirimkan pesan kesalahan
    console.error("Error in getInfaqAll:", error);
    res.status(500).json({ msg: "Gagal mengambil data Infaq", error: error.message });
  }
};


//Membuat data arus kas
exports.createArusInfaq = async (req, res) => {
  const { id_infaqYayasan } = req.params;
  const {bulan, tanggal, keterangan, satuan, debit, kredit, saldo } =
    req.body;

  try {
    const existingArusInfaq = await InfaqYayasan.findOne({
      where: {
        id: id_infaqYayasan,
      },
    });

    if (!existingArusInfaq) {
      return res.status(409).json({
        success: false,
        msg: "Arus dengan Id Infaq yayasan ini tidak ditemukan",
      });
    }

    await ArusInfaq.create({
      id_infaqYayasan: id_infaqYayasan,
      bulan: bulan,
      tanggal: tanggal,
      keterangan: keterangan,
      satuan: satuan,
      debit: debit,
      kredit: kredit,
      saldo: saldo,
    });

    res
      .status(201)
      .json({ success: true, msg: "Simpan Data Arus Infaq Berhasil" });
  } catch (error) {
    console.error("Error in create Arus Infaq:", error);
    res
      .status(400)
      .json({ msg: "Gagal Simpan Data Arus Infaq", error: error.message });
  }
};

//Mendapatkan data arus kas berdasarkan id kas sekolah
exports.getArusInfaqByIdInfaqYayasan = async (req, res) => {
    const { id_infaqYayasan } = req.params;
  
    try {
      const arus_infaq = await ArusInfaq.findAll({
        where: {
          id_infaqYayasan: id_infaqYayasan,
        },
        attributes: [
          "id",
          "id_infaqYayasan",
          "bulan",
          "tanggal",
          "keterangan",
          "satuan",
          "debit",
          "kredit",
          "saldo",
        ],
        include: [
          {
            model: InfaqYayasan,
            attributes: ["tahun_pelajaran"],
            as: "kas_infaq",
          },
        ],
      });
  
      if (!arus_infaq.length) {
        return res
          .status(404)
          .json({ msg: "Arus Kas dengan Id ini tidak ditemukan" });
      }
  
      const responseData = arus_infaq.map((item) => ({
        id: item.id,
        id_infaqYayasan: item.id_infaqYayasan,
        bulan: item.bulan,
        tanggal: item.tanggal,
        keterangan: item.keterangan,
        satuan: item.satuan,
        debit: item.debit,
        kredit: item.kredit,
        saldo: item.saldo,
        tahun_pelajaran: item.kas_infaq?.tahun_pelajaran || null,
      }));
  
      res.status(200).json(responseData);
    } catch (error) {
      console.error("Error in getArusInfaqByIdInfaqYayasan:", error);
      res
        .status(500)
        .json({ msg: "Gagal Ambil Data Arus Infaq", error: error.message });
    }
  };
  

//Menghapus data arus kas
exports.deleteArusInfaq = async (req, res) => {
  const { id } = req.params;

  try {
    const arus_infaq = await ArusInfaq.findOne({ where: { id: id } });

    if (!arus_infaq) {
      return res
        .status(404)
        .json({ msg: "Arus Infaq dengan Id ini tidak ditemukan" });
    }

    await arus_infaq.destroy();

    res
      .status(200)
      .json({ success: true, msg: "Hapus Data Arus Infaq Berhasil" });
  } catch (error) {
    console.error("Error in delete Arus Infaq:", error);
    res
      .status(500)
      .json({ msg: "Gagal Hapus Data Arus Infaq", error: error.message });
  }
};



// Mendapatkan data tahun pelajaran unique di Infaq Yayasan
exports.getTahunPelajaran = async (req, res) => {
  try {
    const tahunPelajaran = await InfaqYayasan.findAll({
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

