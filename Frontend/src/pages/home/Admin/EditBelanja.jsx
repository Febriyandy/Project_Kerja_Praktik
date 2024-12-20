import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const EditBelanja = ({id, onEditComplate }) => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [npsn, setNpsn] = useState(0);
  const [kode_nota, setKode_nota] = useState("");
  const [tanggal_pengajuan, setTanggal_pengajuan] = useState("");
  const [nama_barang, setNama_barang] = useState("");
  const [jumlah_barang, setJumlah_barang] = useState("");
  const [harga_satuan, setHarga_satuan] = useState("");
  const [status_pengajuan, setStatus_Pengajuan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [formattedHargaSatuan, setFormattedHargaSatuan] = useState("");
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setNpsn(decoded.npsn);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    document.title = 'Edit Data Belanja';
    refreshToken();
    if (id) {
      getBelanjaById();
    }
  }, [id]);

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getBelanjaById = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataBelanjaById/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      if (data) {
        setKode_nota(data.kode_nota || "");
        setTanggal_pengajuan(data.tanggal_pengajuan || "");
        setNama_barang(data.nama_barang || "");
        setJumlah_barang(data.jumlah_barang || "");
        setHarga_satuan(data.harga_satuan || "");
        setStatus_Pengajuan(data.status_pengajuan || "");
        setKeterangan(data.keterangan || "");
        setFormattedHargaSatuan(formatNumber(data.harga_satuan || ""));
      }
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleHargaSatuanChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setHarga_satuan(value);
    setFormattedHargaSatuan(formatNumber(value));
  };

  const editData = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        kode_nota,
        tanggal_pengajuan,
        nama_barang,
        jumlah_barang,
        harga_satuan,
        status_pengajuan,
        keterangan

      };

      await axiosJWT.patch(`${import.meta.env.VITE_API_URL}/UpdateBelanjaByAdmin/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Data Belanja Berhasil di Edit!",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => {
        onEditComplate();
        window.location.reload(); // Reload the page after data is saved
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.msg;
        Swal.fire({
          icon: "error",
          title: "Gagal mengedit data!",
          text: errorMessage,
        });
      } else {
        console.error("Unexpected error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal mengedit data!",
          text: "Terjadi kesalahan",
        });
      }
    }
  };

  return (
    <>
      <section className="w-11/12 mx-auto h-full mt-16">
      <button onClick={onEditComplate} className="text-2xl mt-1">
            <IoArrowBackCircleOutline />
          </button>
          <div className="w-1/2 h-auto mx-10 -mt-7 rounded-lg shadow-md ">
          <div className="w-full flex h-12 bg-primary rounded-t-lg">
            <p className="font-body font-medium text-white my-auto px-5 ">
              Form Ubah Status Persetujuan
            </p>
          </div>
          <form onSubmit={editData} className="px-5 py-3 font-body text-sm">
            <label>Kode Nota</label>
            <input
            disabled
              type="text"
              id="kode_nota"
              value={kode_nota}
              onChange={(e) => setKode_nota(e.target.value)}
              placeholder="Masukkan Kode Nota"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Tanggal Pengajuan</label>
            <input
            disabled
              type="date"
              id="tanggal"
              value={tanggal_pengajuan}
              onChange={(e) => setTanggal_pengajuan(e.target.value)}
              placeholder="Masukkan Tanggal Pengajuan"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Nama Barang/Kegiatan</label>
            <input
            disabled
              type="text"
              id="nama_barang"
              value={nama_barang}
              onChange={(e) => setNama_barang(e.target.value)}
              placeholder="Nama Barang/Kegiatan"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Jumlah Barang</label>
            <input
              type="number"
              id="jumlah_barang"
              value={jumlah_barang}
              onChange={(e) => setJumlah_barang(e.target.value)}
              placeholder="Masukkan Jumlah Barang"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Harga Satuan</label>
            <input
              type="text"
              id="harga_satuan"
              value={formattedHargaSatuan}
              onChange={handleHargaSatuanChange}
              placeholder="Contoh: 100.000"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Status Persetujuan</label>
            <select
              value={status_pengajuan}
              onChange={(e) => setStatus_Pengajuan(e.target.value)}
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="" hidden>
                Pilih Status Persetujuan
              </option>
              <option value="Disetujui">Disetujui</option>
              <option value="Belum disetujui">Belum disetujui</option>
              <option value="Tidak disetujui">Tidak disetujui</option>
            </select>
            <label>Keterangan</label>
            <textarea
              type="text"
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Tambah Keterangan"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end">
              <button
                className="rounded-md shadow-lg my-5 bg-primary hover:bg-secondary text-white py-2 px-4"
                type="submit"
              >
                Simpan Data
              </button>
            </div>
          </form>
        </div>
        
        
      </section>
    </>
  );
};

export default EditBelanja;