import React, { useState } from "react";
import NavbarAdmin from "../../../Components/NavbarAdmin";
import RiwayatGaji from "./RiwayatGaji";
import RiwayatSPP from "./RiwayatSPP";

const RiwayatPembayaran = () => {
  const [activeTab, setActiveTab] = useState("SPP");

  const renderContent = () => {
    if (activeTab === "SPP") {
      return <RiwayatSPP />;
    } else if (activeTab === "Gaji") {
      return <RiwayatGaji />;
    }
  };

  return (
    <section className="flex pr-3">
      <section>
        <NavbarAdmin />
      </section>
      <section className="min-w-0 h-full mt-16 w-full">
        <p className="font-body text-base font-bold text-secondary">
          Riwayat Pembayaran SPP dan Gaji Guru
        </p>
        <div className="flex mt-5 gap-5">
          <button
            className={`font-body text-sm p-2 border-b-2 ${
              activeTab === "SPP" ? "border-secondary text-secondary" : "border-transparent text-gray-500"
            } hover:bg-gray-100`}
            onClick={() => setActiveTab("SPP")}
          >
            Pembayaran SPP
          </button>
          <button
            className={`font-body text-sm p-2 border-b-2 ${
              activeTab === "Gaji" ? "border-secondary text-secondary" : "border-transparent text-gray-500"
            } hover:bg-gray-100`}
            onClick={() => setActiveTab("Gaji")}
          >
            Pembayaran Gaji Guru
          </button>
        </div>
        <div className="mt-5">
          {renderContent()}
        </div>
      </section>
    </section>
  );
};

export default RiwayatPembayaran;
