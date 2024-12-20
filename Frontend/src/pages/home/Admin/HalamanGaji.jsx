import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../../Components/NavbarAdmin';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import { FaRegEdit } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";

const HalamanGaji = () => {
    const [token, setToken] = useState("");
    const [expire, setExpire] = useState("");
    const [data_guru, setData_guru] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tahunPelajaran, setTahunPelajaran] = useState([]);
    const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [nama_sekolah, setNama_sekolah] = useState("");
    const { npsn } = useParams();
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
        document.title = 'Pembayaran Gaji Guru';
        refreshToken();
        getTahunPelajaran();
    }, []);

    useEffect(() => {
        getDataGuru();
        setNama_sekolah(determineNamaSekolah(npsn));
    }, [selectedTahunPelajaran, npsn]);

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

    const getDataGuru = async () => {
        try {
            const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataGajiGuru/${npsn}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setData_guru(response.data);
        } catch (error) {
            console.error("Error fetching guru data:", error);
        }
    };

    const getTahunPelajaran = async () => {
        try {
            const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/TahunPelajaran/Guru`, {
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

    const filteredData = data_guru.filter((guru) =>
        (guru.nama_guru.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedTahunPelajaran ? guru.tahun_pelajaran === selectedTahunPelajaran : true)
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
        const maxPagesToShow = 2; // Total number of page numbers to show
    
        // Calculate the starting page number based on current page
        let startPage = Math.max(1, currentPage);
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
        // Adjust if we're near the start or end
        if (startPage === 1 && endPage < maxPagesToShow) {
            endPage = Math.min(maxPagesToShow, totalPages);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }
    
        // Add the first page
        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) {
                pageNumbers.push('...'); // Add ellipsis if there are skipped pages
            }
        }
    
        // Add the current pages
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
    
        // Add the last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push('...'); // Add ellipsis if there are skipped pages
            }
            pageNumbers.push(totalPages);
        }
    
        return pageNumbers.map((number, index) => (
            <button
                key={index}
                onClick={() => typeof number === 'number' && handlePageChange(number)}
                className={`px-2 py-1 rounded ${currentPage === number ? 'bg-primary text-white' : 'bg-gray-200 text-black'}`}
                disabled={typeof number !== 'number'} // Disable button if it's ellipsis
            >
                {number}
            </button>
        ));
    };
    

    const handleUpdatePembayaran = async (id_guru,  nama_guru,  gaji_guru,  tahun_pelajaran,   bulan) => {
        try {
            const confirmResult = await Swal.fire({
                title: 'Konfirmasi Pembayaran',
                text: `Apakah Anda yakin gaji guru A.N ${nama_guru} telah dibayarkan untuk bulan ${bulan.toUpperCase()}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Sudah',
                cancelButtonText: 'Batal'
            });
    
            if (confirmResult.isConfirmed) {
                const updateData = { gaji_guru, bulan, tahun_pelajaran };
                await axiosJWT.patch(`${import.meta.env.VITE_API_URL}/UpdateGajiGuru/${id_guru}`, updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getDataGuru(); // Refresh data setelah update
                Swal.fire("Success", "Pembayaran Gaji berhasil!", "success");
    
            }
        } catch (error) {
            console.error("Error updating pembayaran:", error);
            Swal.fire("Error", "Gagal mengupdate pembayaran!", "error");
        }
    };

    const handleBatalPembayaran = async (id_guru,  nama_guru, tahun_pelajaran,   bulan) => {
        try {
            const confirmResult = await Swal.fire({
                title: 'Konfirmasi Pembatalan',
                text: `Apakah Anda yakin ingin membatalkan gaji guru A.N ${nama_guru} untuk bulan ${bulan.toUpperCase()}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Yakin',
                cancelButtonText: 'Batal'
            });
    
            if (confirmResult.isConfirmed) {
                const updateData = { bulan, tahun_pelajaran };
                await axiosJWT.patch(`${import.meta.env.VITE_API_URL}/BatalGajiGuru/${id_guru}`, updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getDataGuru(); // Refresh data setelah update
                Swal.fire("Success", "Pembatalan Gaji berhasil!", "success");
    
            }
        } catch (error) {
            console.error("Error updating pembayaran:", error);
            Swal.fire("Error", "Gagal mengupdate pembayaran!", "error");
        }
    };

    const handleEditClick = (guru, bulan) => {
        handleUpdatePembayaran(
            guru.id_guru,
            guru.nama_guru,
            guru.gaji_guru,
            guru.tahun_pelajaran,
            bulan,
        );
    };

    const handleBatalClick = (guru, bulan) => {
        handleBatalPembayaran(
            guru.id_guru,
            guru.nama_guru,
            guru.tahun_pelajaran,
            bulan,
        );
    };

    const renderBulanColumn = (guru, bulan, tahun_pelajaran, value) => {
        if (value === null) { 
            return (
                <button className="text-red-500 text-lg"
                onClick={() => handleEditClick(guru, bulan, tahun_pelajaran)}
                >
                    <FaRegEdit />
                </button>
            );
        } else {
            return (
                <button className="text-green-500 text-xl flex justify-center items-center"
                onClick={() => handleBatalClick(guru, bulan, tahun_pelajaran)}
                >
                    <FaRegCheckCircle />
                </button>
            );
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
            <section className='flex pr-3'>
            <section>
                <NavbarAdmin dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen} />
                </section>
                    <section className='w-11/12 mx-auto h-full mt-16'>
                    <div className='flex justify-between'>
                        <p className='font-body text-base font-bold text-secondary '>{`Pembayaran Gaji Guru ${nama_sekolah} Muhammadiyah Tanjungpinang Tahun Pelajaran ${selectedTahunPelajaran}`}</p>
                       
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
                                    placeholder="Search by Name..."
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
                                    <th className='font-medium py-4 px-4'>NAMA GURU</th>
                                    <th className='font-medium py-4 px-4'>JUMLAH GAJI</th>
                                    <th className='font-medium py-4 px-2'>JUL</th>
                                    <th className='font-medium py-4 px-2'>AGS</th>
                                    <th className='font-medium py-4 px-2'>SEP</th>
                                    <th className='font-medium py-4 px-2'>OKT</th>
                                    <th className='font-medium py-4 px-2'>NOV</th>
                                    <th className='font-medium py-4 px-2'>DES</th>
                                    <th className='font-medium py-4 px-2'>JAN</th>
                                    <th className='font-medium py-4 px-2'>FEB</th>
                                    <th className='font-medium py-4 px-2'>MAR</th>
                                    <th className='font-medium py-4 px-2'>APR</th>
                                    <th className='font-medium py-4 px-2'>MEI</th>
                                    <th className='font-medium py-4 px-2'>JUN</th>
                                </tr>
                            </thead>
                            <tbody className='border-b'>
                                {currentData.length > 0 ? (
                                    currentData.map((guru, index) => (
                                        <tr key={guru.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                            <td className='py-3 px-4 text-center'>{indexOfFirstItem + index + 1}</td>
                                            <td className='py-3 px-4 text-center'>{guru.nama_guru}</td>
                                            <td className='py-3 px-4 text-center'>{formatCurrency (guru.gaji_guru)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'juli', guru.tahun_pelajaran, guru.juli)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'agustus',guru.tahun_pelajaran, guru.agustus)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'september', guru.tahun_pelajaran, guru.september)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'oktober', guru.tahun_pelajaran, guru.oktober)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'november',guru.tahun_pelajaran, guru.november)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'desember',guru.tahun_pelajaran, guru.desember)}</td>
                                            <td className='py-3 px-2 text-center '>{renderBulanColumn(guru, 'januari',guru.tahun_pelajaran, guru.januari)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'februari',guru.tahun_pelajaran, guru.februari)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'maret',guru.tahun_pelajaran, guru.maret)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'april',guru.tahun_pelajaran, guru.april)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'mei',guru.tahun_pelajaran, guru.mei)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(guru, 'juni',guru.tahun_pelajaran, guru.juni)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="16" className='text-center py-4'>
                                            Tidak ada data guru.
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
                
            </section>
        </>
    );
};

export default HalamanGaji;
