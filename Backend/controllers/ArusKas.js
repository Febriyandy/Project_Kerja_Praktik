const ArusKas = require("../models/ArusKasModel");
const KasSekolah = require("../models/KasSekolahModel");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");


// Membuat Data Kas Sekolah
exports.createKasSekolah = async (req, res) => {
  const { npsn, tahun_pelajaran } = req.body;

  try {
    const existingKasSekolah = await KasSekolah.findOne({
      where: {
        npsn: npsn,
        tahun_pelajaran: tahun_pelajaran,
      },
    });

    if (existingKasSekolah) {
      return res.status(409).json({
        success: false,
        msg: "Kas Sekolah Pada tahun pelajaran ini sudah ada",
      });
    }

    await KasSekolah.create({
      npsn: npsn,
      tahun_pelajaran: tahun_pelajaran,
    });
    res
      .status(201)
      .json({ success: true, msg: "Simpan Data Kas Sekolah Berhasil" });
  } catch (error) {
    console.error("Error in create Kas Sekolah:", error);
    res
      .status(400)
      .json({ msg: "Gagal Simpan Data Kas Sekolah", error: error.message });
  }
};


//Mengambil data kas sekolah berdasarkan NPSN
exports.getKasSekolahByNPSN = async (req, res) => {
  const { npsn } = req.params;
  try {
    const kasSekolahs = await KasSekolah.findAll({
      where: {
        npsn: npsn,
      },
    });

    if (!kasSekolahs.length) {
      return res
        .status(404)
        .json({ msg: "KasSekolah dengan NPSN ini tidak ditemukan" });
    }
    const result = await Promise.all(
      kasSekolahs.map(async (kasSekolah) => {
        const arusKas = await ArusKas.findAll({
          where: {
            id_kasSekolah: kasSekolah.id,
          },
          order: [["createdAt", "DESC"]],
          limit: 1,
        });

        const latestSaldo = arusKas.length > 0 ? arusKas[0].saldo : 0;

        return {
          ...kasSekolah.dataValues, 
          latestSaldo, 
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getKasSekolahByNPSN:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data KasSekolah", error: error.message });
  }
};


//Mendapatkan data kas sekolah berdasarkan id
exports.getKasSekolahById = async (req, res) => {
  const { id } = req.params;

  try {
    const Kas = await KasSekolah.findOne({
      where: {
        id: id,
      },
    });

    if (!Kas) {
      return res
        .status(404)
        .json({ msg: "KasSekolah dengan Id ini tidak ditemukan" });
    }

    res.status(200).json(Kas);
  } catch (error) {
    console.error("Error in getKasSekolahById:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data KasSekolah", error: error.message });
  }
};


//Membuat data arus kas
exports.createArusKas = async (req, res) => {
  const { id_kasSekolah } = req.params;
  const { kode_nota, bulan, tanggal, keterangan, debit, kredit, saldo } =
    req.body;

  try {
    const existingArusKas = await KasSekolah.findOne({
      where: {
        id: id_kasSekolah,
      },
    });

    if (!existingArusKas) {
      return res.status(409).json({
        success: false,
        msg: "Arus dengan Id KasSekolah ini tidak ditemukan",
      });
    }

    await ArusKas.create({
      id_kasSekolah: id_kasSekolah,
      kode_nota: kode_nota ?? "",
      bulan: bulan,
      tanggal: tanggal,
      keterangan: keterangan,
      debit: debit,
      kredit: kredit,
      saldo: saldo,
    });

    res
      .status(201)
      .json({ success: true, msg: "Simpan Data Arus Kas Berhasil" });
  } catch (error) {
    console.error("Error in create Arus Kas:", error);
    res
      .status(400)
      .json({ msg: "Gagal Simpan Data Arus Kas", error: error.message });
  }
};


//Mendapatkan data arus kas berdasarkan id kas sekolah
exports.getArusKasByIdKasSekolah = async (req, res) => {
  const { id_kasSekolah } = req.params;

  try {
    const arus_kas = await ArusKas.findAll({
      where: {
        id_kasSekolah: id_kasSekolah,
      },
      attributes: [
        "id",
        "id_kasSekolah",
        "kode_nota",
        "bulan",
        "tanggal",
        "keterangan",
        "debit",
        "kredit",
        "saldo",
      ],
      include: [
        {
          model: KasSekolah,
          attributes: ["tahun_pelajaran"],
          as: "kas_sekolah",
        },
      ],
    });

    if (!arus_kas.length) {
      return res
        .status(404)
        .json({ msg: "Arus Kas dengan Id ini tidak ditemukan" });
    }

    const responseData = arus_kas.map((item) => ({
      id: item.id,
      id_kasSekolah: item.id_kasSekolah,
      kode_nota: item.kode_nota,
      bulan: item.bulan,
      tanggal: item.tanggal,
      keterangan: item.keterangan,
      debit: item.debit,
      kredit: item.kredit,
      saldo: item.saldo,
      tahun_pelajaran: item.kas_sekolah?.tahun_pelajaran || null,
    }));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getArusKasById:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data ArusKas", error: error.message });
  }
};


//Mengedit data arus kas
exports.updateArusKas = async (req, res) => {
  const { id } = req.params;
  const { kode_nota, bulan, tanggal, keterangan, debit, kredit, saldo } =
    req.body;

  try {
    const arus_kas = await ArusKas.findOne({ where: { id: id } });

    if (!arus_kas) {
      return res
        .status(404)
        .json({ msg: "Arus Kas dengan Id ini tidak ditemukan" });
    }

    await arus_kas.update({
      kode_nota,
      bulan,
      tanggal,
      keterangan,
      debit,
      kredit,
      saldo,
    });

    res
      .status(200)
      .json({ success: true, msg: "Update Data Arus Kas Berhasil" });
  } catch (error) {
    console.error("Error in update Arus Kas:", error);
    res
      .status(400)
      .json({ msg: "Gagal Update Data Arus Kas", error: error.message });
  }
};


//Mendapatkan data arus kas berdasarkan id
exports.getArusKasById = async (req, res) => {
  const { id } = req.params;

  try {
    const arus_kas = await ArusKas.findOne({
      where: { id: id },
      attributes: [
        "id",
        "id_kasSekolah",
        "kode_nota",
        "bulan",
        "tanggal",
        "keterangan",
        "debit",
        "kredit",
        "saldo",
      ],
      include: [
        {
          model: KasSekolah,
          attributes: ["tahun_pelajaran"],
          as: "kas_sekolah", 
        },
      ],
    });

    if (!arus_kas) {
      return res
        .status(404)
        .json({ msg: "Arus Kas dengan Id ini tidak ditemukan" });
    }

    const responseData = {
      id: arus_kas.id,
      id_kasSekolah: arus_kas.id_kasSekolah,
      kode_nota: arus_kas.kode_nota,
      bulan: arus_kas.bulan,
      tanggal: arus_kas.tanggal,
      keterangan: arus_kas.keterangan,
      debit: arus_kas.debit,
      kredit: arus_kas.kredit,
      saldo: arus_kas.saldo,
      tahun_pelajaran: arus_kas.kas_sekolah?.tahun_pelajaran || null, 
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getArusKasById:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data ArusKas", error: error.message });
  }
};


//Menghapus data arus kas
exports.deleteArusKas = async (req, res) => {
  const { id } = req.params;

  try {
    const arus_kas = await ArusKas.findOne({ where: { id: id } });

    if (!arus_kas) {
      return res
        .status(404)
        .json({ msg: "Arus Kas dengan Id ini tidak ditemukan" });
    }

    await arus_kas.destroy();

    res
      .status(200)
      .json({ success: true, msg: "Hapus Data Arus Kas Berhasil" });
  } catch (error) {
    console.error("Error in delete Arus Kas:", error);
    res
      .status(500)
      .json({ msg: "Gagal Hapus Data Arus Kas", error: error.message });
  }
};


//Mendapatkan data arus kas dengan value Dana Bos
exports.getArusKasDanaBos = async (req, res) => {
  try {
    const arus_kas = await ArusKas.findAll({
      attributes: ["bulan", "debit"],
      where: {
        keterangan: "Dana Bos", 
      },
      include: [
        {
          model: KasSekolah,
          attributes: ["npsn", "tahun_pelajaran"],
          as: "kas_sekolah",
        },
      ],
    });

    if (!arus_kas.length) {
      return res
        .status(404)
        .json({ msg: "Data Arus Kas dengan Dana Bos tidak ditemukan" });
    }

    const responseData = arus_kas.map((item) => ({
      npsn: item.kas_sekolah?.npsn || null,
      tahun_pelajaran: item.kas_sekolah?.tahun_pelajaran || null,
      bulan: item.bulan,
      dana_bos: item.debit,
    }));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getArusKasDanaBos:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data ArusKas Dana Bos", error: error.message });
  }
};

//Mendapatkan data arus kas dengan value Dana Bos By NPSN
exports.getArusKasDanaBosByNPSN = async (req, res) => {
  const { npsn } = req.params;
  try {
    const arus_kas = await ArusKas.findAll({
      attributes: ["bulan", "debit"],
      where: {
        keterangan: "Dana Bos", 
      },
      include: [
        {
          model: KasSekolah,
          attributes: ["npsn", "tahun_pelajaran"],
          as: "kas_sekolah",
          where: { npsn },
        },
      ],
    });

    if (!arus_kas.length) {
      return res
        .status(404)
        .json({ msg: "Data Arus Kas dengan Dana Bos tidak ditemukan" });
    }

    const responseData = arus_kas.map((item) => ({
      npsn: item.kas_sekolah?.npsn || null,
      tahun_pelajaran: item.kas_sekolah?.tahun_pelajaran || null,
      bulan: item.bulan,
      dana_bos: item.debit,
    }));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getArusKasDanaBos:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data ArusKas Dana Bos", error: error.message });
  }
};


//Mendapatkan data arus kas dengan value Dana SPP
exports.getArusKasDanaSPP = async (req, res) => {
  try {
    const arus_kas = await ArusKas.findAll({
      attributes: ["bulan", "debit"],
      where: {
        keterangan: "Dana SPP",
      },
      include: [
        {
          model: KasSekolah,
          attributes: ["npsn", "tahun_pelajaran"],
          as: "kas_sekolah",
        },
      ],
    });

    if (!arus_kas.length) {
      return res
        .status(404)
        .json({ msg: "Data Arus Kas dengan Dana Bos tidak ditemukan" });
    }

    const responseData = arus_kas.map((item) => ({
      npsn: item.kas_sekolah?.npsn || null,
      tahun_pelajaran: item.kas_sekolah?.tahun_pelajaran || null,
      bulan: item.bulan,
      dana_spp: item.debit,
    }));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getArusKasDanaSPP:", error);
    res
      .status(500)
      .json({ msg: "Gagal Ambil Data ArusKas Dana SPP", error: error.message });
  }
};


// Mendapatkan data tahun pelajaran unique di kas sekolah
exports.getTahunPelajaran = async (req, res) => {
  try {
    const tahunPelajaran = await KasSekolah.findAll({
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


exports.getArusKasAll = async (req, res) => {
  try {
    const arus_kas = await ArusKas.findAll({
      attributes: ["bulan", "debit", "kredit", "keterangan"],
      include: [
        {
          model: KasSekolah,
          attributes: ["npsn", "tahun_pelajaran"],
          as: "kas_sekolah",
        },
      ],
    });

    if (!arus_kas.length) {
      return res.status(404).json({ msg: "Data Arus Kas tidak ditemukan" });
    }

    const responseData = arus_kas.reduce((acc, item) => {
      const existingEntry = acc.find(
        (entry) =>
          entry.npsn === item.kas_sekolah?.npsn && entry.bulan === item.bulan
      );

      if (existingEntry) {
        if (item.keterangan === "Gaji Guru" || item.keterangan === "Operasional") {
          existingEntry[item.keterangan.toLowerCase().replace(/\s+/g, "_")] =
            (existingEntry[item.keterangan.toLowerCase().replace(/\s+/g, "_")] || 0) +
            item.kredit;
        } else if (item.keterangan === "Dana Bos" || item.keterangan === "Dana SPP" || item.keterangan === "Saldo Akhir Tahun") {
          existingEntry[item.keterangan.toLowerCase().replace(/\s+/g, "_")] =
            (existingEntry[item.keterangan.toLowerCase().replace(/\s+/g, "_")] || 0) +
            item.debit;
        } else {
          existingEntry.lainnya = (existingEntry.lainnya || 0) + item.kredit;
        }
      } else {
        acc.push({
          npsn: item.kas_sekolah?.npsn || null,
          tahun_pelajaran: item.kas_sekolah?.tahun_pelajaran || null,
          bulan: item.bulan,
          [item.keterangan.toLowerCase().replace(/\s+/g, "_")]:
            item.keterangan === "Gaji Guru" || item.keterangan === "Operasional"
              ? item.kredit
              : item.keterangan === "Dana Bos" || item.keterangan === "Dana SPP" || item.keterangan === "Saldo Akhir Tahun"
              ? item.debit
              : undefined,
          lainnya:
            item.keterangan !== "Gaji Guru" &&
            item.keterangan !== "Operasional" &&
            item.keterangan !== "Dana Bos" &&
            item.keterangan !== "Dana SPP" &&
            item.keterangan !== "Saldo Akhir Tahun"
              ? item.kredit
              : 0,
        });
      }

      return acc;
    }, []);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getArusKasAll:", error);
    res.status(500).json({ msg: "Gagal Ambil Data Arus Kas", error: error.message });
  }
};
