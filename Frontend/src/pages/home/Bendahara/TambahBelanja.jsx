import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const TambahBelanja = ({onTambahComplate}) => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [tanggal_pengajuan, setTanggal_pengajuan] = useState("");
  const [nama_barang, setNama_barang] = useState("");
  const [jumlah_barang, setJumlah_barang] = useState("");
  const [harga_satuan, setHarga_satuan] = useState("");
  const [formattedHargaSatuan, setFormattedHargaSatuan] = useState("");
  const { id } = useParams();
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
    refreshToken();
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

  const saveData = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("id_pengajuan", id);
      formData.append("tanggal_pengajuan", tanggal_pengajuan);
      formData.append("nama_barang", nama_barang);
      formData.append("jumlah_barang", jumlah_barang);
      formData.append("harga_satuan", harga_satuan);

      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/TambahBelanja/${id}`, formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Data Belanja Tersimpan!",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => {
        onTambahComplate();
        window.location.reload(); 
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.msg;
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data!",
          text: errorMessage,
        });
      } else {
        console.error("Unexpected error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data!",
          text: "Terjadi kesalahan",
        });
      }
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

  return (
    <>
      <section className="w-11/12 mx-auto h-full mt-16">
        
          <button onClick={onTambahComplate} className="text-2xl ">
            <IoArrowBackCircleOutline />
          </button>
        
        <div className="w-1/2 h-auto mx-12 rounded-lg shadow-md -mt-6">
          <div className="w-full flex h-12 bg-primary rounded-t-lg">
            <p className="font-body font-medium text-white my-auto px-5 ">
              Form Tambah Data Belanja
            </p>
          </div>
          <form onSubmit={saveData} className="px-5 py-3 font-body text-sm">
            <label>Tanggal Pengajuan</label>
            <input
              type="date"
              id="tanggal"
              value={tanggal_pengajuan}
              onChange={(e) => setTanggal_pengajuan(e.target.value)}
              placeholder="Masukkan Tanggal Pengajuan"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Nama Barang/Kegiatan</label>
            <input
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
              placeholder="*Contoh 100000"
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

export default TambahBelanja;
