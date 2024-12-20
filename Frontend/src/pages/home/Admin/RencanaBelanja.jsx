import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../../Components/NavbarAdmin";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { MdOutlinePayments } from "react-icons/md";
import { Link } from "react-router-dom";

const RencanaBelanjaAdmin = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [data_pengajuan, setData_pengajuan] = useState([]);
  const [nama_sekolah, setNama_sekolah] = useState("");
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { npsn } = useParams();

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

  const determineNamaSekolah = (npsn) => {
    switch (npsn) {
      case "11001860":
        return "SMP";
      case "11001974":
        return "SMA";
      case "11001970":
        return "SD";
      default:
        return "Sekolah";
    }
  };

  useEffect(() => {
    document.title = 'Rencana Belanja';
    refreshToken();
  }, []);

  useEffect(() => {
    if (npsn) {
      setNama_sekolah(determineNamaSekolah(npsn));
      getDataPengajuan();
    }
  }, [npsn]);

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

  const getDataPengajuan = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataPengajuanByNPSN/${npsn}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedData = response.data.sort((a, b) => {
        const [startYearA] = a.tahun_pelajaran.split("/");
        const [startYearB] = b.tahun_pelajaran.split("/");
        return parseInt(startYearB) - parseInt(startYearA);
      });

      setData_pengajuan(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  return (
    <>
      <section className="flex pr-3">
      <section>
                <NavbarAdmin dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />
                </section>
        <section className="mt-16 w-11/12 mx-auto h-full">
          <div className="flex justify-between">
            <p className="font-body text-base font-bold text-secondary ">{`Rencana Belanja ${nama_sekolah} Muhammadiyah Tanjungpinang`}</p>
            
          </div>
          <div className="mt-5 grid grid-cols-4 gap-5">
            {data_pengajuan.map((data, index) => (
               <div key={index} className="p-3 h-32 rounded-lg bg-white shadow-md">
                <div className="flex justify-between">
                  
                  <p className="font-medium text-xs font-body text-gray-400 px-3 py-2">
                    Periode {data.bulan} <br />
                    Tahun Pelajaran {data.tahun_pelajaran}
                  </p>
                  <div className="w-14 h-12 flex items-center bg-[#00A9DC] bg-opacity-10 rounded-md">
                    <MdOutlinePayments className="mx-auto text-3xl text-[#00A9DC]" />
                  </div>
                </div>
                <Link
                  to={`/admin/rencana_belanja/${npsn}/detail/${data.id}`}
                  className="py-2 px-6 bg-[#00A9DC] hover:bg-primary float-left text-white font-body text-xs rounded-md mt-2 font-medium"
                >
                  Lihat Selengkapnya
                </Link>
              </div>
            ))}
          </div>
        </section>
      </section>
    </>
  );
};

export default RencanaBelanjaAdmin;
