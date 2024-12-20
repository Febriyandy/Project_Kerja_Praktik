import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from '../pages/auth/login';
import HomeBendahara from '../pages/home/Bendahara/HomeBendahara';
import HomeYayasan from '../pages/home/Yayasan/HomeYayasan';
import DataSiswa from '../pages/home/Bendahara/DataSiswa';
import HalamanSPP from '../pages/home/Admin/HalamanSPP';
import LaporanSPP from '../pages/home/Admin/LaporanSPP';
import RencanaBelanja from '../pages/home/Bendahara/RencanaBelanja';
import DetailRencanaBelanja from '../pages/home/Bendahara/DetailRencanaBelanja';
import RencanaBelanjaAdmin from '../pages/home/Admin/RencanaBelanja';
import DetailRencanaBelanjaAdmin from '../pages/home/Admin/DetailRencanaBelanja';
import ArusKas from '../pages/home/Admin/ArusKas';
import DetailArusKas from '../pages/home/Admin/DetailArusKas';
import LaporanDanaBos from '../pages/home/Admin/LaporanDanaBos';
import LaporanKeuangan from '../pages/home/Admin/LaporanKeuangan';
import LaporanKeuanganYayasan from '../pages/home/Yayasan/LaporanKeuanganYayasan';
import Infaq from '../pages/home/Admin/Infaq';
import DetailInfaq from '../pages/home/Admin/DetailInfaq';
import Dashboard from '../pages/home/Admin/Dashboard';
import RiwayatSPPBendahara from '../pages/home/Bendahara/RiwayatSPP';
import LaporanDanaBosBendahara from '../pages/home/Bendahara/LaporanDanaBos';
import DetailArusKasBendahara from '../pages/home/Bendahara/DetailArusKas';
import LaporanDanaBosYayasan from '../pages/home/Yayasan/LaporanDanaBos';
import DetailInfaqYayasan from '../pages/home/Yayasan/DetailInfaq';
import DetailInfaqBendahara from '../pages/home/Bendahara/DetailInfaq';
import NotFound from '../pages/NotFound';
import Donatur from '../pages/home/Admin/Donatur';
import DetailDonatur from '../pages/home/Admin/DetailDonatur';
import DataGuru from '../pages/home/Bendahara/DataGuru';
import HalamanGaji from '../pages/home/Admin/HalamanGaji';
import RiwayatPembayaran from '../pages/home/Admin/RiwayatPembayaran';
import RiwayatGajiGuru from '../pages/home/Bendahara/RiwayatGaji';
import RiwayatGajiYayasan from '../pages/home/Yayasan/RiwayatGaji';
import KelolaUsers from '../pages/home/Admin/KelolaUsers';
import GantiPassword from '../pages/home/Bendahara/GantiPassword';
import GantiPasswordYayasan from '../pages/home/Yayasan/GantiPassword';

const ProtectedRoute = ({ children, allowedUserTypes }) => {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  const userType = localStorage.getItem('userType');
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoutes = () => (
  <>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="laporan_dana_bos" element={<LaporanDanaBos />} />
      <Route path="laporan_spp" element={<LaporanSPP />} />
      <Route path="laporan_keuangan" element={<LaporanKeuangan />} />
      <Route path="arus_kas/:npsn/detail/:id" element={<DetailArusKas />} />
      <Route path="spp/:kelas" element={<HalamanSPP />} />
      <Route path="riwayat_spp" element={<RiwayatPembayaran />} />
      <Route path="rencana_belanja/:npsn" element={<RencanaBelanjaAdmin />} />
      <Route path="rencana_belanja/:npsn/detail/:id" element={<DetailRencanaBelanjaAdmin />} />
      <Route path="arus_kas/:npsn" element={<ArusKas />} />
      <Route path="gaji_guru/:npsn" element={<HalamanGaji />} />
      <Route path="infaq" element={<Infaq />} />
      <Route path="donatur" element={<Donatur />} />
      <Route path="kelola_user" element={<KelolaUsers />} />
      <Route path="donatur/detail/:id" element={<DetailDonatur />} />
      <Route path="infaq/detail/:id" element={<DetailInfaq />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  </>
);

const BendaharaRoutes = () => (
  <>
    <Routes>
      <Route index element={<HomeBendahara />} />
      <Route path="riwayat_spp" element={<RiwayatSPPBendahara />} />
      <Route path="laporan_dana_bos" element={<LaporanDanaBosBendahara />} />
      <Route path="arus_kas/:npsn/detail/:id" element={<DetailArusKasBendahara />} />
      <Route path="data_siswa/:kelas" element={<DataSiswa />} />
      <Route path="gaji_guru/:npsn" element={<RiwayatGajiGuru />} />
      <Route path="rencana_belanja" element={<RencanaBelanja />} />
      <Route path="infaq/detail/:id" element={<DetailInfaqBendahara />} />
      <Route path="guru_sekolah" element={<DataGuru />} />
      <Route path="ganti_password" element={<GantiPassword />} />
      <Route path="rencana_belanja/:id" element={<DetailRencanaBelanja />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  </>
);

const YayasanRoutes = () => (
  <>
    <Routes>
      <Route index element={<HomeYayasan />} />
      <Route path="laporan_keuangan" element={<LaporanKeuanganYayasan />} />
      <Route path="laporan_dana_bos" element={<LaporanDanaBosYayasan />} />
      <Route path="gaji_guru" element={<RiwayatGajiYayasan />} />
      <Route path="ganti_password" element={<GantiPasswordYayasan />} />
      <Route path="infaq/detail/:id" element={<DetailInfaqYayasan />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  </>
);

const Routing = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedUserTypes={['Admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bendahara/*" 
        element={
          <ProtectedRoute allowedUserTypes={['Bendahara']}>
            <BendaharaRoutes />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/yayasan/*" 
        element={
          <ProtectedRoute allowedUserTypes={['Yayasan']}>
            <YayasanRoutes />
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
};

export default Routing;