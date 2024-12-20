import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../../Components/NavbarAdmin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { FaHandHoldingHeart } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";

const Infaq = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [data_InfaqYayasan, setData_InfaqYayasan] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [tahun_pelajaran, setTahunPelajaran] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

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

  useEffect(() => {
    document.title = 'Infaq';
    refreshToken();
  }, []);


  useEffect(() => {
    if (token) {
      getDataInfaqYayasan();
    }
  }, [token]);

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

  const getDataInfaqYayasan = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataInfaq`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });

      setData_InfaqYayasan(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const saveData = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("tahun_pelajaran", tahun_pelajaran);

      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/TambahInfaqYayasan`, formData, {
        headers: {
          "Content-type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil Membuat Infaq Baru!",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => {
        getDataInfaqYayasan();
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };



  return (
    <>
      <section className="flex pr-3 bg-backgroundColor">
      <section>
                <NavbarAdmin dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />
                </section>
        <section className="mt-16 w-11/12 mx-auto h-full">
          <div className="flex justify-between">
            <p className="font-body mt-3 text-base font-bold text-secondary ">Data Infaq Majelis Dikdasmen dan PNF Muhammadiyah Tanjungpinang</p>
            <button
              onClick={handlePopupOpen}
              className="mr-5 flex items-center gap-3 px-4 py-3 bg-[#00A9DC] hover:bg-primary rounded-md shadow-md font-body text-white text-xs"
            >
              <FaPlus className="bg-white rounded-sm text-lg p-1 text-primary"/>Tambah Periode Baru
            </button>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-5">
            {data_InfaqYayasan.map((data, index) => (
              <div key={index} className="p-3 h-40 rounded-lg bg-white shadow-md">
                <div className="flex justify-between">
                  
                  <p className="font-medium text-xs font-body text-gray-400 px-3 py-2">
                    
                    Tahun Pelajaran {data.tahun_pelajaran}
                  </p>
                  <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                    <FaHandHoldingHeart className="mx-auto text-3xl text-[#00A9DC]" />
                  </div>
                </div>
                <p className="font-semibold text-sm font-body text-secondary px-3 ">Saldo Akhir </p>
                <p className="font-semibold text-lg font-body text-secondary px-3">{formatCurrency(data.latestSaldo)}</p>
                <Link
                  to={`/admin/infaq/detail/${data.id}`}
                  className="py-2 px-6 bg-[#00A9DC] hover:bg-primary float-left text-white font-body text-xs rounded-md mt-2 font-medium"
                >
                  Lihat Selengkapnya
                </Link>
              </div>
            ))}
          </div>
        </section>
      </section>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-80 h-52 p-5 rounded-md shadow-lg">
            <h2 className="text-lg font-body font-bold mb-4">
              Tambah Infaq Periode Baru
            </h2>
            <form onSubmit={saveData} className="font-body text-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  id="tahun"
                  value={tahun_pelajaran}
                  onChange={(e) => setTahunPelajaran(e.target.value)}
                  className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="*Contoh 2024/2025"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePopupClose}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md shadow-md font-body text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary rounded-md shadow-md font-body text-white text-sm"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Infaq;
