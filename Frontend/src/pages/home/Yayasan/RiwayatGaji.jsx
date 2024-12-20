import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { exportToExcel } from "../../../utils/ExportToExcel_DataGaji";
import { exportToPDF } from "../../../utils/ExportToPDF_DataGaji";
import ButtonPdf from "../../../Components/ButtonUnduhPdf";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import ButtonExcel from "../../../Components/ButtonUnduhExcel";
import NavbarYayasan from "../../../Components/NavbarYayasan";

const RiwayatGajiYayasan = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [data_guru, setData_guru] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tahunPelajaran, setTahunPelajaran] = useState([]);
  const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
  const [tingkatSekolah, setTingkatSekolah] = useState([]);
  const [selectedTingkatSekolah, setSelectedTingkatSekolah] = useState("");
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
    document.title = 'Riwayat SPP & Gaji Guru';
    getTahunPelajaran();
    getTingkatSekolah();
  }, []);

  useEffect(() => {
    getDataGuru();
  }, [selectedTahunPelajaran, selectedTingkatSekolah,]);


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
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataGajiGuru`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData_guru(response.data);
    } catch (error) {
      console.error("Error fetching guru data:", error);
    }
  };

  const getTahunPelajaran = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/TahunPelajaran/Guru`,
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

  const getTingkatSekolah = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/TingkatSekolah/Guru`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Urutkan hasil berdasarkan urutan SD, SMP, SMA
      const sortedData = response.data.sort((a, b) => {
        const order = ["SD", "SMP", "SMA"];
        return order.indexOf(a) - order.indexOf(b);
      });
  
      setTingkatSekolah(sortedData);
    } catch (error) {
      console.error("Error fetching tingkat sekolah data:", error);
    }
  };
  
  const groupDataByTeacher = (data) => {
    return Object.values(
      data.reduce((acc, guru) => {
        if (!acc[guru.nama_guru]) {
          acc[guru.nama_guru] = { ...guru };
        } else {
          acc[guru.nama_guru].juli += guru.juli || 0;
          acc[guru.nama_guru].agustus += guru.agustus || 0;
          acc[guru.nama_guru].september += guru.september || 0;
          acc[guru.nama_guru].oktober += guru.oktober || 0;
          acc[guru.nama_guru].november += guru.november || 0;
          acc[guru.nama_guru].desember += guru.desember || 0;
          acc[guru.nama_guru].januari += guru.januari || 0;
          acc[guru.nama_guru].februari += guru.februari || 0;
          acc[guru.nama_guru].maret += guru.maret || 0;
          acc[guru.nama_guru].april += guru.april || 0;
          acc[guru.nama_guru].mei += guru.mei || 0;
          acc[guru.nama_guru].juni += guru.juni || 0;
        }
        return acc;
      }, {})
    );
  };
  
  const filteredData = groupDataByTeacher(
    data_guru.filter(
      (guru) =>
        (selectedTahunPelajaran ? guru.tahun_pelajaran === selectedTahunPelajaran : true) &&
        (selectedTingkatSekolah ? guru.tingkat_sekolah === selectedTingkatSekolah : true)
    )
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


  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateTotals = (data) => {
    return data.reduce(
      (totals, guru) => {
        totals.juli += guru.juli || 0;
        totals.agustus += guru.agustus || 0;
        totals.september += guru.september || 0;
        totals.oktober += guru.oktober || 0;
        totals.november += guru.november || 0;
        totals.desember += guru.desember || 0;
        totals.januari += guru.januari || 0;
        totals.februari += guru.februari || 0;
        totals.maret += guru.maret || 0;
        totals.april += guru.april || 0;
        totals.mei += guru.mei || 0;
        totals.juni += guru.juni || 0;
        return totals;
      },
      {
        biaya_spp: 0,
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

  const totals = calculateTotals(filteredData);

  return (
    <>
      <section className="flex pr-3">
      <section>
            <NavbarYayasan/>
          </section>
        <section className="min-w-0 h-full mt-16">
        <div className="flex justify-between">
          <div className="flex gap-4">
              <Link to="/yayasan" className="text-2xl text-secondary">
                <IoArrowBackCircleOutline />
              </Link>
              <p className="font-body text-base font-bold text-secondary">
                Riwayat Pembayaran Gaji Guru
              </p>
            </div>
            <div className="flex gap-5">
            <ButtonExcel
              onClick={() => exportToExcel(filteredData, {
                tingkatSekolah: selectedTingkatSekolah,
                tahunPelajaran: selectedTahunPelajaran,
              })
            }
          >
            </ButtonExcel>
            <ButtonPdf
              onClick={() =>
                exportToPDF(filteredData, {
                  tingkatSekolah: selectedTingkatSekolah,
                  tahunPelajaran: selectedTahunPelajaran,
                })
              }
            >
            </ButtonPdf>
            </div>
          </div>
          <div className="mt-5 mx-auto mb-10 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
            <div className="flex justify-between items-center my-5 font-body">
              <div>
                <label className="mr-2 text-sm">Show</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border outline-none border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <label className="ml-2 text-sm">entries</label>
              </div>
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
              <div className="flex gap-2 items-center text-sm">
                <p>Tingkat Sekolah:</p>
                <select
                  value={selectedTingkatSekolah}
                  onChange={(e) => setSelectedTingkatSekolah(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm outline-none"
                >
                  <option value="">Semua</option>
                  {tingkatSekolah.map((tingkat) => (
                    <option key={tingkat} value={tingkat}>
                      {tingkat}
                    </option>
                  ))}
                </select>
              </div>
             
            </div>
            <div className="overflow-x-auto">
              <table className=" font-body text-xs text-secondary w-full min-w-max">
                <thead>
                  <tr className="border-y border-gray-300">
                    <th className="font-medium py-4 px-4 border-x">NO</th>
                    <th className="font-medium py-4 px-4 border-x">NAMA GURU</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">JULI</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">
                      AGUSTUS
                    </th>
                    <th className="font-medium py-4 px-2 w-24">SEPTEMBER</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">
                      OKTOBER
                    </th>
                    <th className="font-medium py-4 px-2 w-24">NOVEMBER</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">
                      DESEMBER
                    </th>
                    <th className="font-medium py-4 px-2 w-24">JANUARI</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">
                      FEBRUARI
                    </th>
                    <th className="font-medium py-4 px-2 w-24">MARET</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">
                      APRIL
                    </th>
                    <th className="font-medium py-4 px-2 w-24">MEI</th>
                    <th className="font-medium py-4 px-2 w-24 border-x">
                      JUNI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="15" className="text-center py-5">
                        Data tidak ditemukan
                      </td>
                    </tr>
                  ) : (
                    currentData.map((guru, index) => (
                      <tr
                        key={guru.id}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                      >
                        <td className="py-3 px-2 border-x text-center">
                          {index + indexOfFirstItem + 1}
                        </td>
                        <td className="py-3 px-2 border-x">{guru.nama_guru}</td>
                      
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.juli)}
                        </td>
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.agustus)}
                        </td>
                        <td className="py-3 px-2">
                          {formatCurrency(guru.september)}
                        </td>
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.oktober)}
                        </td>
                        <td className="py-3 px-2">
                          {formatCurrency(guru.november)}
                        </td>
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.desember)}
                        </td>
                        <td className="py-3 px-2">
                          {formatCurrency(guru.januari)}
                        </td>
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.februari)}
                        </td>
                        <td className="py-3 px-2">
                          {formatCurrency(guru.maret)}
                        </td>
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.april)}
                        </td>
                        <td className="py-3 px-2">
                          {formatCurrency(guru.mei)}
                        </td>
                        <td className="py-3 px-2 border-x">
                          {formatCurrency(guru.juni)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-y">
                    <td className="px-2 py-3 text-center border-x" colSpan="2">
                      Total
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.juli)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals.agustus)}
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.september)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals.oktober)}
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.november)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals.desember)}
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.januari)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals.februari)}
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.maret)}
                    </td>
                    <td className="px-2 py-3">
                      {formatCurrency(totals.april)}
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.mei)}
                    </td>
                    <td className="px-2 py-3 border-x">
                      {formatCurrency(totals.juni)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center my-5 font-body text-sm">
              <div>
                {`Showing ${indexOfFirstItem + 1} to ${
                  indexOfLastItem > filteredData.length
                    ? filteredData.length
                    : indexOfLastItem
                } of ${filteredData.length} entries`}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="px-4 py-1 bg-gray-200 rounded-md shadow-md text-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {renderPageNumbers()}
                <button
                  className="px-4 py-1 bg-gray-200 rounded-md shadow-md text-sm"
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

export default RiwayatGajiYayasan;
