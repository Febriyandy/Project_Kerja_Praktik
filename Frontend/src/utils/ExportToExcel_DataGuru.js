import * as XLSX from "xlsx";

export const exportToExcel = (data, { tingkatSekolah, tahunPelajaran }) => {
    // Titles for the sheet
    const title = [
        [`Data Guru ${tingkatSekolah} Muhammadiyah Tanjungpinang`],
        [`Tahun Pelajaran ${tahunPelajaran}`],
        [] // Empty row for spacing
    ];

    // Header row for the table
    const header = [
        [ "NO", "NPSN", "NAMA GURU", "GAJI GURU"]
    ];

    // Function to format currency in Rupiah
    const formatCurrency = (value) => {
        return value !== null && value !== undefined
            ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
            : "";
    };

    // Prepare the data for the worksheet
    const worksheetData = data.map((siswa, index) => ([
        index + 1,  // NO
        siswa.npsn,  // NISN
        siswa.nama_guru,  // NO HP ORANG TUA
        formatCurrency(siswa.gaji_guru)  // BIAYA SPP formatted as currency
    ]));

    // Combine the title, header, and data into a single array
    const worksheetArray = [...title, ...header, ...worksheetData];

    // Create a worksheet from the array
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetArray);

    // Optional: Adjust column widths for better visibility
    worksheet['!cols'] = [
        { wpx: 30 },   // NO
        { wpx: 100 },  // NISN
        { wpx: 200 },  // NO HP ORANG TUA
        { wpx: 150 }   // BIAYA SPP
    ];

    // Optional: Merge cells for the title
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Merge for the first title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }  // Merge for the second title row
    ];

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Guru");

    // Save the workbook to a file
    XLSX.writeFile(workbook, `DataGuru_${tingkatSekolah}.xlsx`);
};
