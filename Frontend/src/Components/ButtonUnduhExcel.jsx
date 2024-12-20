import React from "react";
import { FaRegFileExcel } from "react-icons/fa";


const ButtonExcel = ({onClick}) => {
  return (
    <button
      onClick={onClick} 
      className=" px-4 py-3 flex items-center gap-2 bg-accent hover:bg-primary duration-300 rounded-md shadow-md font-body text-white text-xs"
    >
    <FaRegFileExcel className="text-base"/>
      Unduh Data Excel
    </button>
  );
};

export default ButtonExcel;
