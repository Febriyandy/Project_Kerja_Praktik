import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const TambahDataSiswa = ({onTambahComplate}) => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [npsn, setNpsn] = useState(0);
  const [nisn, setNisn] = useState("");
  const [nama_siswa, setNama_siswa] = useState("");
  const [nama_orangtua, setNama_orangtua] = useState("");
  const [no_hp_orangtua, setNo_hp_orangtua] = useState("");
  const [tahun_pelajaran, setTahunPelajaran] = useState("");
  const [biaya_spp, setBiaya_SPP] = useState("");
  const { kelas } = useParams();
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
    document.title = 'Tambah Data Siswa';
    refreshToken();
  }, [kelas]);

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
      formData.append("nisn", nisn);
      formData.append("nama_siswa", nama_siswa);
      formData.append("kelas", kelas);
      formData.append("tahun_pelajaran", tahun_pelajaran);
      formData.append("nama_orangtua", nama_orangtua);
      formData.append("no_hp_orangtua", no_hp_orangtua);
      formData.append("biaya_spp", biaya_spp);

      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/TambahSiswa`, formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Data Siswa Tersimpan!",
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

  return (
    <>
      
        <section className="w-11/12 mx-auto h-full mt-16">
          <div className="flex gap-7">
            <button onClick={onTambahComplate} className="text-2xl">
              <IoArrowBackCircleOutline />
            </button>
            <p className="font-body text-base font-bold text-secondary ">{`Tambah Data Siswa ${kelas}`}</p>
          </div>
          <div className="w-1/2 h-auto mx-12 rounded-lg shadow-md mt-5">
            <div className="w-full flex h-12 bg-primary rounded-t-lg">
              <p className="font-body font-medium text-white my-auto px-5 ">
                Form Tambah Data Siswa
              </p>
            </div>
            <form onSubmit={saveData} className="px-5 py-3 font-body text-sm">
              <label>NISN</label>
              <input
                type="text"
                id="nisn"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Masukkan NISN Siswa"
                className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
              />
              <label>Nama</label>
              <input
                type="text"
                id="nama"
                value={nama_siswa}
                onChange={(e) => setNama_siswa(e.target.value)}
                placeholder="Masukkan Nama Siswa"
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

              <label>Nama Orang Tua</label>
              <input
                type="text"
                id="nama"
                value={nama_orangtua}
                onChange={(e) => setNama_orangtua(e.target.value)}
                placeholder="Nama Orang Tua/Wali"
                className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
              />
              <label>No Hp Orang Tua</label>
              <input
                type="text"
                id="no"
                value={no_hp_orangtua}
                onChange={(e) => setNo_hp_orangtua(e.target.value)}
                placeholder="Diawali dengan 628......"
                className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
              />
              <label>Biaya SPP</label>
              <select
                value={biaya_spp}
                onChange={(e) => setBiaya_SPP(e.target.value)}
                className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
              >
                <option value="" hidden>
                  Pilih Biaya SPP
                </option>
                <option value="50000">Rp 50.000</option>
                <option value="100000">Rp 100.000</option>
                <option value="150000">Rp 150.000</option>
                <option value="200000">Rp 200.000</option>
                <option value="250000">Rp 250.000</option>
                <option value="300000">Rp 300.000</option>
                <option value="350000">Rp 350.000</option>
              </select>

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

export default TambahDataSiswa;
