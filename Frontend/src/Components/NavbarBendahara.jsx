import React, { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import Profil from "../assets/profil.png";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { IoMdMenu } from "react-icons/io";
import { HiOutlineViewGrid } from "react-icons/hi";
import { LuSchool } from "react-icons/lu";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BiLogOut } from "react-icons/bi";
import { IoKeyOutline } from "react-icons/io5";
import { FaChalkboardTeacher } from "react-icons/fa";

const NavbarBendahara = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [npsn, setNpsn] = useState(0);
  const [username, setUsername] = useState("");
  const [nama_sekolah, setNama_sekolah] = useState("");
  const [dropdownBuka, setDropdownBuka] = useState(
    () => JSON.parse(localStorage.getItem("dropdownBuka")) || false
  );
  const [menuBuka, setMenuBuka] = useState(
    () => JSON.parse(localStorage.getItem("menuBuka")) || false
  );
  const [kelas, setKelas] = useState([]);
  const [kelasAktif, setKelasAktif] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setNpsn(decoded.npsn);
      setExpire(decoded.exp);
      setUsername(decoded.username);
      setNama_sekolah(decoded.nama_sekolah);

      switch (decoded.npsn) {
        case 11001970:
          setKelas([
            "Kelas1",
            "Kelas2",
            "Kelas3",
            "Kelas4",
            "Kelas5",
            "Kelas6",
          ]);
          break;
        case 11001860:
          setKelas(["Kelas7", "Kelas8", "Kelas9"]);
          break;
        case 11001974:
          setKelas(["Kelas10", "Kelas11", "Kelas12"]);
          break;
        default:
          setKelas([]);
          break;
      }
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    localStorage.setItem("dropdownBuka", JSON.stringify(dropdownBuka));
  }, [dropdownBuka]);

  useEffect(() => {
    localStorage.setItem("menuBuka", JSON.stringify(menuBuka));
  }, [menuBuka]);

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

  const Logout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/logout`);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDropdown = () => {
    setDropdownBuka(!dropdownBuka);
  };

  const toggleBuka = () => {
    setMenuBuka(!menuBuka);
  };

  const getActiveClass = (path) => {
    if (path === "/bendahara/rencana_belanja") {
      return location.pathname.startsWith("/bendahara/rencana_belanja")
        ? "bg-white bg-opacity-30"
        : "";
    }
    if (path === "/bendahara/ganti_password") {
      return location.pathname.startsWith("/bendahara/ganti_password")
        ? "bg-white bg-opacity-30"
        : "";
    }
    if (path === "/bendahara/guru_sekolah") {
      return location.pathname.startsWith("/bendahara/guru_sekolah")
        ? "bg-white bg-opacity-30"
        : "";
    }
    if (path === '/bendahara/') {
      return location.pathname.startsWith('/bendahara/') ? 'bg-white bg-opacity-30' : '';
    }
    return location.pathname === path ? "bg-white bg-opacity-30" : "";
  };

  const navigateToKelas = (k) => {
    setKelasAktif(k);
    navigate(`/bendahara/data_siswa/${k}`);
  };

  return (
    <>
      <nav className="w-full top-0 bg-white h-12 fixed z-[1000] shadow-md flex gap-5 items-center px-7">
        <img src={Logo} alt="" className="py-2 w-10" />
        <h1 className="font-body font-bold text-secondary">
          Majelis Dikdasmen dan PNF Muhammadiyah Tanjungpinang
        </h1>
      </nav>

      {!menuBuka ? (
        <nav className="h-screen flex flex-col p-3 w-60 rounded-lg mx-4 my-16 bg-primary">
          <button
            onClick={toggleBuka}
            className="text-white text-xl p-1 self-end"
          >
            <IoMdMenu />
          </button>
          <div className="w-full h-14 flex items-center gap-3 justify-center mt-3 rounded-md bg-white">
            <img src={Profil} className="w-8 h-8" alt="" />
            <h1 className="font-body font-bold  text-secondary text-xs">
              {username}
            </h1>
          </div>

          <Link
            to="/bendahara"
            className={`flex py-3 mt-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/bendahara"
            )}`}
          >
            <HiOutlineViewGrid className="text-base" />
            Dashboard
          </Link>
          <button
            onClick={toggleDropdown}
            className={`flex py-2 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
              dropdownBuka ? "bg-white bg-opacity-30" : ""
            }`}
          >
            <LuSchool className="text-base" /> {nama_sekolah}
            {dropdownBuka ? (
              <BiChevronUp className="text-2xl ml-auto" />
            ) : (
              <BiChevronDown className="text-2xl ml-auto" />
            )}
          </button>
          {dropdownBuka && (
            <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
              {kelas.length > 0 ? (
                kelas.map((k, index) => (
                  <Link
                    to={`/bendahara/data_siswa/${k}`}
                    key={index}
                    className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${
                      kelasAktif === k ? "bg-white bg-opacity-30" : ""
                    }`}
                    onClick={() => navigateToKelas(k)}
                  >
                    {k}
                  </Link>
                ))
              ) : (
                <button className="py-3 rounded-md w-full text-left pl-14 font-body text-white">
                  Tidak ada kelas
                </button>
              )}
            </div>
          )}
            <Link
            to="/bendahara/guru_sekolah"
            className={`flex py-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/bendahara/guru_sekolah"
            )}`}
          >
            <FaChalkboardTeacher className="text-base" />
            Guru {nama_sekolah}
          </Link>
          <Link
            to="/bendahara/rencana_belanja"
            className={`flex py-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/bendahara/rencana_belanja"
            )}`}
          >
            <HiOutlineClipboardList className="text-base" />
            Rencana Belanja
          </Link>
          <Link
            to="/bendahara/ganti_password"
            className={`flex py-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/bendahara/ganti_password"
            )}`}
          >
            <IoKeyOutline className="text-base" />
            Ganti Password
          </Link>
          <button
            onClick={Logout}
            className="flex py-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center"
          >
            <BiLogOut className="text-base" />
            Keluar
          </button>
        </nav>
      ) : (
        <nav className="h-screen flex flex-col p-3 w-20 rounded-lg mx-4 my-16 bg-primary">
          <button
            onClick={toggleBuka}
            className="text-white text-xl p-1 self-center"
          >
            <IoMdMenu />
          </button>
          <div className="w-14 h-14 flex flex-col items-center gap-3 justify-center mt-3 rounded-md bg-white">
            <img src={Profil} className="w-8 h-8" alt="" />
          </div>
          <Link
            to="/bendahara"
            className={`flex py-3 mt-3 self-center text-sm rounded-md font-body px-5 hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/bendahara"
            )}`}
          >
            <HiOutlineViewGrid className="text-base" />
          </Link>
          <button
            onClick={toggleDropdown}
            className={`flex py-3 text-xs rounded-md px-5 self-center font-body hover:bg-white hover:bg-opacity-30 text-white items-center ${
              dropdownBuka ? "bg-white bg-opacity-30" : ""
            }`}
          >
            <LuSchool className="text-base" />
          </button>
          {dropdownBuka && (
            <div className="font-body text-xs bg-secondary rounded-md shadow-lg">
              {kelas.length > 0 ? (
                kelas.map((k, index) => (
                  <button
                    key={index}
                    className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${
                      kelasAktif === k ? "bg-white bg-opacity-30" : ""
                    }`}
                    onClick={() => navigateToKelas(k)}
                  >
                    {k}
                  </button>
                ))
              ) : (
                <button className="py-3 rounded-md w-full text-center font-body text-white">
                  Tidak ada kelas
                </button>
              )}
            </div>
          )}
          <Link
            to="/bendahara/guru_sekolah"
            className={`flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/bendahara/guru_sekolah"
            )}`}
          >
            <FaChalkboardTeacher className="text-base" />
          </Link>
          <Link
            to="/bendahara/rencana_belanja"
            className={`flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/bendahara/rencana_belanja"
            )}`}
          >
            <HiOutlineClipboardList className="text-base" />
          </Link>
          <Link
            to="/bendahara/ganti_password"
            className={`flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/bendahara/ganti_password"
            )}`}
          >
            <IoKeyOutline className="text-base" />
          </Link>
          <button
            onClick={Logout}
            className="flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center"
          >
            <BiLogOut className="text-base" />
          </button>
        </nav>
      )}
    </>
  );
};

export default NavbarBendahara;
