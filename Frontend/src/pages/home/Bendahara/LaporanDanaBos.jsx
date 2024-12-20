import React, { useState, useEffect } from "react";
import NavbarBendahara from "../../../Components/NavbarBendahara";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { exportToExcel } from "../../../utils/ExportToExcel_DanaBos";
import { exportToPDF } from "../../../utils/ExportToPDF_DanaBos";
import ButtonPdf from "../../../Components/ButtonUnduhPdf";
import ButtonExcel from "../../../Components/ButtonUnduhExcel";

const LaporanDanaBosBendahara = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [npsn, setNpsn] = useState(0);
  const [nama_sekolah, setNama_sekolah] = useState("");
  const [dana_bos, setDana_Bos] = useState([]);
  const [tahunPelajaran, setTahunPelajaran] = useState([]);
  const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
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
    refreshToken();
    document.title = 'Laporan Dana Bos';
    getTahunPelajaran();
  }, []);

  useEffect(() => {
    if (npsn) {
      getDana_Bos(); 
    }
  }, [npsn, selectedTahunPelajaran]);


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

  const getDana_Bos = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataDanaBosByNpsn/${npsn}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDana_Bos(response.data);
    } catch (error) {
      console.error("Error fetching siswa data:", error);
    }
  };

  const getTahunPelajaran = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/TahunPelajaranArusKas`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tahunPelajaranData = response.data;
      setTahunPelajaran(tahunPelajaranData);

      if (tahunPelajaranData.length > 0) {
        setSelectedTahunPelajaran(
          tahunPelajaranData[tahunPelajaranData.length - 1]
        );
      }
    } catch (error) {
      console.error("Error fetching tahun pelajaran data:", error);
    }
  };

  const filteredDanaBos = dana_bos.filter((danabos) =>
    (selectedTahunPelajaran ? danabos.tahun_pelajaran === selectedTahunPelajaran : true)
  );

  const calculateTotalDanaBos = () => {
    return filteredDanaBos.reduce((total, item) => total + item.dana_bos, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      <section className="flex pr-3">
        <section>
          <NavbarBendahara
          />
        </section>
        <section className="w-full h-full mt-16">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <Link to="/bendahara" className="text-2xl">
                <IoArrowBackCircleOutline />
              </Link>
              <p className="font-body text-base font-bold text-secondary">
                Laporan Pendapatan Dana Bos {nama_sekolah}
              </p>
            </div>
            <div className="flex gap-5">
              <ButtonExcel
                onClick={() =>
                  exportToExcel(
                    filteredDanaBos,
                    { tahunPelajaran: selectedTahunPelajaran, npsn }
                  )
                }
            >
              </ButtonExcel>
              <ButtonPdf
                onClick={() =>
                  exportToPDF(
                    filteredDanaBos,
                    { tahunPelajaran: selectedTahunPelajaran, npsn }
                  )
                }
              >
              </ButtonPdf>
            </div>
          </div>
          <div className="mx-auto w-4/5 pb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
            <div className="flex justify-between items-center my-5 font-body">
              <div className="flex gap-2 items-center text-sm">
                <p>Tahun Pelajaran:</p>
                <select
                  value={selectedTahunPelajaran}
                  onChange={(e) => setSelectedTahunPelajaran(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm outline-none"
                >
                  <option value="">Semua</option>
                  {tahunPelajaran.map((tahun) => (
                    <option key={tahun} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="font-body text-xs text-secondary w-full min-w-max">
                <thead>
                  <tr className="border-y border-gray-300 bg-gray-100">
                    <th className="font-medium py-2 px-4 border-x">No</th>
                    <th className="font-medium py-2 px-4 border-x">BULAN</th>
                    <th className="font-medium py-2 px-4 border-x">DANA BOS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDanaBos.length > 0 ? (
                    filteredDanaBos.map((item, index) => (
                      <tr
                        key={item.id} className="border-y border-gray-300">
                        <td className="py-3 px-4 text-center border-x">{index + 1}</td>
                        <td className="py-3 px-4 text-center border-x">{item.bulan}</td>
                        <td className="py-3 px-4 text-center border-x">
                          {formatCurrency(item.dana_bos)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        Tidak ada data Dana Bos.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-y border-gray-300">
                    <td className="font-medium py-2 px-4 text-center border-x" colSpan="2">Total</td>
                    <td className="font-medium py-2 px-4 text-center border-x">
                      {formatCurrency(calculateTotalDanaBos())}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default LaporanDanaBosBendahara;
