import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (data, { tingkatSekolah, tahunPelajaran }) => {
    const doc = new jsPDF({
        format: 'a4',
        unit: 'mm',  // Use millimeters for measurements
    });

    doc.setFontSize(10);
    doc.text(
      `Data Guru ${tingkatSekolah} Muhammadiyah Tanjungpinang \nTahun Pelajaran ${tahunPelajaran}`,
      doc.internal.pageSize.width / 2, 
      15, 
      { align: 'center' }
    );
  

    // Table Header
    const tableColumn = ["NO", "NPSN", "NAMA GURU", "GAJI GURU"];
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
            siswa.npsn,
            siswa.nama_guru,
            currencyFormatter.format(siswa.gaji_guru)  // Format biaya_spp as currency
        ];
        tableRows.push(siswaData);
    });

    // Adding table to the PDF
    doc.autoTable(tableColumn, tableRows, { startY: 30, styles: { 
        fontSize: 7} });

    // Save the PDF
    doc.save(`DataGuru_${tingkatSekolah}.pdf`);
};
