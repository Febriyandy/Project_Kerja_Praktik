import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const TambahDataGuru = ({onTambahComplate}) => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [npsn, setNpsn] = useState(0);
  const [nama_guru, setNama_guru] = useState("");
  const [tahun_pelajaran, setTahunPelajaran] = useState("");
  const [gaji_guru, setGaji_guru] = useState("");
  const [formattedGajiGuru, setFormattedGajiGuru] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setNpsn(decoded.npsn);
      setExpire(decoded.exp);
      setNama_sekolah(decoded.nama_sekolah);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    document.title = 'Tambah Data Guru';
    refreshToken();
  });

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
      formData.append("npsn", npsn);
      formData.append("nama_guru", nama_guru);
      formData.append("tahun_pelajaran", tahun_pelajaran);
      formData.append("gaji_guru", gaji_guru);

      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/TambahGuru`, formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Data Guru Tersimpan!",
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
        setMsg(errorMessage);

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

  const handleGajiGuruChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setGaji_guru(value);
    setFormattedGajiGuru(formatNumber(value));
  };

  return (
    <>
      
        <section className="w-11/12 mx-auto h-full mt-16">
          <div className="flex gap-7">
            <button onClick={onTambahComplate} className="text-2xl">
              <IoArrowBackCircleOutline />
            </button>
            <p className="font-body text-base font-bold text-secondary ">{`Tambah Data Guru`}</p>
          </div>
          <div className="w-1/2 h-auto mx-12 rounded-lg shadow-md mt-5">
            <div className="w-full flex h-12 bg-primary rounded-t-lg">
              <p className="font-body font-medium text-white my-auto px-5 ">
                Form Tambah Data Guru
              </p>
            </div>
            <form onSubmit={saveData} className="px-5 py-3 font-body text-sm">
              
              <label>Nama</label>
              <input
                type="text"
                id="nama"
                value={nama_guru}
                onChange={(e) => setNama_guru(e.target.value)}
                placeholder="Masukkan Nama Guru"
                className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
              />
              <label>Tahun Pelajaran</label>
              <input
                type="text"
                id="tahun"
                value={tahun_pelajaran}
                onChange={(e) => setTahunPelajaran(e.target.value)}
                placeholder="*Contoh 2024/2025"
                className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
              />

              <label>Gaji Guru</label>
              <input
              type="text"
              id="gaji_guru"
              value={formattedGajiGuru}
              onChange={handleGajiGuruChange}
              placeholder="*Contoh 100000"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />

              <div className="flex justify-end">
              <button
                className="rounded-md shadow-lg my-5 bg-primary hover:bg-secondary text-white py-2 px-4 "
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

export default TambahDataGuru;
