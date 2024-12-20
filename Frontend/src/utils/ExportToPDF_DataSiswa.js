import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (data, { tingkatSekolah, tahunPelajaran, tingkatKelas }) => {
    const doc = new jsPDF({
        format: 'a4',
        unit: 'mm',  // Use millimeters for measurements
    });

    doc.setFontSize(10);
    doc.text(
      `Data Siswa ${tingkatSekolah} Muhammadiyah Tanjungpinang \n${tingkatKelas} Tahun Pelajaran ${tahunPelajaran}`,
      doc.internal.pageSize.width / 2, 
      15, 
      { align: 'center' }
    );
  

    // Table Header
    const tableColumn = ["NO", "NISN", "NAMA SISWA", "NAMA ORANG TUA", "NO HP ORANG TUA", "BIAYA SPP"];
    const tableRows = [];

    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Table Rows
    data.forEach((siswa, index) => {
        const siswaData = [
            index + 1,
            siswa.nisn,
            siswa.nama_siswa,
            siswa.nama_orangtua,
            siswa.no_hp_orangtua,
            currencyFormatter.format(siswa.biaya_spp)  // Format biaya_spp as currency
        ];
        tableRows.push(siswaData);
    });

    // Adding table to the PDF
    doc.autoTable(tableColumn, tableRows, { startY: 30, styles: { 
        fontSize: 7} });

    // Save the PDF
    doc.save(`DataSiswa_${tingkatSekolah}_${tingkatKelas}.pdf`);
};
