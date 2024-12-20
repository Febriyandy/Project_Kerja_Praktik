import React, { useState, useEffect } from "react";
import NavbarYayasan from "../../../Components/NavbarYayasan";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const GantiPasswordYayasan = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setExpire(decoded.exp);
      setUsername(decoded.username);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    document.title = 'Ganti Password';
    refreshToken();
  }, []);


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

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
 
  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const updatePassword = async (e) => {
    e.preventDefault();
  
    try {
      const formData = {
        username,
        oldPassword,
        newPassword,
        confirmPassword,
      };
  
      await axiosJWT.patch(`${import.meta.env.VITE_API_URL}/updatePassword`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      Swal.fire({
        icon: "success",
        title: "Berhasil Memperbarui Password!",
        showConfirmButton: false,
        timer: 2000,
      });
  
      setTimeout(() => {
        // Reset the form fields after successful update
        handleUpdatePasswordPopupClose(); // This will reset the fields
        window.location.reload(); // Reload the page after a delay
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.msg;
        setMsg(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Gagal memperbarui password!",
          text: errorMessage,
        });
      } else {
        console.error("Unexpected error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memperbarui password!",
          text: "Terjadi kesalahan",
        });
      }
    }
  };
  

  const handleUpdatePasswordPopupClose = () => {
    setShowUpdatePasswordPopup(false);
    setOldPassword("");  // Reset oldPassword
    setNewPassword("");  // Reset newPassword
    setConfirmPassword(""); // Reset confirmPassword
    setMsg(""); // Reset any message state
  };
  

  return (
    <>
      <section className="flex pr-3">
        <section>
        <NavbarYayasan />
        </section>
        <section className="mt-16 w-11/12 mx-auto h-full">
          <div className="flex justify-between">
            <p className="font-body text-base font-bold text-secondary ">Ganti Password Akun</p>
          </div>
          <form onSubmit={updatePassword} className="font-body mt-10 w-1/3 ml-5">
      <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full py-2 px-3 mb-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Masukkan Password Lama"
                    required
                  />
                  <div
                    className="absolute top-1/3 mt-1 right-3 transform -translate-y-1/2 cursor-pointer"
                    onClick={toggleOldPasswordVisibility}
                  >
                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-2 px-3 text-sm  mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Masukkan Password Baru"
                    required
                  />
                  <div
                    className="absolute top-1/3 mt-1 right-3 transform -translate-y-1/2 cursor-pointer"
                    onClick={toggleNewPasswordVisibility}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full py-2 px-3 text-sm  mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Masukkan Password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-sm  text-white px-4 py-2 rounded-lg w-full mt-4 hover:bg-primary-dark"
                >
                  Simpan
                </button>
      </form>
        </section>
      </section>

    </>
  );
};

export default GantiPasswordYayasan;
