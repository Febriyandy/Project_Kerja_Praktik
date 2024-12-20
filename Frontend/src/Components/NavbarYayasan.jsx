import React, { useState, useEffect } from "react";
import Logo from "../assets/Logo.png";
import Profil from "../assets/profil.png";
import { IoMdMenu } from "react-icons/io";
import { HiOutlineViewGrid } from "react-icons/hi";
import { BiLogOut } from "react-icons/bi";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { IoKeyOutline } from "react-icons/io5";

const NavbarYayasan = () => {
  const [menuBuka, setMenuBuka] = useState(
    () => JSON.parse(localStorage.getItem("menuBuka")) || false
  );
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("menuBuka", JSON.stringify(menuBuka));
  }, [menuBuka]);

  const toggleBuka = () => {
    setMenuBuka(!menuBuka);
  };

  const getActiveClass = (path) => {
    if (path === "/yayasan/") {
      return location.pathname.startsWith("/yayasan/")
        ? "bg-white bg-opacity-30"
        : "";
    }
    if (path === "/yayasan/ganti_password") {
      return location.pathname.startsWith("/yayasan/ganti_password")
        ? "bg-white bg-opacity-30"
        : "";
    }
    return location.pathname === path ? "bg-white bg-opacity-30" : "";
  };

  useEffect(() => {
    refreshToken();
  }, []);

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

  const Logout = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/logout`);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
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
          <div className="w-full h-14 flex items-center gap-3 justify-center mt-3 rounded-md bg-white ">
            <img src={Profil} className="w-10 h-10" alt="" />
            <h1 className="font-body font-bold text-secondary text-sm">
              Yayasan
            </h1>
          </div>

          <Link
            to="/yayasan"
            className={`flex py-3 mt-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/yayasan"
            )}`}
          >
            <HiOutlineViewGrid className="text-base" />
            Dashboard
          </Link>
          <Link
            to="/yayasan/ganti_password"
            className={`flex py-3 text-xs rounded-md font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/yayasan/ganti_password"
            )}`}
          >
            <IoKeyOutline className="text-base" />
            Ganti Password
          </Link>

          <button
            onClick={Logout}
            className="flex py-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center"
          >
            <BiLogOut className="text-base" />
            Keluar
          </button>
        </nav>
      ) : (
        <nav className="h-screen flex flex-col p-3 w-20 rounded-lg mx-4 my-16  bg-primary">
          <button
            onClick={toggleBuka}
            className="text-white text-xl p-1 self-center"
          >
            <IoMdMenu />
          </button>
          <div className="w-14 h-14 flex flex-col items-center gap-3 justify-center mt-3 rounded-md bg-white ">
            <img src={Profil} className="w-10 h-10" alt="" />
          </div>
          <Link
            to="/yayasan"
            className={`flex py-3 mt-3 text-xs rounded-md text- font-body px-4 hover:bg-white hover:bg-opacity-30 text-white gap-5 items-center ${getActiveClass(
              "/yayasan"
            )}`}
          >
            <HiOutlineViewGrid className="text-base" />
          </Link>
          <Link
            to="/yayasan/ganti_password"
            className={`flex py-3 text-sm rounded-md font-body px-5 self-center hover:bg-white hover:bg-opacity-30 text-white items-center ${getActiveClass(
              "/yayasan/ganti_password"
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

export default NavbarYayasan;
