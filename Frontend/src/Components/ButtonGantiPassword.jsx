import React from "react";
import { IoKeyOutline } from "react-icons/io5";


const ButtonPassword = ({onClick}) => {
  return (
    <button
      onClick={onClick} 
      className=" px-4 py-3 flex items-center gap-2 bg-accent hover:bg-primary duration-300 rounded-md shadow-md font-body text-white text-xs"
    >
    <IoKeyOutline className="text-base"/>
      Ganti Password
    </button>
  );
};

export default ButtonPassword;
