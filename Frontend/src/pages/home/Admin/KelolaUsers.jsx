import React, { useState, useEffect } from "react";
import NavbarAdmin from "../../../Components/NavbarAdmin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { MdDeleteOutline } from "react-icons/md";
import ButtonTambah from "../../../Components/ButtonTambah";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ButtonPassword from "../../../Components/ButtonGantiPassword";

const KelolaUsers = () => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [data_user, setData_user] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdatePasswordPopup, setShowUpdatePasswordPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [usernameNew, setUsernameNew] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [npsn, setNpsn] = useState("");
  const [nama_sekolah, setNama_sekolah] = useState("");
  const [msg, setMsg] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const navigate = useNavigate();

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
    document.title = "Kelola User";
    refreshToken();
  }, []);

  useEffect(() => {
    getDataUser();
  }, [token]);

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

  const getDataUser = async () => {
    try {
      const response = await axiosJWT.get(`${import.meta.env.VITE_API_URL}/dataUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData_user(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filteredData = data_user.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
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
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers.map((number) => (
      <button
        key={number}
        onClick={() => handlePageChange(number)}
        className={`px-2 py-1 rounded ${
          currentPage === number ? "bg-primary text-white" : "bg-gray-200 text-black"
        }`}
      >
        {number}
      </button>
    ));
  };

  const deleteUser = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus data ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        await axiosJWT.delete(`${import.meta.env.VITE_API_URL}/hapusUser/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        getDataUser();
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
    }
  };

  const handleDelete = (id) => {
    deleteUser(id);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
  };

  const saveData = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        username : usernameNew,
        password,
        confirmPassword,
        role,
        npsn,
        nama_sekolah,
      };

      await axiosJWT.post(`${import.meta.env.VITE_API_URL}/tambahUser`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil Membuat User Baru!",
        showConfirmButton: false,
        timer: 2000,
      });

      setTimeout(() => {
        getDataUser();
        handlePopupClose();
      }, 2000);
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.msg;
        setMsg(errorMessage);
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data!",
          text: errorMessage,
        });
      } else {
        console.error("Unexpected error:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data!",
          text: "Terjadi kesalahan",
        });
      }
    }
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
        handleUpdatePasswordPopupClose();
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

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handleUpdatePasswordPopupOpen = () => {
    setShowUpdatePasswordPopup(true);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
 

  const handlePopupClose = () => {
    setShowPopup(false);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
    setNpsn("");
    setNama_sekolah("");
    setMsg("");
  };

  const handleUpdatePasswordPopupClose = () => {
    setShowUpdatePasswordPopup(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMsg("");
  };

  return (
    <>
      <section className="flex pr-3">
        <section>
          <NavbarAdmin />
        </section>
        <section className="mt-16 w-11/12 mx-auto h-full">
          <div className="flex justify-between">
            <p className="font-body text-base font-bold text-secondary">{`Data Users`}</p>
            <div className="flex gap-5">
            <ButtonPassword onClick={handleUpdatePasswordPopupOpen}>

          </ButtonPassword>
            <ButtonTambah
              onClick={handlePopupOpen}
              text="Tambah User Baru"
            >
          </ButtonTambah>
          
            </div>
          </div>
          <div className="w-full mx-auto mb-10 mt-5 px-5 h-full border border-gray-300 shadow-md rounded-lg overflow-y-auto">
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
                <p>Search:</p>
                <input
                  type="text"
                  placeholder="Search by Username"
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <table className="w-full mt-5 font-body text-xs text-secondary">
              <thead>
                <tr className="border-y-2 border-gray-300">
                  <th className="font-medium py-4 px-4">NO</th>
                  <th className="font-medium py-4 px-4">NPSN</th>
                  <th className="font-medium py-4 px-4">USERNAME</th>
                  <th className="font-medium py-4 px-4">NAMA SEKOLAH</th>
                  <th className="font-medium py-4 px-4">ROLE</th>
                  <th className="font-medium py-4 px-4">AKSI</th>
                </tr>
              </thead>
              <tbody className="border-b">
                {currentData.length > 0 ? (
                  currentData.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                      <td className="py-3 px-4 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="py-3 px-4 text-center">{user.npsn}</td>
                      <td className="py-3 px-4 text-center">{user.username}</td>
                      <td className="py-3 px-4 text-center">{user.nama_sekolah}</td>
                      <td className="py-3 px-4 text-center">{user.role}</td>
                      <td className="py-3 px-4 justify-center flex gap-2">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-500 text-base text-white px-3 py-2 rounded-lg"
                        >
                          <MdDeleteOutline />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Tidak ada data user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-between items-center my-5 font-body text-sm">
              <div>
                {`Showing ${indexOfFirstItem + 1} to ${
                  indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem
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

     {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-1/3 mt-14 p-5 rounded-md shadow-lg">
           <div className="flex justify-between items-center">
           <h2 className="text-lg font-body font-bold mb-4">Tambah User Baru</h2>
           <button onClick={handlePopupClose} className="text-xl"><IoMdClose/></button>
           </div>
            <form onSubmit={saveData} className="font-body text-sm">
              <div className="">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={usernameNew}
                  onChange={(e) => setUsernameNew(e.target.value)}
                  className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Masukkan Username"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Masukkan Password"
                    required
                  />
                  <div
                    className="absolute top-1/3 mt-1 right-3 transform -translate-y-1/2 cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Konfirmasi Password"
                  required
                />
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Yayasan">Yayasan</option>
                </select>
                <label className="block text-sm font-medium text-gray-700">NPSN</label>
                <select
                  value={npsn}
                  onChange={(e) => setNpsn(e.target.value)}
                  className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Pilih NPSN</option>
                  <option value="11001970">11001970</option>
                  <option value="11001860">11001860</option>
                  <option value="11001974">11001974</option>
                </select>
                <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                <select
                  value={nama_sekolah}
                  onChange={(e) => setNama_sekolah(e.target.value)}
                  className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">Pilih Nama Sekolah</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="Yayasan">Yayasan</option>
                </select>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg w-full mt-4 hover:bg-primary-dark"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Popup Update Password */}
      {showUpdatePasswordPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6 w-96">
    <div className="flex justify-between items-center">
           <h2 className="text-lg font-body font-bold mb-4">Ganti Password</h2>
           <button onClick={handleUpdatePasswordPopupClose} className="text-xl"><IoMdClose/></button>
           </div>
      <form onSubmit={updatePassword} className="font-body mt-4">
      <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                    className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                    className="w-full py-2 px-3 mb-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Masukkan Password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg w-full mt-4 hover:bg-primary-dark"
                >
                  Simpan
                </button>
      </form>
    </div>
  </div>
)}

    </>
  );
};

export default KelolaUsers;
