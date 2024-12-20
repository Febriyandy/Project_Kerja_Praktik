import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../../Components/NavbarAdmin';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import { FaRegEdit } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";

const HalamanSPP = () => {
    const [token, setToken] = useState("");
    const [expire, setExpire] = useState("");
    const [data_siswa, setData_siswa] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tahunPelajaran, setTahunPelajaran] = useState([]);
    const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { kelas } = useParams();
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
        document.title = 'Pembayaran SPP';
        refreshToken();
        getTahunPelajaran();
    }, []);

    useEffect(() => {
        getDataSiswa();
    }, [selectedTahunPelajaran, kelas]);

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
            const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/DataSPPsiswa/${kelas}`, {
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
    

    const handleUpdatePembayaran = async (id_siswa, nama_siswa, nama_orangtua, no_hp_orangtua, tahun_pelajaran, tingkat_sekolah, bulan, biaya_spp) => {
        try {
            const confirmResult = await Swal.fire({
                title: 'Konfirmasi Pembayaran',
                text: `Apakah Anda yakin ${nama_siswa} telah melakukan pembayaran SPP bulan ${bulan.toUpperCase()} untuk Tahun Pelajaran ${tahun_pelajaran}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Sudah',
                cancelButtonText: 'Batal'
            });
    
            if (confirmResult.isConfirmed) {
                const updateData = { bulan, biaya_spp, tahun_pelajaran };
                await axiosJWT.patch(`${import.meta.env.VITE_API_URL}/updateSPPsiswa/${id_siswa}`, updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getDataSiswa(); // Refresh data setelah update
                Swal.fire("Success", "Pembayaran SPP berhasil!", "success");
    
                // Buka WhatsApp setelah pembayaran berhasil diupdate
                const message = `Assalamualaikum wr wb, \nBapak/Ibu ${nama_orangtua} \n \nBersama ini kami ingin menginformasikan bahwa Pembayaran SPP ${tingkat_sekolah} Muhammadiyah Tanjungpinang A.N ${nama_siswa} telah kami terima sebesar ${formatCurrency (biaya_spp)} untuk pembayaran bulan ${bulan.toUpperCase()} tahun pelajaran ${tahun_pelajaran}, \n \nDemikian informasi ini kami sampaikan. Sekian, terima kasih.`;
                const whatsappUrl = `https://wa.me/${no_hp_orangtua}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (error) {
            console.error("Error updating pembayaran:", error);
            Swal.fire("Error", "Gagal mengupdate pembayaran!", "error");
        }
    };

    const handleBatalPembayaran = async (id_siswa, nama_siswa, tahun_pelajaran, bulan) => {
        try {
            const confirmResult = await Swal.fire({
                title: 'Konfirmasi Pembatalan',
                text: `Apakah Anda yakin ingin membatalkan pembayaran SPP ${nama_siswa}  bulan ${bulan.toUpperCase()}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Yakin',
                cancelButtonText: 'Batal'
            });
    
            if (confirmResult.isConfirmed) {
                const updateData = { bulan, tahun_pelajaran };
                await axiosJWT.patch(`${import.meta.env.VITE_API_URL}/BatalSPPsiswa/${id_siswa}`, updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                getDataSiswa(); // Refresh data setelah update
                Swal.fire("Success", "Pembatalan SPP berhasil!", "success");
            }
        } catch (error) {
            console.error("Error updating pembayaran:", error);
            Swal.fire("Error", "Gagal mengupdate pembayaran!", "error");
        }
    };

    const handleEditClick = (siswa, bulan) => {
        handleUpdatePembayaran(
            siswa.id_siswa,
            siswa.nama_siswa,
            siswa.nama_orangtua,
            siswa.no_hp_orangtua,
            siswa.tahun_pelajaran,
            siswa.tingkat_sekolah,
            bulan,
            siswa.biaya_spp
        );
    };

    const handleBatalClick = (siswa, bulan) => {
        handleBatalPembayaran(
            siswa.id_siswa,
            siswa.nama_siswa,
            siswa.tahun_pelajaran,
            bulan,
        );
    };

    const renderBulanColumn = (siswa, bulan, tahun_pelajaran, value) => {
        if (value === null) { 
            return (
                <button className="text-red-500 text-lg"
                onClick={() => handleEditClick(siswa, bulan, tahun_pelajaran)}
                >
                    <FaRegEdit />
                </button>
            );
        } else {
            return (
                <button className="text-green-500 text-xl flex justify-center items-center"
                onClick={() => handleBatalClick(siswa, bulan, tahun_pelajaran)}
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
                        <p className='font-body text-base font-bold text-secondary '>{`Pembayaran SPP ${kelas} Tahun Pelajaran ${selectedTahunPelajaran}`}</p>
                       
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
                                    <th className='font-medium py-4 px-4'>BIAYA SPP</th>
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
                                    currentData.map((siswa, index) => (
                                        <tr key={siswa.nisn} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                            <td className='py-3 px-4 text-center'>{indexOfFirstItem + index + 1}</td>
                                            <td className='py-3 px-4 text-center'>{siswa.nisn}</td>
                                            <td className='py-3 px-4 text-center'>{siswa.nama_siswa}</td>
                                            <td className='py-3 px-4 text-center'>{formatCurrency (siswa.biaya_spp)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'juli', siswa.tahun_pelajaran, siswa.juli)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'agustus',siswa.tahun_pelajaran, siswa.agustus)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'september', siswa.tahun_pelajaran, siswa.september)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'oktober', siswa.tahun_pelajaran, siswa.oktober)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'november',siswa.tahun_pelajaran, siswa.november)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'desember',siswa.tahun_pelajaran, siswa.desember)}</td>
                                            <td className='py-3 px-2 text-center '>{renderBulanColumn(siswa, 'januari',siswa.tahun_pelajaran, siswa.januari)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'februari',siswa.tahun_pelajaran, siswa.februari)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'maret',siswa.tahun_pelajaran, siswa.maret)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'april',siswa.tahun_pelajaran, siswa.april)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'mei',siswa.tahun_pelajaran, siswa.mei)}</td>
                                            <td className='py-3 px-2 text-center'>{renderBulanColumn(siswa, 'juni',siswa.tahun_pelajaran, siswa.juni)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="16" className='text-center py-4'>
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
                
            </section>
        </>
    );
};

export default HalamanSPP;
