import * as XLSX from "xlsx";

export const exportToExcel = (data, { tingkatSekolah, tahunPelajaran, tingkatKelas }) => {
    // Titles for the sheet
    const title = [
        [`Data Siswa ${tingkatSekolah} Muhammadiyah Tanjungpinang`],
        [`${tingkatKelas} Tahun Pelajaran ${tahunPelajaran}`],
        [] // Empty row for spacing
    ];

    // Header row for the table
    const header = [
        [ "NO", "NISN", "NAMA SISWA", "NAMA ORANG TUA", "NO HP ORANG TUA", "BIAYA SPP"]
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
        siswa.nisn,  // NISN
        siswa.nama_siswa,
        siswa.nama_orangtua,  // NAMA ORANG TUA
        siswa.no_hp_orangtua,  // NO HP ORANG TUA
        formatCurrency(siswa.biaya_spp)  // BIAYA SPP formatted as currency
    ]));

    // Combine the title, header, and data into a single array
    const worksheetArray = [...title, ...header, ...worksheetData];

    // Create a worksheet from the array
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetArray);

    // Optional: Adjust column widths for better visibility
    worksheet['!cols'] = [
        { wpx: 30 },   // NO
        { wpx: 100 },  // NISN
        { wpx: 200 },  // NAMA SISWA
        { wpx: 200 },  // NAMA ORANG TUA
        { wpx: 150 },  // NO HP ORANG TUA
        { wpx: 150 }   // BIAYA SPP
    ];

    // Optional: Merge cells for the title
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Merge for the first title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }  // Merge for the second title row
    ];

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

    // Save the workbook to a file
    XLSX.writeFile(workbook, `DataSiswa_${tingkatSekolah}_${tingkatKelas}.xlsx`);
};
