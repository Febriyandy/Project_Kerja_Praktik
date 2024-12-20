import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import foto1 from "../../assets/dashboard2.png";
import foto2 from "../../assets/dashboard3.png";
import foto3 from "../../assets/dashboard4.png";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const Auth = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, formData);

      // Menyimpan data ke localStorage
      window.localStorage.setItem("userType", response.data.role);
      window.localStorage.setItem("loggedIn", "true"); // Pastikan nilai sebagai string

      // Navigasi ke halaman sesuai dengan role
      if (response.data.role === "Bendahara") {
        navigate("/bendahara");
      } else if (response.data.role === "Admin") {
        navigate("/admin");
      } else if (response.data.role === "Yayasan") {
        navigate("/yayasan");
      }

      Swal.fire({
        icon: "success",
        title: "Login Berhasil!",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.msg;
        setMsg(errorMessage);

        Swal.fire({
          icon: "error",
          title: "Gagal Masuk!",
          text: errorMessage,
        });
      } else {
        console.error("Unexpected error:", error);

        Swal.fire({
          icon: "error",
          title: "Gagal Masuk!",
          text: "Terjadi kesalahan",
        });
      }
    }
  };

  useEffect(() => {
    document.title = "Login";
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    fade: true,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    cssEase: "linear",
  };

  return (
    <section id="home" className="w-full h-screen bg-white flex items-center justify-center">
      <div className="absolute inset-0 ">
        <Slider {...settings}>
          <div>
            <img className="w-full h-screen object-cover" src={foto1} alt="" />
          </div>
          <div>
            <img className="w-full h-screen object-cover" src={foto2} alt="" />
          </div>
          <div>
            <img className="w-full h-screen object-cover" src={foto3} alt="" />
          </div>
        </Slider>
      </div>
      <div className="relative z-10 w-96 p-5  rounded-xl shadow-lg bg-white backdrop-filter backdrop-blur-sm bg-opacity-40">
        <h1 className="font-body font-bold text-xl text-primary text-center">Login</h1>
        <p className="animate__animated animate__fadeInUp -mt-5 mb-5 text-primary font-body text-center font-normal">
              <br />
              Masukkan username dan password untuk autentikasi
            </p>
        <form onSubmit={Auth} className="flex flex-col">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            className="w-full font-body px-3 py-2 border border-slate-300 rounded-md text-md placeholder-slate-400
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-priborder-primary"
            placeholder="Masukkan Username"
          />
          <div className="relative w-full my-5">
            <input
              value={password}
              onChange={handlePasswordChange}
              type={showPassword ? "text" : "password"}
             className="w-full font-body px-3 py-2 border border-slate-300 rounded-md text-md placeholder-slate-400
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-priborder-primary"
              placeholder="Masukkan Password"
            />
            <div
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary duration-200 py-2 text-white font-body font-bold rounded-md"
          >
            Masuk
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
