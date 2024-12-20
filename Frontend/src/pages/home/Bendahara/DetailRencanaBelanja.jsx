import React, { useState, useEffect } from "react";
import NavbarBendahara from "../../../Components/NavbarBendahara";
import axios from "axios";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate, useParams, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import TambahBelanja from "./TambahBelanja";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import EditBelanja from "./EditBelanja";
import Swal from "sweetalert2";
import { exportToPDF } from "../../../utils/ExportToPDF_RencanaBelanja";
import ButtonPdf from "../../../Components/ButtonUnduhPdf";
import ButtonTambah from "../../../Components/ButtonTambah";

const DetailRencanaBelanja = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun_pelajaran, setTahun_pelajaran] = useState("");
  const [nama_sekolah, setNama_sekolah] = useState("");
  const [data_belanja, setData_Belanja] = useState([]);
  const [tambahDataBelanja, setTambahDataBelanja] = useState(null);
  const [editDataBelanja, setEditDataBelanja] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [msg, setMsg] = useState("");

  // Refresh Token
  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
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
    document.title = "Detail Belanja";
  }, []);

  useEffect(() => {
    if (token) {
      getDataBelanja();
      getDataPengajuan();
    }
  }, [token, id]);

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

  // Fetch Data Belanja
  const getDataBelanja = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataBelanjaByIdPengajuan/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      setData_Belanja(response.data);
    } catch (error) {
      console.error("Error fetching data belanja:", error);
    }
  };

  // Fetch Data Pengajuan based on the specific ID
  const getDataPengajuan = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataPengajuanById/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      setBulan(data.bulan);
      setTahun_pelajaran(data.tahun_pelajaran);
    } catch (error) {
      console.error("Error fetching data pengajuan:", error);
    }
  };

  const handleTambahDataClick = (id) => {
    setTambahDataBelanja(id);
  };

  const handleTambahDataComplete = () => {
    setTambahDataBelanja(null);
    getDataBelanja();
  };

  const handleEditDataClick = (id) => {
    setEditDataBelanja(id);
  };

  const handleEditDataComplete = () => {
    setEditDataBelanja(null);
    getDataBelanja();
  };

  const handleDelete = (id) => {
    deleteBelanja(id);
};

  const deleteBelanja = async (id) => {
    try {
      await axiosJWT.delete(`${import.meta.env.VITE_API_URL}/HapusBelanja/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil Menghapus Data!",
        showConfirmButton: false,
        timer: 2000,
      });
      getDataBelanja();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus Data!",
        text: error.message,
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalHarga = data_belanja.reduce((total, item) => total + item.total_harga, 0);

  return (
    <>
      <section className="flex pr-3">
        <section>
        <NavbarBendahara
        />
        </section>
        {tambahDataBelanja ? (
          <TambahBelanja
            id={tambahDataBelanja}
            onTambahComplate={handleTambahDataComplete}
          />
        ) : editDataBelanja ? (
          <EditBelanja
            id={editDataBelanja}
            onEditComplate={handleEditDataComplete}
          />
        ) : (
          <section className="w-11/12 mx-auto h-full mt-16">
              <div className="flex items-center">
                <Link to="/bendahara/rencana_belanja" className="text-2xl">
                  <IoArrowBackCircleOutline />
                </Link>
                <p className="ml-4 font-body text-base font-bold text-secondary">{`Rencana Belanja ${nama_sekolah} Periode Bulan ${bulan} Tahun Pelajaran ${tahun_pelajaran}`}</p>
              </div>
            <div className="flex gap-5 float-right my-5">
             
                <ButtonPdf
                  onClick={() => exportToPDF(
                    data_belanja,
                    {tahunPelajaran :tahun_pelajaran, nama_sekolah, periode:bulan}
                  )}
              >
                </ButtonPdf>
                <ButtonTambah
                  onClick={handleTambahDataClick}
                text="Tambah Barang"
                >
                </ButtonTambah>
              </div>
            <div className="w-full mx-auto mb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
              <table className="w-full my-10 font-body text-xs text-secondary">
                <thead>
                  <tr className="border-y-2 border-gray-300">
                    <th className="font-medium py-4 px-4">NO</th>
                    <th className="font-medium py-4 px-4">KODE NOTA</th>
                    <th className="font-medium py-4 px-4">TANGGAL PENGAJUAN</th>
                    <th className="font-medium py-4 px-4">NAMA BARANG</th>
                    <th className="font-medium py-4 px-4">JUMLAH BARANG</th>
                    <th className="font-medium py-4 px-4">HARGA SATUAN</th>
                    <th className="font-medium py-4 px-4">TOTAL HARGA</th>
                    <th className="font-medium py-4 px-4">STATUS PENGAJUAN</th>
                    <th className="font-medium py-4 px-4">KETERANGAN</th>
                    <th className="font-medium py-4 px-4">AKSI</th>
                  </tr>
                </thead>
                <tbody className="border-b">
                  {data_belanja.length > 0 ? (
                    data_belanja.map((belanja, index) => (
                      <tr
                        key={belanja.id}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                      >
                        <td className="py-3 px-4 text-center">{index + 1}</td>
                        <td className="py-3 px-4 text-center">
                          {belanja.kode_nota}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {belanja.tanggal_pengajuan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {belanja.nama_barang}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {belanja.jumlah_barang}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {formatCurrency(belanja.harga_satuan)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {formatCurrency(belanja.total_harga)}
                        </td>
                        <td
                          className='py-3 px-4 text-center'
                        >
                         <p className={`${
                            belanja.status_pengajuan === "Belum disetujui"
                            ? "text-red-500 border-2 font-bold border-red-500 p-1 rounded-lg"
                            : belanja.status_pengajuan === "Disetujui"
                            ? "text-green-500 border-2 font-bold border-green-500 p-1 rounded-lg"
                            : belanja.status_pengajuan === "Tidak disetujui"
                            ? "text-blue-500 border-2 font-bold border-blue-500 p-1 rounded-lg"
                            : ""
                          }`}>{belanja.status_pengajuan}</p> 
                        </td>
                        <td className="py-3 px-4 text-center">
                          {belanja.keterangan}
                        </td>
                        <td className="py-3 px-4 justify-center flex gap-2">
                          <button
                            onClick={() => handleEditDataClick(belanja.id)}
                            className="bg-blue-500 text-base text-white px-3 py-2 rounded-lg"
                          >
                            <FaRegEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(belanja.id)}
                            className="bg-red-500 text-base text-white px-3 py-2 rounded-lg"
                          >
                            <MdDeleteOutline />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        Tidak ada data belanja.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-y">
                  <td className="px-2 py-3 font-bold text-center border-x" colSpan="2">
                      Total
                  </td>
                  <td className="px-2 py-3 border-x text-right font-bold" colSpan="8">
                      {formatCurrency(totalHarga)}
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

export default DetailRencanaBelanja;
