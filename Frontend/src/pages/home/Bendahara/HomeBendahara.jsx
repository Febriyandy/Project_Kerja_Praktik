import React, { useState, useEffect } from 'react';
import NavbarBendahara from '../../../Components/NavbarBendahara';
import { MdOutlineSchool } from "react-icons/md";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { MdOutlinePayments } from "react-icons/md"
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import GrafikDanaBos from "../Admin/GrafikDanaBos";
import { FaHandHoldingHeart } from "react-icons/fa6";
import GrafikDanaSPP from "../Admin/GrafikDanaSPP";

const HomeBendahara = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [npsn, setNpsn] = useState(0);
  const [nama_sekolah, setNama_sekolah] = useState("");
  const [data_siswa, setData_siswa] = useState([]);
  const [data_kasSekolah, setData_kasSekolah] = useState([]);
  const [tahun_pelajaran, setTahun_pelajaran] = useState("");
  const [data_infaq, setData_Infaq] = useState([]);
  const [totalSiswa, setTotalSiswa] = useState(0); // State untuk menyimpan total siswa
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

  useEffect(() => {
    document.title = "Dashboard";
    refreshToken();
 }, []);

 useEffect(() => {
  if (npsn) {
      getDataSiswa();
      getDataInfaqYayasan();
      getDataKasSekolah();
  }
}, [npsn]);

const getDataKasSekolah = async () => {
  try {
    const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataKasSekolah/ByNPSN/${npsn}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Sort data to get the most recent academic year first
    const sortedData = response.data.sort((a, b) => {
      const [startYearA] = a.tahun_pelajaran.split("/");
      const [startYearB] = b.tahun_pelajaran.split("/");
      return parseInt(startYearB) - parseInt(startYearA);
    });

    // Take the first item as it has the most recent academic year
    const latestData = sortedData[0];

    setData_kasSekolah([latestData]);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};



  const getDataSiswa = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataSiswaSekolah/${npsn}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Urutkan data untuk mendapatkan tahun pelajaran terbaru
      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });

      // Ambil tahun pelajaran terbaru dan hitung total siswa
      const latestTahunPelajaran = sortedData.length > 0 ? sortedData[0].tahun_pelajaran : "";
      const totalSiswaTahunTerbaru = sortedData.filter(siswa => siswa.tahun_pelajaran === latestTahunPelajaran).length;

      setData_siswa(sortedData);
      setTahun_pelajaran(latestTahunPelajaran);
      setTotalSiswa(totalSiswaTahunTerbaru); // Simpan total siswa berdasarkan tahun terbaru
    } catch (error) {
      console.error("Error fetching siswa data:", error);
    }
  };

  const getDataInfaqYayasan = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataInfaq`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Sort data to get the most recent academic year first
      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });
  
      // Take the first item as it has the most recent academic year
      const latestData = sortedData[0];
  
      setData_Infaq([latestData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
          <NavbarBendahara />
        </section>
        <section className="mt-16 w-11/12 mx-auto h-full">
          <p className="font-body text-xl text-center font-bold text-secondary px-28 mt-5">
            SELAMAT DATANG DI SISTEM INFORMASI PEMBAYARAN SPP DAN KEUANGAN MAJELIS DIKDASMEN DAN PNF MUHAMMADIYAH TANJUNGPINANG
          </p>
          <div className="w-full bg-accent mt-5 bg-opacity-10 rounded-lg border-2 border-accent mx-auto grid grid-cols-4 gap-5 p-5">
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-sm font-body text-gray-400 py-2">
                  Total Seluruh Siswa <br /> {nama_sekolah}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlineSchool className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <p className="font-body -mt-2 text-center font-bold text-4xl">{totalSiswa}</p> {/* Menampilkan total siswa */}
              <p className="font-medium text-sm font-body text-gray-400 py-2">
                Tahun Pelajaran {tahun_pelajaran} 
              </p>
            </div>
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-sm font-body text-gray-400  py-2">
                  Riwayat <br /> Pembayaran SPP <br />{nama_sekolah}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <Link
                to="/bendahara/riwayat_spp"
                className="py-2 px-6 bg-accent mt-3 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-sm font-body text-gray-400  py-2">
                  Riwayat Pembayaran<br />  Gaji Guru<br />{nama_sekolah}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <Link
                to={`/bendahara/gaji_guru/${npsn}`}
                className="py-2 px-6 bg-accent mt-3 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-sm font-body text-gray-400  py-2">
                  Laporan Pendapatan<br /> Dana Bos <br />{nama_sekolah}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <Link
                to="/bendahara/laporan_dana_bos"
                className="py-2 px-6 bg-accent mt-3 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            {data_infaq.map((data, index) => (
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div  key={index} className="flex justify-between items-center">
                <p className="font-medium text-xs font-body text-gray-400  ">
                  Laporan Infaq<br />Tahun Pelajaran {data.tahun_pelajaran}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <FaHandHoldingHeart className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <p className="font-body mt-1 font-bold text-xl">{formatCurrency(data.latestSaldo)}</p>
              <Link
                to={`/bendahara/infaq/detail/${data.id}`}
                className="py-2 px-6 bg-accent mt-2 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            ))}
            {data_kasSekolah.map((data, index) => (
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div  key={index} className="flex justify-between items-center">
                <p className="font-medium text-xs font-body text-gray-400  ">
                  Arus Kas {nama_sekolah} <br />Tahun Pelajaran {data.tahun_pelajaran}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlineAccountBalanceWallet className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <p className="font-body mt-1 font-bold text-xl">{formatCurrency(data.latestSaldo)}</p>
              <Link
                to={`/bendahara/arus_kas/${npsn}/detail/${data.id}`}
                className="py-2 px-6 bg-accent mt-2 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            ))}
          </div>
          <div className="flex w-full gap-5 mx-auto mb-10">
          <div className="w-1/2 h-auto bg-accent mt-5 bg-opacity-10 rounded-lg border-2 border-accent p-3">
            <GrafikDanaBos></GrafikDanaBos>
          </div>
          <div className="w-1/2 h-auto bg-accent mt-5 bg-opacity-10 rounded-lg border-2 border-accent p-3">
            <GrafikDanaSPP></GrafikDanaSPP>
          </div>
          </div>
        </section>
      </section>
    </>
  );
};

export default HomeBendahara;
