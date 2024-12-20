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

const GrafikDanaBos = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [dana_bos, setDana_Bos] = useState([]);
  const [tahunPelajaran, setTahunPelajaran] = useState([]);
  const [selectedTahunPelajaran, setSelectedTahunPelajaran] = useState("");
  const [selectedNpsn, setSelectedNpsn] = useState(11001970);
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    document.title = 'Grafik Dana Bos';
    getTahunPelajaran();
  }, []);

  useEffect(() => {
    getDana_Bos();
  }, [selectedTahunPelajaran, selectedNpsn]);

  useEffect(() => {
    updateChartData();
  }, [dana_bos, selectedTahunPelajaran, selectedNpsn]);

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

  const getDana_Bos = async () => {
    try {
      const response = await axiosJWT.get(
        `${import.meta.env.VITE_API_URL}/DataDanaBos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDana_Bos(response.data);
    } catch (error) {
      console.error("Error fetching Dana Bos data:", error);
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

  const updateChartData = () => {
    // Array bulan dari Juli hingga Juni
    const bulanArray = [
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
    ];

    // Initialize data with 0 for each month
    const data = bulanArray.map(bulan => ({
      bulan,
      dana_bos: 0
    }));

    // Update data with values from filteredDanaBos
    dana_bos.filter((danabos) =>
      (selectedTahunPelajaran ? danabos.tahun_pelajaran === selectedTahunPelajaran : true) &&
      (selectedNpsn ? danabos.npsn === selectedNpsn : true)
    ).forEach(item => {
      const bulanIndex = bulanArray.indexOf(item.bulan);
      if (bulanIndex !== -1) {
        data[bulanIndex].dana_bos = item.dana_bos;
      }
    });

    // Set chart data
    const chartData = {
      labels: bulanArray,
      datasets: [
        {
          label: 'Dana Bos',
          data: data.map(item => item.dana_bos),
          backgroundColor: 'rgba(0, 169, 220, 0.6)',
          borderColor: 'rgba(0, 169, 220, 1)',
          borderWidth: 1,
        },
      ],
    };

    setChartData(chartData);
  };

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

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
          text: 'Dana Bos (IDR)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white rounded-md shadow-md p-5 w-full">
      <h2 className="font-body font-bold text-center">Grafik Pendapatan Dana Bos</h2>
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

export default GrafikDanaBos;
