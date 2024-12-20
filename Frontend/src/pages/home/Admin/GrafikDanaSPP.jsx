import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Bar } from "react-chartjs-2";
import { useNavigate} from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the required components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GrafikDanaSPP = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [dana_spp, setDana_SPP] = useState([]);
  const [tahunPelajaran, setTahunPelajaran] = useState([]);
  const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
  const [selectedNpsn, setSelectedNpsn] = useState(11001970);
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    document.title = 'Grafik Dana SPP';
    getTahunPelajaran();
  }, []);

  useEffect(() => {
    getDana_SPP();
  }, [selectedTahunPelajaran, selectedNpsn]);

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

  const getDana_SPP = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataDanaSPP`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDana_SPP(response.data);
    } catch (error) {
      console.error("Error fetching Dana SPP data:", error);
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

  // Bulan dari Juli hingga Juni
  const bulanArray = [
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
  ];

  const filteredDanaSPP = dana_spp.filter((danaspp) =>
    (selectedTahunPelajaran ? danaspp.tahun_pelajaran === selectedTahunPelajaran : true) &&
    (selectedNpsn ? danaspp.npsn === selectedNpsn : true)
  );
  
  // Sum the dana_spp values for each month
  const data = bulanArray.map((bulan) => {
    return filteredDanaSPP
      .filter((item) => item.bulan === bulan)
      .reduce((sum, item) => sum + item.dana_spp, 0);
  });
  

  const chartData = {
    labels: bulanArray,
    datasets: [
      {
        label: 'Dana SPP',
        data: data,
        backgroundColor: 'rgba(245, 73, 73, 0.6)',
        borderColor: 'rgba(245, 73, 73, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bulan',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Dana SPP (IDR)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-md shadow-md p-5 w-full">
      <h2 className="font-body font-bold text-center">Grafik Pendapatan Dana SPP</h2>
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
              <div className="flex gap-2 items-center text-sm">
                <p>Sekolah:</p>
                <select
                  value={selectedNpsn}
                  onChange={(e) => setSelectedNpsn(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm outline-none"
                >
                  
                  <option value={11001970}>SD</option>
                  <option value={11001860}>SMP</option>
                  <option value={11001974}>SMA</option>
                </select>
              </div>
            </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GrafikDanaSPP;
