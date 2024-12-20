import React, { useState, useEffect } from "react";
import NavbarYayasan from "../../../Components/NavbarYayasan";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { exportToExcel } from "../../../utils/ExportToExcel_DataKeuangan";
import { exportToPDF } from "../../../utils/ExportToPDF_DataKeuangan";
import ButtonPdf from "../../../Components/ButtonUnduhPdf";
import ButtonExcel from "../../../Components/ButtonUnduhExcel";

const LaporanKeuanganYayasan = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [dataArusKas, setDataArusKas] = useState([]);
  const [dataArusDonatur, setDataArusDonatur] = useState([]);
  const [tahunPelajaran, setTahunPelajaran] = useState([]);
  const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
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
    document.title = "Laporan Keuangan";
    getTahunPelajaran();
  }, []);

  useEffect(() => {
    getDataArusKas();
    getDataArusDonatur();
  }, [selectedTahunPelajaran, selectedMonth]);

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

  const getDataArusKas = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataArusKasAll`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataArusKas(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDataArusDonatur = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataDonaturPerBulan`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDataArusDonatur(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const months = [
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
  ];

  const aggregateDataBySchool = (data) => {
    const aggregatedData = {};
    data.forEach((item) => {
      if (!aggregatedData[item.npsn]) {
        aggregatedData[item.npsn] = { ...item };
      } else {
        ["saldo_akhir_tahun" , "dana_bos", "dana_spp", "gaji_guru", "operasional", "lainnya"].forEach(
          (field) => {
            aggregatedData[item.npsn][field] =
              (aggregatedData[item.npsn][field] || 0) + (item[field] || 0);
          }
        );
      }
    });
    return Object.values(aggregatedData);
  };

  const aggregateDataArusDonatur = (data) => {
    return data.reduce((acc, item) => {
      acc.total_debit =
        (acc.total_debit || 0) + parseInt(item.total_debit || 0, 10);
      acc.total_kredit =
        (acc.total_kredit || 0) + parseInt(item.total_kredit || 0, 10);
      acc.saldo = (acc.saldo || 0) + parseInt(item.saldo || 0, 10);
      return acc;
    }, {});
  };

  const filteredDataArusKas = dataArusKas.filter(
    (aruskas) =>
      (selectedTahunPelajaran
        ? aruskas.tahun_pelajaran === selectedTahunPelajaran
        : true) &&
      ["11001970", "11001860", "11001974"].includes(aruskas.npsn.toString())
  );

  const processedDataArusKas =
    selectedMonth === ""
      ? aggregateDataBySchool(filteredDataArusKas)
      : filteredDataArusKas.filter(
          (aruskas) => aruskas.bulan === selectedMonth
        );
  
        // Urutkan data berdasarkan jenis sekolah dari SD, SMP, ke SMA
processedDataArusKas.sort((a, b) => {
  const order = { "11001970": 1, "11001860": 2, "11001974": 3 };
  return order[a.npsn] - order[b.npsn];
});


  const filteredDataArusDonatur = dataArusDonatur.filter((arusdonatur) =>
    selectedTahunPelajaran
      ? arusdonatur.tahun_pelajaran === selectedTahunPelajaran
      : true
  );

  const processedDataArusDonatur =
    selectedMonth === ""
      ? [aggregateDataArusDonatur(filteredDataArusDonatur)]
      : filteredDataArusDonatur.filter(
          (arusdonatur) => arusdonatur.bulan === selectedMonth
        );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const schoolNames = {
    11001970: "SD Muhammadiyah",
    11001860: "SMP Muhammadiyah",
    11001974: "SMA Muhammadiyah",
  };

  const calculateTotal = (key) => {
    const total = processedDataArusKas.reduce((sum, item) => {
      const value = item[key] || 0;
      return sum + value;
    }, 0);
    return total;
  };

  const calculateTotalDonatur = (key) => {
    const total = processedDataArusDonatur.reduce((sum, item) => {
      const value = item[key] || 0;
      return sum + value;
    }, 0);
    return total;
  };

  const totalPendapatanSekolah =
    parseInt(calculateTotal("dana_bos"), 10) +
    parseInt(calculateTotal("dana_spp"), 10) +
    parseInt(calculateTotal("saldo_akhir_tahun"), 10);

  const totalPengeluaranSekolah =
    parseInt(calculateTotal("gaji_guru"), 10) +
    parseInt(calculateTotal("operasional"), 10) +
    parseInt(calculateTotal("lainnya"), 10);

  const saldoSekolah = totalPendapatanSekolah - totalPengeluaranSekolah;

  const totalPendapatanKeseluruhan =
    parseInt(calculateTotalDonatur("total_debit"), 10) + totalPendapatanSekolah;

  const totalPengeluaranKeseluruhan =
    parseInt(calculateTotalDonatur("total_kredit"), 10) +
    totalPengeluaranSekolah;

  const sisaSaldoKeseluruhan =
    parseInt(calculateTotalDonatur("saldo"), 10) + saldoSekolah;

  const getValueOrDefault = (value) => {
    return value || 0;
  };

  return (
    <>
      <section className="flex pr-3">
        <section>
          <NavbarYayasan
          />
        </section>
        <section className="min-w-0 h-full mt-16">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <Link to="/yayasan" className="text-2xl text-secondary">
                <IoArrowBackCircleOutline />
              </Link>
              <p className="font-body text-base font-bold text-secondary">
                Laporan Keuangan Yayasan
              </p>
            </div>
            <div className="flex gap-5">
              <ButtonExcel
                onClick={() =>
                  exportToExcel(processedDataArusDonatur, processedDataArusKas, {
                    tahunPelajaran: selectedTahunPelajaran,
                  })
                }
              />
              <ButtonPdf
                onClick={() =>
                  exportToPDF(processedDataArusDonatur, processedDataArusKas, {
                    tahunPelajaran: selectedTahunPelajaran,
                  })
                }
              />
            </div>
          </div>
          <div className="mx-auto w-full pb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
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
              <table className="font-body text-xs text-secondary  min-w-max">
                <thead>
                  <tr className="border-y border-gray-300">
                    <th className="font-medium py-2 px-4 border-x">No</th>
                    <th className="font-medium py-2 px-4 border-x">SEKOLAH</th>
                    <th className="font-medium py-2 px-4 border-x">
                      SALDO AKHIR TAHUN
                    </th>
                    <th className="font-medium py-2 px-4 border-x">DANA BOS</th>
                    <th className="font-medium py-2 px-4  border-x">SPP</th>
                    <th className="font-medium py-2 px-4  border-x">
                      GAJI GURU
                    </th>
                    <th className="font-medium py-2 px-4 border-x">OPERASIONAL</th>
                    <th className="font-medium py-2 px-4 border-x">LAINNYA</th>
                    <th className="font-medium py-2 px-4  border-x">
                      PENDAPATAN
                    </th>
                    <th className="font-medium py-2 px-4  border-x">
                      PENGELUARAN
                    </th>
                    <th className="font-medium py-2 px-4  border-x">
                      SISA SALDO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processedDataArusKas.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-300">
                      <td className="py-2 px-4 border-x text-center">
                        {index + 1}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {schoolNames[item.npsn]}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(
                          getValueOrDefault(item.saldo_akhir_tahun)
                        )}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.dana_bos))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.dana_spp))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.gaji_guru))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.operasional))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.lainnya))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(
                          getValueOrDefault(item.dana_bos) +
                            getValueOrDefault(item.dana_spp) +
                            getValueOrDefault(item.saldo_akhir_tahun)
                        )}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(
                          getValueOrDefault(item.gaji_guru) +
                            getValueOrDefault(item.operasional) +
                            getValueOrDefault(item.lainnya)
                        )}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(
                          getValueOrDefault(item.dana_bos) +
                            getValueOrDefault(item.dana_spp) +
                            getValueOrDefault(item.saldo_akhir_tahun) -
                            (getValueOrDefault(item.gaji_guru) +
                              getValueOrDefault(item.operasional) +
                              getValueOrDefault(item.lainnya))
                        )}
                      </td>
                    </tr>
                  ))}

                  {processedDataArusDonatur.map((item, index) => (
                    <tr key={index} className="border-y border-gray-300">
                      <td className="py-2 px-4 border-x text-center">
                        {processedDataArusKas.length + 1}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        Kas Yayasan
                      </td>
                      <td className="py-2 px-4 border-x text-center"></td>
                      <td className="py-2 px-4 border-x text-center"></td>
                      <td className="py-2 px-4 border-x text-center"></td>
                      <td className="py-2 px-4 border-x text-center"></td>
                      <td className="py-2 px-4 border-x text-center"></td>
                      <td className="py-2 px-4 border-x text-center"></td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.total_debit))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.total_kredit))}
                      </td>
                      <td className="py-2 px-4 border-x text-center">
                        {formatCurrency(getValueOrDefault(item.saldo))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-y border-gray-300 font-bold">
                    <td className="py-2 px-4 border-x text-center" colSpan="2">
                      Total
                    </td>
                    <td className="py-2 px-4 border-x text-center"> {formatCurrency(calculateTotal("saldo_akhir_tahun"))}</td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(calculateTotal("dana_bos"))}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(
                        getValueOrDefault(calculateTotal("dana_spp"))
                      )}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(
                        getValueOrDefault(calculateTotal("gaji_guru"))
                      )}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(
                        getValueOrDefault(calculateTotal("operasional"))
                      )}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(
                        getValueOrDefault(calculateTotal("lainnya"))
                      )}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(
                        getValueOrDefault(totalPendapatanKeseluruhan)
                      )}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(
                        getValueOrDefault(totalPengeluaranKeseluruhan)
                      )}
                    </td>
                    <td className="py-2 px-4 border-x text-center">
                      {formatCurrency(getValueOrDefault(sisaSaldoKeseluruhan))}
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

export default LaporanKeuanganYayasan;
