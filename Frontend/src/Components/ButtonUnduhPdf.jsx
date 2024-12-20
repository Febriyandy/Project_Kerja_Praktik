import React from "react";
import { FaRegFilePdf } from "react-icons/fa";


const ButtonPdf = ({onClick}) => {
  return (
    <button
      onClick={onClick} 
      className=" px-4 py-3 flex items-center gap-2 bg-accent hover:bg-primary duration-300 rounded-md shadow-md font-body text-white text-xs"
    >
    <FaRegFilePdf className="text-base"/>
      Unduh Data Pdf
    </button>
  );
};

export default ButtonPdf;
