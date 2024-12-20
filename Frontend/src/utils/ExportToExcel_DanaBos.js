import * as XLSX from "xlsx";

export const exportToExcel = (data, { npsn, tahunPelajaran }) => {
    // Ubah npsn menjadi nama sekolah
    let namaSekolah = '';
    if (npsn === 11001970) {
        namaSekolah = 'SD';
    } else if (npsn === 11001860) {
        namaSekolah = 'SMP';
    } else if (npsn === 11001974) {
        namaSekolah = 'SMA';
    }

    // Membuat header tabel
    const tableColumn = ["NO", "BULAN", "DANA BOS"];
    const tableRows = [];

    let totalDanaBos = 0;

    // Formatter untuk angka mata uang IDR
    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Membuat baris tabel
    data.forEach((bos, index) => {
        totalDanaBos += bos.dana_bos; // Menghitung total
        const bosData = [
            index + 1,
            bos.bulan,
            currencyFormatter.format(bos.dana_bos) // Format mata uang
        ];
        tableRows.push(bosData);
    });

    // Menambahkan baris total di bagian akhir
    tableRows.push(["", "Total", currencyFormatter.format(totalDanaBos)]);

    // Menambahkan judul
    const title = `Laporan Pendapatan Dana Bos ${namaSekolah} Muhammadiyah Tanjungpinang `;
    const subtitle = `Tahun Pelajaran ${tahunPelajaran}`;

    // Gabungkan header, judul, dan data
    const worksheetData = [
        [title],
        [subtitle],
        [], // Baris kosong sebagai pemisah
        [], // Baris kosong untuk padding
        tableColumn, // Kolom tabel
        ...tableRows // Baris tabel
    ];

    // Membuat worksheet dan workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Atur lebar kolom agar rapi
    worksheet['!cols'] = [
        { wpx: 50 },  // Kolom NO
        { wpx: 100 }, // Kolom BULAN
        { wpx: 150 }, // Kolom DANA BOS
    ];

    // Menyimpan file Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Dana Bos");
    XLSX.writeFile(workbook, `Laporan_Dana_Bos_${namaSekolah}_${tahunPelajaran}.xlsx`);
};
