import React, { useState, useEffect } from "react";
import NavbarYayasan from "../../../Components/NavbarYayasan";
import { MdOutlinePayments } from "react-icons/md";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate} from "react-router-dom";
import jwt_decode from "jwt-decode";
import { FaHandHoldingHeart } from "react-icons/fa6";
import GrafikDanaBos from "../Admin/GrafikDanaBos";
import GrafikDanaSPP from "../Admin/GrafikDanaSPP";

const HomeYayasan = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [data_kasSekolahSD, setData_kasSekolahSD] = useState([]);
  const [data_kasSekolahSMP, setData_kasSekolahSMP] = useState([]);
  const [data_kasSekolahSMA, setData_kasSekolahSMA] = useState([]);
  const [totalKasYayasan, setTotalKasYayasan] = useState(0);
  const [data_donatur, setData_Donatur] = useState([]);
  const [data_infaq, setData_Infaq] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    document.title = "Dashboard";
    refreshToken();
  });

  useEffect(() => {
    if (token) {
      getDataKasSekolahSD();
      getDataKasSekolahSMP();
      getDataKasSekolahSMA();
      getDataInfaqYayasan();
      getDataDonaturYayasan();
    }
  }, [token]);

  useEffect(() => {
    if (
      data_kasSekolahSD.length > 0 ||
      data_kasSekolahSMP.length > 0 ||
      data_kasSekolahSMA.length > 0 || data_donatur.length > 0
    ) {
      calculateTotalKasYayasan();
    }
  }, [data_kasSekolahSD, data_kasSekolahSMP, data_kasSekolahSMA, data_donatur]);

  const getDataKasSekolahSD = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataKasSekolah/ByNPSN/11001970`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sort data to get the most recent academic year first
      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });

      // Take the first item as it has the most recent academic year
      const latestData = sortedData[0];

      setData_kasSekolahSD([latestData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDataKasSekolahSMP = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataKasSekolah/ByNPSN/11001860`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sort data to get the most recent academic year first
      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });

      // Take the first item as it has the most recent academic year
      const latestData = sortedData[0];

      setData_kasSekolahSMP([latestData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDataKasSekolahSMA = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataKasSekolah/ByNPSN/11001974`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sort data to get the most recent academic year first
      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });

      // Take the first item as it has the most recent academic year
      const latestData = sortedData[0];

      setData_kasSekolahSMA([latestData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDataDonaturYayasan = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataDonatur`, {
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
  
      setData_Donatur([latestData]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateTotalKasYayasan = () => {
    const totalSD = data_kasSekolahSD.reduce((total, data) => total + data.latestSaldo, 0);
    const totalSMP = data_kasSekolahSMP.reduce((total, data) => total + data.latestSaldo, 0);
    const totalSMA = data_kasSekolahSMA.reduce((total, data) => total + data.latestSaldo, 0);
    const totalDonatur = data_donatur.reduce((total, data) => total + data.latestSaldo, 0);
    setTotalKasYayasan(totalSD + totalSMP + totalSMA + totalDonatur);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
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

  return (
    <>
      <section className="flex pr-3">
        <section>
          <NavbarYayasan />
        </section>

        <section className="mt-16 min-w-0  mx-auto h-full">
          <p className="font-body text-xl text-center font-bold text-secondary px-28 mt-5">
            SELAMAT DATANG DI SISTEM INFORMASI PEMBAYARAN SPP DAN KEUANGAN
            MAJELIS DIKDASMEN DAN PNF MUHAMMADIYAH TANJUNGPINANG
          </p>
          <div className="flex w-full ">
          <div className="w-full bg-accent mt-5 bg-opacity-10 rounded-lg border-2 border-accent mx-auto grid grid-cols-4 gap-5 p-5">
              <div className="h-36 p-3  bg-white shadow-md rounded-md">
                <div className="flex justify-between ">
                  <p className="font-medium text-xs font-body text-gray-400  py-2">
                    Laporan Keuangan Yayasan <br /> Total Saldo
                  </p>
                  <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                    <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                  </div>
                </div>
                <p className="font-body  font-bold text-xl">
                  {formatCurrency(totalKasYayasan)}
                </p>
                <Link
                  to="/yayasan/laporan_keuangan"
                  className="py-2 px-6 bg-accent mt-3 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
                >
                  Lihat Selengkapnya
                </Link>
              </div>
              <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-sm font-body text-gray-400  py-2">
                  Laporan Pendapatan<br /> Dana Bos
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <Link
                to="/yayasan/laporan_dana_bos"
                className="py-2 px-6 bg-accent mt-8 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div className="flex justify-between">
                <p className="font-medium text-sm font-body text-gray-400  py-2">
                  Riwayat Pembayaran<br />  Gaji Guru<br />
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <Link
                to="/yayasan/gaji_guru"
                className="py-2 px-6 bg-accent mt-8 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            {data_infaq.map((data, index) => (
            <div className="h-36 p-3 bg-white shadow-md rounded-md">
              <div  key={index} className="flex justify-between items-center">
                <p className="font-medium text-xs font-body text-gray-400  ">
                  Laporan Infaq Yayasan <br />Tahun Pelajaran {data.tahun_pelajaran}
                </p>
                <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                  <FaHandHoldingHeart className="mx-auto text-3xl text-[#00A9DC]" />
                </div>
              </div>
              <p className="font-body mt-1 font-bold text-xl">{formatCurrency(data.latestSaldo)}</p>
              <Link
                to={`/yayasan/infaq/detail/${data.id}`}
                className="py-2 px-6 bg-accent mt-2 hover:bg-primary float-left text-white font-body text-xs rounded-md font-medium"
              >
                Lihat Selengkapnya
              </Link>
            </div>
            ))}
            </div>
          </div>
          <div className="flex gap-5 mb-10">
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

export default HomeYayasan;
