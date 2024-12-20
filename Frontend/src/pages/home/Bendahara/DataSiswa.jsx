import React, { useState, useEffect } from 'react';
import NavbarBendahara from '../../../Components/NavbarBendahara';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import TambahDataSiswa from './TambahDataSiswa';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import EditDataSiswa from './EditDataSiswa';
import Swal from "sweetalert2";
import { exportToPDF } from '../../../utils/ExportToPDF_DataSiswa';
import { exportToExcel } from '../../../utils/ExportToExcel_DataSiswa';
import ButtonTambah from '../../../Components/ButtonTambah';
import ButtonExcel from '../../../Components/ButtonUnduhExcel';
import ButtonPdf from '../../../Components/ButtonUnduhPdf';

const DataSiswa = () => {
    const [token, setToken] = useState("");
    const [expire, setExpire] = useState("");
    const [npsn, setNpsn] = useState(0);
    const [nama_sekolah, setNama_sekolah] = useState("");
    const [data_siswa, setData_siswa] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tahunPelajaran, setTahunPelajaran] = useState([]);
    const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
    const [tambahDataSiswa, setTambahDataSiswa] = useState(null);
    const [editDataSiswa, setEditDataSiswa] = useState(null);
    const { kelas } = useParams();
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
        document.title = 'Data Siswa';
        getTahunPelajaran();
    }, []);

    useEffect(() => {
        if (npsn) {
            getDataSiswa();
        }
    }, [npsn, selectedTahunPelajaran, kelas]);

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

    const getDataSiswa = async () => {
        try {
            const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataSiswaSekolah/${npsn}/${kelas}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData_siswa(response.data);
        } catch (error) {
            console.error("Error fetching siswa data:", error);
        }
    };

    const getTahunPelajaran = async () => {
        try {
            const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/TahunPelajaran`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const tahunPelajaranData = response.data;
            setTahunPelajaran(tahunPelajaranData);
            
            if (tahunPelajaranData.length > 0) {
                setSelectedTahunPelajaran(tahunPelajaranData[tahunPelajaranData.length - 1]);
            }
        } catch (error) {
            console.error("Error fetching tahun pelajaran data:", error);
        }
    };

    const deleteSiswa = async (siswa) => {
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
                // Encode tahun_pelajaran
                const encodedTahunPelajaran = encodeURIComponent(siswa.tahun_pelajaran);
    
                await axiosJWT.delete(`${import.meta.env.VITE_API_URL}/HapusDataSiswa/${siswa.nisn}/${encodedTahunPelajaran}/${npsn}/${kelas}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getDataSiswa();
                Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
            }
        } catch (error) {
            console.error("Error deleting Siswa:", error);
            Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
        }
    };
    

    const handleDelete = (siswa) => {
        deleteSiswa(siswa);
    };

    const filteredData = data_siswa.filter((siswa) =>
        (siswa.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        siswa.nisn.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedTahunPelajaran ? siswa.tahun_pelajaran === selectedTahunPelajaran : true)
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); 
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
        return pageNumbers.map(number => (
            <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={`px-2 py-1 rounded ${currentPage === number ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}
            >
                {number}
            </button>
        ));
    };

    const handleTambahDataClick = (kelas) => {
        setTambahDataSiswa(kelas);
    };

    const handleTambahDataComplete = () => {
        setTambahDataSiswa(null);
        getDataSiswa();
    };

    const handleEditDataClick = (nisn) => {
        setEditDataSiswa(nisn);
    };

    const handleEditDataComplete = () => {
        setEditDataSiswa(null);
        getDataSiswa();
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
            <section className='flex pr-3'>
            <section>
            <NavbarBendahara />
            </section>
                {tambahDataSiswa ? (
                    <TambahDataSiswa
                        kelas={tambahDataSiswa}
                        onTambahComplate={handleTambahDataComplete}
                    />
                ) : editDataSiswa ? (
                    <EditDataSiswa 
                        nisn={editDataSiswa}
                        onEditComplate={handleEditDataComplete}
                    />
                ) : (
                    <section className='w-11/12 mx-auto h-full mt-16'>
                    <div className='flex justify-between'>
                        <p className='font-body text-base font-bold text-secondary '>{`Data Siswa ${nama_sekolah} Muhammadiyah ${kelas} Tahun Pelajaran ${selectedTahunPelajaran}`}</p>
                        <div className="flex gap-5 my-3 ">
            <ButtonExcel
              onClick={() => exportToExcel(filteredData, {
                tingkatSekolah: nama_sekolah,
                tahunPelajaran: selectedTahunPelajaran,
                tingkatKelas: kelas,
              })
            }
            >
            </ButtonExcel>
            <ButtonPdf
              onClick={() =>
                exportToPDF(filteredData, {
                  tingkatSekolah: nama_sekolah,
                  tahunPelajaran: selectedTahunPelajaran,
                  tingkatKelas: kelas,
                })
              }
            >
            </ButtonPdf>
            <ButtonTambah text="Tambah Data Baru" onClick={() => handleTambahDataClick(kelas)}></ButtonTambah>

            </div>
                        
                    </div>
                    <div className='w-full mx-auto mb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto'>
                        <div className='flex justify-between items-center my-5 font-body'>
                            <div>
                                <label className='mr-2 text-sm'>Show</label>
                                <select value={itemsPerPage} onChange={handleItemsPerPageChange} className='border outline-none border-gray-300 rounded-md px-2 py-1 text-sm'>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <label className='ml-2 text-sm'>entries</label>
                            </div>
                            <div className='flex gap-2 items-center text-sm'>
                                <p>Tahun Pelajaran:</p>
                                <select
                                    value={selectedTahunPelajaran}
                                    onChange={(e) => setSelectedTahunPelajaran(e.target.value)}
                                    className='border border-gray-300 rounded-md px-3 py-1 text-sm outline-none'
                                >
                                    <option value="">Semua</option>
                                    {tahunPelajaran.map((tahun) => (
                                        <option key={tahun} value={tahun}>{tahun}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex gap-2 items-center text-sm'>
                                <p>Search:</p>
                                <input
                                    type="text"
                                    placeholder="Search by Name or NISN..."
                                    className='border border-gray-300 rounded-md px-3 py-1 text-sm outline-none'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <table className='w-full mt-5 font-body text-xs text-secondary'>
                            <thead>
                                <tr className='border-y-2 border-gray-300'>
                                    <th className='font-medium py-4 px-4'>NO</th>
                                    <th className='font-medium py-4 px-4'>NISN</th>
                                    <th className='font-medium py-4 px-4'>NAMA SISWA</th>
                                    <th className='font-medium py-4 px-4'>NAMA ORANG TUA</th>
                                    <th className='font-medium py-4 px-4'>NO HP ORANG TUA</th>
                                    <th className='font-medium py-4 px-4'>BIAYA SPP</th>
                                    <th className='font-medium py-4 px-4'>AKSI</th>
                                </tr>
                            </thead>
                            <tbody className='border-b'>
                                {currentData.length > 0 ? (
                                    currentData.map((siswa, index) => (
                                        <tr key={siswa.nisn} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                            <td className='py-3 px-4 text-center'>{indexOfFirstItem + index + 1}</td>
                                            <td className='py-3 px-4 text-center'>{siswa.nisn}</td>
                                            <td className='py-3 px-4 text-center'>{siswa.nama_siswa}</td>
                                            <td className='py-3 px-4 text-center'>{siswa.nama_orangtua}</td>
                                            <td className='py-3 px-4 text-center'>{siswa.no_hp_orangtua}</td>
                                            <td className='py-3 px-4 text-center'>{formatCurrency(siswa.biaya_spp)}</td>
                                            <td className='py-3 px-4 justify-center flex gap-2'>
                                                <button onClick={() => handleEditDataClick(siswa.nisn)} className='bg-blue-500 text-base text-white px-3 py-2 rounded-lg'><FaRegEdit/></button>
                                                <button onClick={() => handleDelete(siswa)} className='bg-red-500 text-base text-white px-3 py-2 rounded-lg'><MdDeleteOutline/></button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className='text-center py-4'>
                                            Tidak ada data siswa.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className='flex justify-between items-center my-5 font-body text-sm'>
                            <div>
                                {`Showing ${indexOfFirstItem + 1} to ${indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem} of ${filteredData.length} entries`}
                            </div>
                            <div className='flex items-center space-x-2'>
                                <button
                                    className='px-4 py-1 bg-gray-200 rounded-md shadow-md text-sm'
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {renderPageNumbers()}
                                <button
                                    className='px-4 py-1 bg-gray-200 rounded-md shadow-md text-sm'
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                )}
            </section>
            
        </>
    );
};

export default DataSiswa;
