import React, { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import Profil from "../assets/profil.png";
import { IoMdMenu } from "react-icons/io";
import { HiOutlineViewGrid } from "react-icons/hi";
import { LuSchool } from "react-icons/lu";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { HiOutlineClipboardList } from "react-icons/hi";
import { BiLogOut } from "react-icons/bi";
import { MdOutlinePayments } from "react-icons/md";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FaHandHoldingHeart } from "react-icons/fa6";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";


const NavbarAdmin = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [dropdownBuka, setDropdownBuka] = useState(
    () => JSON.parse(localStorage.getItem("dropdownBuka")) || false
  );
  const [menuBuka, setMenuBuka] = useState(
    () => JSON.parse(localStorage.getItem("menuBuka")) || false
  );
  const [dropdownSD, setDropdownSD] = useState(
    () => JSON.parse(localStorage.getItem("dropdownSD")) || false
  );
  const [dropdownSMP, setDropdownSMP] = useState(
    () => JSON.parse(localStorage.getItem("dropdownSMP")) || false
  );
  const [dropdownSMA, setDropdownSMA] = useState(
    () => JSON.parse(localStorage.getItem("dropdownSMA")) || false
  );
  const [dropdownKas, setDropdownKas] = useState(
    () => JSON.parse(localStorage.getItem("dropdownKas")) || false
  );
  const [dropdownGuru, setDropdownGuru] = useState(
    () => JSON.parse(localStorage.getItem("dropdownGuru")) || false
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [kelasSD, setKelasSD] = useState([
    "Kelas1",
    "Kelas2",
    "Kelas3",
    "Kelas4",
    "Kelas5",
    "Kelas6",
  ]);
  const [kelasSMP, setKelasSMP] = useState(["Kelas7", "Kelas8", "Kelas9"]);
  const [kelasSMA, setKelasSMA] = useState(["Kelas10", "Kelas11", "Kelas12"]);
  const [kelasAktif, setKelasAktif] = useState("");

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    localStorage.setItem("dropdownBuka", JSON.stringify(dropdownBuka));
  }, [dropdownBuka]);

  useEffect(() => {
    localStorage.setItem("menuBuka", JSON.stringify(menuBuka));
  }, [menuBuka]);

  useEffect(() => {
    localStorage.setItem("dropdownSD", JSON.stringify(dropdownSD));
  }, [dropdownSD]);

  useEffect(() => {
    localStorage.setItem("dropdownSMP", JSON.stringify(dropdownSMP));
  }, [dropdownSMP]);

  useEffect(() => {
    localStorage.setItem("dropdownSMA", JSON.stringify(dropdownSMA));
  }, [dropdownSMA]);

  useEffect(() => {
    localStorage.setItem("dropdownKas", JSON.stringify(dropdownKas));
  }, [dropdownKas]);

  useEffect(() => {
    localStorage.setItem("dropdownGuru", JSON.stringify(dropdownGuru));
  }, [dropdownGuru]);

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`, {
        withCredentials: true,
      });
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

  const toggleDropdownSD = () => {
    setDropdownSD(!dropdownSD);
  };

  const toggleDropdownSMP = () => {
    setDropdownSMP(!dropdownSMP);
  };

  const toggleDropdownSMA = () => {
    setDropdownSMA(!dropdownSMA);
  };

  const toggleDropdownKas = () => {
    setDropdownKas(!dropdownKas);
  };

  const toggleDropdownGuru = () => {
    setDropdownGuru(!dropdownGuru);
  };

  const toggleBuka = () => {
    setMenuBuka(!menuBuka);
  };

  const getActiveClass = (path) => {
    if (path === "/admin/rencana_belanja") {
      return location.pathname.startsWith("/admin/rencana_belanja")
        ? "bg-white bg-opacity-30"
        : "";
    }
    if (path === "/admin/infaq") {
      return location.pathname.startsWith("/admin/infaq")
        ? "bg-white bg-opacity-30"
        : "";
    }
    if (path === "/admin/") {
      return location.pathname.startsWith("/admin/")
        ? "bg-white bg-opacity-30"
        : "";
    
    }
    if (path === "/admin/kelola_user") {
      return location.pathname.startsWith("/admin/kelola_user")
        ? "bg-white bg-opacity-30"
        : "";
    
    }
    return location.pathname === path ? "bg-white bg-opacity-30" : "";
  };

  const isRencanaBelanjaActive = (schoolId) => {
    return location.pathname.startsWith(`/admin/rencana_belanja/${schoolId}`)
      ? "bg-white bg-opacity-30"
      : "";
  };

  const isArusKasActive = (schoolId) => {
    return location.pathname.startsWith(`/admin/arus_kas/${schoolId}`)
      ? "bg-white bg-opacity-30"
      : "";
  };

  const isGajiGuruActive = (schoolId) => {
    return location.pathname.startsWith(`/admin/gaji_guru/${schoolId}`)
      ? "bg-white bg-opacity-30"
      : "";
  };

  const isArusKasYayasanActive = () => {
    return location.pathname.startsWith(`/admin/donatur`)
      ? "bg-white bg-opacity-30"
      : "";
  };

  const navigateToKelas = (k) => {
    setKelasAktif(k);
    navigate(`/admin/spp/${k}`);
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
        <nav className="h-screen  flex flex-col p-3 w-60 rounded-lg mx-4 my-16 bg-primary">
          <button
            onClick={toggleBuka}
            className="text-white text-xl p-1 self-end"
          >
            <IoMdMenu />
          </button>
          <div className="w-full py-3 flex items-center gap-3 justify-center mt-3 rounded-md bg-white ">
            <img src={Profil} className="w-10 h-10" alt="" />
            <h1 className="font-body font-bold text-secondary text-sm">
              Admin
            </h1>
          </div>
          <div className="h-auto no-scrollbar mt-3 overflow-y-auto flex flex-col   rounded-lg mb-5">
            <Link
              to="/admin"
              className={`flex py-3  text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
                "/admin"
              )}`}
            >
              <HiOutlineViewGrid className="text-base" />
              Dashboard
            </Link>

            {/* Dropdown untuk SD */}
            <button
              onClick={toggleDropdownSD}
              className={`flex py-2 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownSD ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <LuSchool className="text-base" /> SPP SD{" "}
              {dropdownSD ? (
                <BiChevronUp className="text-2xl ml-auto" />
              ) : (
                <BiChevronDown className="text-2xl ml-auto" />
              )}
            </button>
            {dropdownSD && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                {kelasSD.length > 0 ? (
                  kelasSD.map((k, index) => (
                    <Link
                      to={`/admin/spp/${k}`}
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

            {/* Dropdown untuk SMP */}
            <button
              onClick={toggleDropdownSMP}
              className={`flex py-2 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownSMP ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <LuSchool className="text-base" />
              SPP SMP{" "}
              {dropdownSMP ? (
                <BiChevronUp className="text-2xl ml-auto" />
              ) : (
                <BiChevronDown className="text-2xl ml-auto" />
              )}
            </button>
            {dropdownSMP && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                {kelasSMP.length > 0 ? (
                  kelasSMP.map((k, index) => (
                    <Link
                      to={`/admin/spp/${k}`}
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

            {/* Dropdown untuk SMA */}
            <button
              onClick={toggleDropdownSMA}
              className={`flex py-2 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownSMA ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <LuSchool className="text-base" /> SPP SMA{" "}
              {dropdownSMA ? (
                <BiChevronUp className="text-2xl ml-auto" />
              ) : (
                <BiChevronDown className="text-2xl ml-auto" />
              )}
            </button>
            {dropdownSMA && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                {kelasSMA.length > 0 ? (
                  kelasSMA.map((k, index) => (
                    <Link
                      to={`/admin/spp/${k}`}
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
             <button
              onClick={toggleDropdownGuru}
              className={`flex py-2 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownGuru ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <FaChalkboardTeacher className="text-base" /> Gaji Guru
              {dropdownGuru ? (
                <BiChevronUp className="text-2xl ml-auto" />
              ) : (
                <BiChevronDown className="text-2xl ml-auto" />
              )}
            </button>
            {dropdownGuru && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                <Link
                  to={`/admin/gaji_guru/11001970`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isGajiGuruActive(
                    "11001970"
                  )}`}
                >
                  SD
                </Link>
                <Link
                  to={`/admin/gaji_guru/11001860`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isGajiGuruActive(
                    "11001860"
                  )}`}
                >
                  SMP
                </Link>
                <Link
                  to={`/admin/gaji_guru/11001974`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isGajiGuruActive(
                    "11001974"
                  )}`}
                >
                  SMA
                </Link>
              </div>
            )}
            <Link
              to="/admin/riwayat_spp"
              className={`flex py-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
                "/admin/riwayat_spp"
              )}`}
            >
              <HiOutlineClipboardList className="text-base" />
              Riwayat SPP dan Gaji Guru
            </Link>

            {/* Dropdown untuk Rencana Belanja */}
            <button
              onClick={toggleDropdown}
              className={`flex py-2 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownBuka ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <MdOutlinePayments className="text-base" /> Rencana Belanja
              {dropdownBuka ? (
                <BiChevronUp className="text-2xl ml-auto" />
              ) : (
                <BiChevronDown className="text-2xl ml-auto" />
              )}
            </button>
            {dropdownBuka && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                <Link
                  to={`/admin/rencana_belanja/11001970`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isRencanaBelanjaActive(
                    "11001970"
                  )}`}
                >
                  SD
                </Link>
                <Link
                  to={`/admin/rencana_belanja/11001860`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isRencanaBelanjaActive(
                    "11001860"
                  )}`}
                >
                  SMP
                </Link>
                <Link
                  to={`/admin/rencana_belanja/11001974`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isRencanaBelanjaActive(
                    "11001974"
                  )}`}
                >
                  SMA
                </Link>
              </div>
            )}

            {/* Dropdown untuk Kas */}
            <button
              onClick={toggleDropdownKas}
              className={`flex py-2 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownKas ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <MdOutlineAccountBalanceWallet className="text-base" /> Arus Kas
              {dropdownKas ? (
                <BiChevronUp className="text-2xl ml-auto" />
              ) : (
                <BiChevronDown className="text-2xl ml-auto" />
              )}
            </button>
            {dropdownKas && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                <Link
                  to={`/admin/arus_kas/11001970`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasActive(
                    "11001970"
                  )}`}
                >
                  SD
                </Link>
                <Link
                  to={`/admin/arus_kas/11001860`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasActive(
                    "11001860"
                  )}`}
                >
                  SMP
                </Link>
                <Link
                  to={`/admin/arus_kas/11001974`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasActive(
                    "11001974"
                  )}`}
                >
                  SMA
                </Link>
                <Link
                  to={`/admin/donatur`}
                  className={`py-3 rounded-md w-full text-left pl-14 font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasYayasanActive()}`}
                >
                  Yayasan
                </Link>
              </div>
            )}
            <Link
              to="/admin/infaq"
              className={`flex py-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
                "/admin/infaq"
              )}`}
            >
              <FaHandHoldingHeart className="text-base" />
              Infaq Yayasan
            </Link>
            <Link
              to="/admin/kelola_user"
              className={`flex py-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
                "/admin/kelola_user"
              )}`}
            >
              <FaUsersGear className="text-base" />
              Kelola Users
            </Link>
            <button
              onClick={Logout}
              className="flex py-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center"
            >
              <BiLogOut className="text-base" />
              Logout
            </button>
          </div>
        </nav>
      ) : (
        <nav className="h-screen flex flex-col p-3 w-20 rounded-lg mx-4 my-16 bg-primary">
          <button
            onClick={toggleBuka}
            className="text-white text-xl p-1 self-center"
          >
            <IoMdMenu />
          </button>
          <div className="w-14 py-4 flex flex-col items-center gap-3 justify-center mt-3 rounded-md bg-white">
            <img src={Profil} className="w-8 h-8" alt="" />
          </div>
          <div  className="h-auto no-scrollbar mt-3 overflow-y-auto flex flex-col   rounded-lg mb-5">
          <Link
            to="/admin"
            className={`flex py-3 self-center text-sm rounded-md font-body px-5 hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/admin"
            )}`}
          >
            <HiOutlineViewGrid className="text-base" />
          </Link>
          <button
            onClick={toggleDropdownSD}
            className={`flex py-3 text-xs rounded-md mx-auto px-5 font-body  hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
              dropdownSD ? "bg-white bg-opacity-30" : ""
            }`}
          >
            SD{" "}
          </button>
          {dropdownSD && (
            <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
              {kelasSD.length > 0 ? (
                kelasSD.map((k, index) => (
                  <Link
                    to={`/admin/spp/${k}`}
                    key={index}
                    className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30  ${
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
          <button
            onClick={toggleDropdownSMP}
            className={`flex py-3 text-xs rounded-md mx-auto px-4 font-body  hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
              dropdownSMP ? "bg-white bg-opacity-30" : ""
            }`}
          >
            SMP{" "}
          </button>
          {dropdownSMP && (
            <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
              {kelasSMP.length > 0 ? (
                kelasSMP.map((k, index) => (
                  <Link
                    to={`/admin/spp/${k}`}
                    key={index}
                    className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30  ${
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
          <button
            onClick={toggleDropdownSMA}
            className={`flex py-3 text-xs rounded-md mx-auto px-4 font-body  hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
              dropdownSMA ? "bg-white bg-opacity-30" : ""
            }`}
          >
            SMA{" "}
          </button>
          {dropdownSMA && (
            <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
              {kelasSMA.length > 0 ? (
                kelasSMA.map((k, index) => (
                  <Link
                    to={`/admin/spp/${k}`}
                    key={index}
                    className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30  ${
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
          <button
              onClick={toggleDropdownGuru}
              className={`flex py-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
                dropdownGuru ? "bg-white bg-opacity-30" : ""
              }`}
            >
              <FaChalkboardTeacher className="text-base" />
            </button>
            {dropdownGuru && (
              <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
                <Link
                to={`/admin/gaji_guru/11001970`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isGajiGuruActive(
                  "11001970"
                )}`}
              >
                SD
              </Link>
              <Link
                to={`/admin/gaji_guru/11001860`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isGajiGuruActive(
                  "11001860"
                )}`}
              >
                SMP
              </Link>
              <Link
                to={`/admin/gaji_guru/11001974`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isGajiGuruActive(
                  "11001974"
                )}`}
              >
                SMA
              </Link>
              </div>
            )}
          <Link
            to="/admin/riwayat_spp"
            className={`flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/admin/riwayat_spp"
            )}`}
          >
            <HiOutlineClipboardList className="text-base" />
          </Link>
          <button
            onClick={toggleDropdown}
            className={`flex py-3 text-xs rounded-md mx-auto px-5 font-body  hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
              dropdownBuka ? "bg-white bg-opacity-30" : ""
            }`}
          >
            <MdOutlinePayments className="text-base" />
          </button>
          {dropdownBuka && (
            <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
              <Link
                to={`/admin/rencana_belanja/11001970`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isRencanaBelanjaActive(
                  "11001970"
                )}`}
              >
                SD
              </Link>
              <Link
                to={`/admin/rencana_belanja/11001860`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isRencanaBelanjaActive(
                  "11001860"
                )}`}
              >
                SMP
              </Link>
              <Link
                to={`/admin/rencana_belanja/11001974`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isRencanaBelanjaActive(
                  "11001974"
                )}`}
              >
                SMA
              </Link>
            </div>
          )}

          <button
            onClick={toggleDropdownKas}
            className={`flex py-3 text-xs rounded-md mx-auto px-5 font-body  hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${
              dropdownKas ? "bg-white bg-opacity-30" : ""
            }`}
          >
            <MdOutlineAccountBalanceWallet className="text-base" />
          </button>
          {dropdownKas && (
            <div className="font-body flex flex-col text-xs bg-secondary rounded-md shadow-lg">
              <Link
                to={`/admin/arus_kas/11001970`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasActive(
                  "11001970"
                )}`}
              >
                SD
              </Link>
              <Link
                to={`/admin/arus_kas/11001860`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasActive(
                  "11001860"
                )}`}
              >
                SMP
              </Link>
              <Link
                to={`/admin/arus_kas/11001974`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasActive(
                  "11001974"
                )}`}
              >
                SMA
              </Link>
              <Link
                to={`/admin/donatur`}
                className={`py-3 rounded-md w-full text-center font-body text-white hover:bg-white hover:bg-opacity-30 ${isArusKasYayasanActive()}`}
              >
                YYSN
              </Link>
            </div>
          )}
          <Link
            to="/admin/infaq"
            className={`flex py-3 self-center text-sm rounded-md font-body px-5 hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/admin/infaq"
            )}`}
          >
            <FaHandHoldingHeart className="text-base" />
          </Link>
          <Link
            to="/admin/kelola_user"
            className={`flex py-3 self-center text-sm rounded-md font-body px-5 hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/admin/kelola_user"
            )}`}
          >
            <FaUsersGear className="text-base" />
          </Link>
          <button
            onClick={Logout}
            className="flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center"
          >
            <BiLogOut className="text-base" />
          </button>
          </div>
        </nav>
      )}
    </>
  );
};

export default NavbarAdmin;
