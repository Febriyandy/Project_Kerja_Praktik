import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../../Components/NavbarAdmin";
import axios from "axios";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import TambahArusDonatur from "./TambahArusDonatur";
import { MdDeleteOutline } from "react-icons/md";
import Swal from "sweetalert2";
import { exportToPDF } from "../../../utils/ExportToPDF_Donatur";
import { exportToExcel } from "../../../utils/ExportToExcel_Donatur";
import ButtonPdf from "../../../Components/ButtonUnduhPdf";
import ButtonExcel from "../../../Components/ButtonUnduhExcel";
import ButtonTambah from "../../../Components/ButtonTambah";

const DetailDonatur = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [tahun_pelajaran, setTahun_pelajaran] = useState("");
  const [data_arusDonatur, setData_arusDonatur] = useState([]);
  const [filteredArusDonatur, setFilteredArusDonatur] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tambahDataArusDonatur, setTambahDataArusDonatur] = useState(null);
  const [currentSaldo, setCurrentSaldo] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalKredit, setTotalKredit] = useState(0);
  const [saldoAkhir, setSaldoAkhir] = useState(0);
  const [selectedBulan, setSelectedBulan] = useState(""); 
  const navigate = useNavigate();
  const { id } = useParams();

  const bulanOptions = [
    { value: "Juli", label: "Juli" },
    { value: "Agustus", label: "Agustus" },
    { value: "September", label: "September" },
    { value: "Oktober", label: "Oktober" },
    { value: "November", label: "November" },
    { value: "Desember", label: "Desember" },
    { value: "Januari", label: "Januari" },
    { value: "Februari", label: "Februari" },
    { value: "Maret", label: "Maret" },
    { value: "April", label: "April" },
    { value: "Mei", label: "Mei" },
    { value: "Juni", label: "Juni" },
  ];

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
    document.title = "Detail Arus Kas Yayasan";
  }, []);



  useEffect(() => {
      getDataArusDonatur();
      getDataDonaturYayasan();
  }, [id]);

  useEffect(() => {
    if (selectedBulan) {
      const filtered = data_arusDonatur.filter((item) => item.bulan === selectedBulan);
      setFilteredArusDonatur(filtered);
    } else {
      setFilteredArusDonatur(data_arusDonatur);
    }
  }, [selectedBulan, data_arusDonatur]);

  useEffect(() => {
    if (filteredArusDonatur.length > 0) {
      calculateTotal();
    }
  }, [filteredArusDonatur]);

  const calculateTotal = () => {
    const debitTotal = filteredArusDonatur.reduce((total, item) => total + item.debit, 0);
    const kreditTotal = filteredArusDonatur.reduce((total, item) => total + item.kredit, 0);
    const saldoAkhir = debitTotal - kreditTotal;
    setTotalDebit(debitTotal);
    setTotalKredit(kreditTotal);
    setSaldoAkhir(saldoAkhir);
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

  const getDataArusDonatur = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataArusDonatur/ByIdDonaturYayasan/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData_arusDonatur(response.data);

      if (response.data.length > 0) {
        const latestSaldo = response.data[response.data.length - 1].saldo;
        setCurrentSaldo(latestSaldo);
      } else {
        setCurrentSaldo(0);
      }
    } catch (error) {
      console.error("Error fetching data Arus Donatur:", error);
    }
  };

  const getDataDonaturYayasan = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataDonatur/ById/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setTahun_pelajaran(data.tahun_pelajaran);
    } catch (error) {
      console.error("Error fetching data Donatur yayasan:", error);
    }
  };

  const handleTambahDataClick = () => {
    setTambahDataArusDonatur(true);
  };

  const handleTambahDataComplete = () => {
    setTambahDataArusDonatur(null);
    getDataArusDonatur();
  };

  const handleDelete = (id) => {
    deleteArusDonatur(id);
  };

  const deleteArusDonatur = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        await axiosJWT.delete(`${import.meta.env.VITE_API_URL}/HapusArusDonatur/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        getDataArusDonatur();
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      }
    } catch (error) {
      console.error("Error deleting Arus Donatur:", error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
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
          <NavbarAdmin
          />
        </section>
        {tambahDataArusDonatur ? (
          <TambahArusDonatur
            id={id}
            currentSaldo={currentSaldo}
            onTambahComplate={handleTambahDataComplete}
          />
        ) : (
          <section className="w-11/12 mx-auto h-full mt-16">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center">
                <Link to="/admin/donatur" className="text-2xl">
                  <IoArrowBackCircleOutline />
                </Link>
                <p className="ml-4 font-body text-base font-bold text-secondary">{`Arus Kas Yayasan Majelis Dikdasmen Tahun Pelajaran ${tahun_pelajaran}`}</p>
              </div>
              <div className="flex gap-5">
                <ButtonExcel
                  onClick={() => exportToExcel(
                    filteredArusDonatur,
                    {tahunPelajaran :tahun_pelajaran}
                  )}
                >
                </ButtonExcel>
                <ButtonPdf
                  onClick={() => exportToPDF(
                    filteredArusDonatur,
                    {tahunPelajaran :tahun_pelajaran}
                  )}
              >
                </ButtonPdf>
                <ButtonTambah
                  onClick={handleTambahDataClick}
                  text="Tambah Data"
                >
                </ButtonTambah>
              </div>
            </div>
            <div className="w-full mx-auto mb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
              <div className="flex gap-2 items-center font-body mt-5 text-sm">
                <p>Filter Bulan:</p>
                <select
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm outline-none"
                >
                  <option value="">Semua Bulan</option>
                  {bulanOptions.map((bulan) => (
                    <option key={bulan.value} value={bulan.value}>
                      {bulan.label}
                    </option>
                  ))}
                </select>
              </div>
              <table className="w-full mb-10 mt-5 font-body text-xs text-secondary">
                <thead>
                  <tr className="border-y-2 border-gray-300">
                    <th className="font-medium py-4 px-4">NO</th>
                    <th className="font-medium py-4 px-4">TANGGAL</th>
                    <th className="font-medium py-4 px-4">KETERANGAN</th>
                    <th className="font-medium py-4 px-4">DEBIT</th>
                    <th className="font-medium py-4 px-4">KREDIT</th>
                    <th className="font-medium py-4 px-4">SALDO</th>
                    <th className="font-medium py-4 px-4">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArusDonatur.length > 0 ? (
                    filteredArusDonatur.map((item, index) => (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                      >
                        <td className="py-3 px-4 text-center">{index + 1}</td>
                        <td className="py-3 px-4 text-center">
                        {new Date(item.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.keterangan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.debit ? formatCurrency(item.debit) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.kredit ? formatCurrency(item.kredit) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {formatCurrency(item.saldo)}
                        </td>
                        <td className="py-3 px-4 justify-center flex gap-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 text-base text-white px-3 py-2 rounded-lg"
                          >
                            <MdDeleteOutline />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        Tidak ada data Donatur.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-y">
                    <td
                      className="px-2 py-3 font-bold text-center border-x"
                      colSpan="3"
                    >
                      Total
                    </td>
                    <td className="px-2 py-3 border-x text-center font-bold">
                      {formatCurrency(totalDebit)}
                    </td>
                    <td className="px-2 py-3 border-x text-center font-bold">
                      {formatCurrency(totalKredit)}
                    </td>
                    <td className="px-2 py-3 border-x text-center font-bold">
                      {formatCurrency(saldoAkhir)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}
      </section>
    </>
  );
};

export default DetailDonatur;
