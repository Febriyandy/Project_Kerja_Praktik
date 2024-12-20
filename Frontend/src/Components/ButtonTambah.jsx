import React from "react";
import { FaPlus } from "react-icons/fa6";

const ButtonTambah = ({ onClick, text }) => {
  return (
    <button
      onClick={onClick} 
      className=" flex items-center gap-3 px-4 py-3 bg-[#00A9DC] hover:bg-primary rounded-md shadow-md font-body text-white text-xs"
    >
      <FaPlus className="bg-white rounded-sm text-lg p-1 text-primary"/>
      <span>{text}</span>
    </button>
  );
};

export default ButtonTambah;
