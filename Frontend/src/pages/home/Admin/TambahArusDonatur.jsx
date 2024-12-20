import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";

const TambahArusDonatur = ({ onTambahComplate, currentSaldo }) => { // Mengambil currentSaldo sebagai properti
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [bulan, setBulan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [transactionType, setTransactionType] = useState(""); // State untuk tipe transaksi
  const [nominal, setNominal] = useState(""); // State untuk nilai nominal
  const [formattedNominal, setFormattedNominal] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

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

    const nominalValue = parseFloat(nominal);
    let updatedSaldo = currentSaldo;

    if (transactionType === "Debit") {
      updatedSaldo += nominalValue;
    } else if (transactionType === "Kredit") {
      updatedSaldo -= nominalValue;
    }

    try {
      const formData = new FormData();
      formData.append("id_donaturYayasan", id);
      formData.append("bulan", bulan);
      formData.append("tanggal", tanggal);
      formData.append("keterangan", keterangan);
      formData.append("saldo", updatedSaldo);
      formData.append("debit", transactionType === "Debit" ? nominalValue : "");
      formData.append("kredit", transactionType === "Kredit" ? nominalValue : "");

      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/TambahArusDonatur/${id}`, formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Data Keuangan Tersimpan!",
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

  const handleNominalChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setNominal(value);
    setFormattedNominal(formatNumber(value));
  };

  return (
    <>
      <section className="w-11/12 mx-auto h-full mt-16">
        
          <button onClick={onTambahComplate} className="text-2xl mt-1">
            <IoArrowBackCircleOutline />
          </button>
     
        <div className="w-1/2 -mt-7 h-auto mx-12 rounded-lg shadow-md">
          <div className="w-full flex h-12 bg-primary rounded-t-lg">
            <p className="font-body font-medium text-white my-auto px-5 ">
              Form Tambah Donatur atau Keuangan
            </p>
          </div>
          <form onSubmit={saveData} className="px-5 py-3 font-body text-sm">
            <label>Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
            >
              <option value="" hidden>
                Pilih Bulan
              </option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
            </select>
            <label>Tanggal</label>
            <input
              type="date"
              id="tanggal"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              placeholder="Masukkan Tanggal"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Keterangan</label>
            <input
              type="text"
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Masukkan Keterangan"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <label>Debit/Kredit</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary "
            >
              <option value="" hidden>
                Pilih Status
              </option>
              <option value="Debit">Debit</option>
              <option value="Kredit">Kredit</option>
            </select>
            <label>Nominal</label>
            <input
              type="text"
              id="nominal"
              value={formattedNominal}
              onChange={handleNominalChange}
              placeholder="*Contoh 100000"
              className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end">
              <button
                className="px-3 py-2 rounded-lg text-white bg-primary"
                type="submit"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default TambahArusDonatur;
