import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../../Components/NavbarAdmin";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { exportToExcel } from "../../../utils/ExportToExcel_LaporanSPP";
import { exportToPDF } from "../../../utils/ExportToPDF_LaporanSPP";
import ButtonExcel from "../../../Components/ButtonUnduhExcel";
import ButtonPdf from "../../../Components/ButtonUnduhPdf";

const LaporanSPP = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [data_siswa_sd, setData_siswaSD] = useState([]);
  const [data_siswa_smp, setData_siswaSMP] = useState([]);
  const [data_siswa_sma, setData_siswaSMA] = useState([]);
  const [tahunPelajaran, setTahunPelajaran] = useState([]);
  const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  useEffect(() => {
    refreshToken();
    document.title = 'Laporan SPP';
    getTahunPelajaran();
  }, []);

  useEffect(() => {
    getDataSiswaSD();
    getDataSiswaSMP();
    getDataSiswaSMA();
  }, [selectedTahunPelajaran]);

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

  const getDataSiswaSD = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataSPPsekolah/11001970`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData_siswaSD(response.data);
    } catch (error) {
      console.error("Error fetching siswa data:", error);
    }
  };

  const getDataSiswaSMP = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataSPPsekolah/11001860`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData_siswaSMP(response.data);
    } catch (error) {
      console.error("Error fetching siswa data:", error);
    }
  };

  const getDataSiswaSMA = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataSPPsekolah/11001974`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData_siswaSMA(response.data);
    } catch (error) {
      console.error("Error fetching siswa data:", error);
    }
  };

  const getTahunPelajaran = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/TahunPelajaran`,
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

  const filteredDataSD = data_siswa_sd.filter((siswa) =>
    selectedTahunPelajaran
      ? siswa.tahun_pelajaran === selectedTahunPelajaran
      : true
  );

  const filteredDataSMP = data_siswa_smp.filter((siswa) =>
    selectedTahunPelajaran
      ? siswa.tahun_pelajaran === selectedTahunPelajaran
      : true
  );

  const filteredDataSMA = data_siswa_sma.filter((siswa) =>
    selectedTahunPelajaran
      ? siswa.tahun_pelajaran === selectedTahunPelajaran
      : true
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateTotalsSD = (data) => {
    return data.reduce(
      (totals, siswaSD) => {
        totals.juli += siswaSD.juli || 0;
        totals.agustus += siswaSD.agustus || 0;
        totals.september += siswaSD.september || 0;
        totals.oktober += siswaSD.oktober || 0;
        totals.november += siswaSD.november || 0;
        totals.desember += siswaSD.desember || 0;
        totals.januari += siswaSD.januari || 0;
        totals.februari += siswaSD.februari || 0;
        totals.maret += siswaSD.maret || 0;
        totals.april += siswaSD.april || 0;
        totals.mei += siswaSD.mei || 0;
        totals.juni += siswaSD.juni || 0;
        return totals;
      },
      {
        juli: 0,
        agustus: 0,
        september: 0,
        oktober: 0,
        november: 0,
        desember: 0,
        januari: 0,
        februari: 0,
        maret: 0,
        april: 0,
        mei: 0,
        juni: 0,
      }
    );
  };

  const totals_SD = calculateTotalsSD(filteredDataSD);

  const calculateTotalsSMP = (data) => {
    return data.reduce(
      (totals, siswaSMP) => {
        totals.juli += siswaSMP.juli || 0;
        totals.agustus += siswaSMP.agustus || 0;
        totals.september += siswaSMP.september || 0;
        totals.oktober += siswaSMP.oktober || 0;
        totals.november += siswaSMP.november || 0;
        totals.desember += siswaSMP.desember || 0;
        totals.januari += siswaSMP.januari || 0;
        totals.februari += siswaSMP.februari || 0;
        totals.maret += siswaSMP.maret || 0;
        totals.april += siswaSMP.april || 0;
        totals.mei += siswaSMP.mei || 0;
        totals.juni += siswaSMP.juni || 0;
        return totals;
      },
      {
        juli: 0,
        agustus: 0,
        september: 0,
        oktober: 0,
        november: 0,
        desember: 0,
        januari: 0,
        februari: 0,
        maret: 0,
        april: 0,
        mei: 0,
        juni: 0,
      }
    );
  };

  const totals_SMP = calculateTotalsSMP(filteredDataSMP);

  const calculateTotalsSMA = (data) => {
    return data.reduce(
      (totals, siswaSMA) => {
        totals.juli += siswaSMA.juli || 0;
        totals.agustus += siswaSMA.agustus || 0;
        totals.september += siswaSMA.september || 0;
        totals.oktober += siswaSMA.oktober || 0;
        totals.november += siswaSMA.november || 0;
        totals.desember += siswaSMA.desember || 0;
        totals.januari += siswaSMA.januari || 0;
        totals.februari += siswaSMA.februari || 0;
        totals.maret += siswaSMA.maret || 0;
        totals.april += siswaSMA.april || 0;
        totals.mei += siswaSMA.mei || 0;
        totals.juni += siswaSMA.juni || 0;
        return totals;
      },
      {
        juli: 0,
        agustus: 0,
        september: 0,
        oktober: 0,
        november: 0,
        desember: 0,
        januari: 0,
        februari: 0,
        maret: 0,
        april: 0,
        mei: 0,
        juni: 0,
      }
    );
  };

  const totals_SMA = calculateTotalsSMA(filteredDataSMA);

  return (
    <>
      <section className="flex pr-3">
        <section>
          <NavbarAdmin
            dropdownOpen={dropdownOpen}
            setDropdownOpen={setDropdownOpen}
          />
        </section>
        <section className="min-w-0 h-full mt-16">
          <div className="flex justify-between">
          <div className="flex gap-4">
          <Link to="/admin" className="text-2xl">
                  <IoArrowBackCircleOutline />
                </Link>
            <p className="font-body text-base font-bold text-secondary ">
              Laporan Pendapatan SPP
            </p>
          </div>
            <div className="flex gap-5">
              <ButtonExcel
                onClick={() =>
                  exportToExcel(
                    totals_SD,
                        totals_SMP,
                        totals_SMA,
                        {
                          tahunPelajaran: selectedTahunPelajaran,
                        }
                      )
                }
              >
              </ButtonExcel>
              <ButtonPdf
                onClick={() =>
                    exportToPDF(
                        totals_SD,
                        totals_SMP,
                        totals_SMA,
                        {
                          tahunPelajaran: selectedTahunPelajaran,
                        }
                      )
                }
                >
              </ButtonPdf>
            </div>
          </div>
          <div className=" mx-auto pb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
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
              <table className=" font-body text-xs text-secondary w-full min-w-max">
                <thead>
                  <tr className="border-y border-gray-300 bg-gray-100">
                    <th rowSpan="2" className="font-medium py-2 px-4 border-x  border-y border-gray-300">
                      No
                    </th>
                    <th rowSpan="2" className="font-medium py-2 px-4 border-x border-y border-gray-300">
                      SEKOLAH
                    </th>
                    <th colSpan="12" className="py-2 border-x border-y border-gray-300">
                      BULAN
                    </th>
                    <th rowSpan="2" className="font-medium py-2 px-4 border-x border-y border-gray-300 ">
                      TOTAL PERTAHUN
                    </th>
                  </tr>
                  <tr className="bg-gray-100 ">
                    <th className="font-medium py-2 px-2 w-24">JULI</th>
                    <th className="font-medium py-2 px-2 w-24 border-x border-y border-gray-300">
                      AGUSTUS
                    </th>
                    <th className="font-medium py-2 px-2 w-24">SEPTEMBER</th>
                    <th className="font-medium py-2 px-2 w-24 border-x border-y border-gray-300">
                      OKTOBER
                    </th>
                    <th className="font-medium py-2 px-2 w-24">NOVEMBER</th>
                    <th className="font-medium py-2 px-2 w-24 border-x border-y border-gray-300">
                      DESEMBER
                    </th>
                    <th className="font-medium py-2 px-2 w-24">JANUARI</th>
                    <th className="font-medium py-2 px-2 w-24 border-x border-y border-gray-300">
                      FEBRUARI
                    </th>
                    <th className="font-medium py-2 px-2 w-24">MARET</th>
                    <th className="font-medium py-2 px-2 w-24 border-x border-y border-gray-300">
                      APRIL
                    </th>
                    <th className="font-medium py-2 px-2 w-24">MEI</th>
                    <th className="font-medium py-2 px-2 w-24 border-x border-y border-gray-300">
                      JUNI
                    </th>
                  </tr>
                  
                </thead>
                <tbody>
                  <tr className="border-y">
                    <td className="py-3 px-2 border-x border-y border-gray-300 text-center">1</td>
                    <td className="py-3 px-2 border-x border-y border-gray-300">SD MUHAMMADIYAH</td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.juli)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SD.agustus)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.september)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SD.oktober)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.november)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SD.desember)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.januari)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SD.februari)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.maret)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SD.april)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.mei)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SD.juni)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                    {formatCurrency(Object.values(totals_SD).reduce((a, b) => a + b, 0))}
                    </td>
                  </tr>
                  <tr className="border-y">
                    <td className="py-3 px-2 border-x border-y border-gray-300 text-center">2</td>
                    <td className="py-3 px-2 border-x border-y border-gray-300">SMP MUHAMMADIYAH</td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.juli)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMP.agustus)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.september)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMP.oktober)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.november)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMP.desember)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.januari)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMP.februari)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.maret)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMP.april)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.mei)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMP.juni)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                    {formatCurrency(Object.values(totals_SMP).reduce((a, b) => a + b, 0))}
                    </td>
                  </tr>
                  <tr className="border-y">
                    <td className="py-3 px-2 border-x border-y border-gray-300 text-center">3</td>
                    <td className="py-3 px-2 border-x border-y border-gray-300">SMA MUHAMMADIYAH</td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.juli)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMA.agustus)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.september)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMA.oktober)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.november)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMA.desember)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.januari)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMA.februari)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.maret)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals_SMA.april)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.mei)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                      {formatCurrency(totals_SMA.juni)}
                    </td>
                    <td className="px-2 py-3 border-x border-y border-gray-300">
                    {formatCurrency(Object.values(totals_SMA).reduce((a, b) => a + b, 0))}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
    <tr className="border-y font-semibold">
      <td colSpan="2" className="py-3 px-2 border-x border-y border-gray-300 text-center">TOTAL</td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.juli + totals_SMP.juli + totals_SMA.juli)}
      </td>
      <td className="px-2 py-3">
        {formatCurrency(totals_SD.agustus + totals_SMP.agustus + totals_SMA.agustus)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.september + totals_SMP.september + totals_SMA.september)}
      </td>
      <td className="px-2 py-3">
        {formatCurrency(totals_SD.oktober + totals_SMP.oktober + totals_SMA.oktober)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.november + totals_SMP.november + totals_SMA.november)}
      </td>
      <td className="px-2 py-3">
        {formatCurrency(totals_SD.desember + totals_SMP.desember + totals_SMA.desember)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.januari + totals_SMP.januari + totals_SMA.januari)}
      </td>
      <td className="px-2 py-3">
        {formatCurrency(totals_SD.februari + totals_SMP.februari + totals_SMA.februari)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.maret + totals_SMP.maret + totals_SMA.maret)}
      </td>
      <td className="px-2 py-3">
        {formatCurrency(totals_SD.april + totals_SMP.april + totals_SMA.april)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.mei + totals_SMP.mei + totals_SMA.mei)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(totals_SD.juni + totals_SMP.juni + totals_SMA.juni)}
      </td>
      <td className="px-2 py-3 border-x border-y border-gray-300">
        {formatCurrency(
          Object.values(totals_SD).reduce((a, b) => a + b, 0) +
          Object.values(totals_SMP).reduce((a, b) => a + b, 0) +
          Object.values(totals_SMA).reduce((a, b) => a + b, 0)
        )}
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

export default LaporanSPP;
