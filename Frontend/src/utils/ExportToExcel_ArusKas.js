import * as XLSX from 'xlsx';

export const exportToExcel = (data, { tahunPelajaran, nama_sekolah }) => {
    // Definisikan header untuk tabel
    const header = ["NO","KODE NOTA","BULAN", "TANGGAL", "KETERANGAN", "DEBIT", "KREDIT", "SALDO"];

    // Formatter untuk currency dan tanggal
    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Variabel untuk menyimpan total debit, kredit, dan saldo
    let totalDebit = 0;
    let totalKredit = 0;
    let totalSaldo = 0;

    // Data untuk Excel
    const excelRows = [];

    // Tambahkan judul pada baris pertama dan kedua
    excelRows.push([`Laporan Arus Kas ${nama_sekolah} Muhammadiyah Tanjungpinang`]);
    excelRows.push([`Tahun Pelajaran ${tahunPelajaran}`]);
    excelRows.push([]); // Baris kosong untuk pemisah
    excelRows.push(header); // Header pada baris ke-5

    // Buat data row berdasarkan data yang diterima
    data.forEach((infaq, index) => {
        const debit = infaq.debit || 0;
        const kredit = infaq.kredit || 0;
        const saldo = infaq.saldo || 0;

        totalDebit += debit;
        totalKredit += kredit;
        totalSaldo = saldo; // Ambil saldo terakhir

        // Masukkan data row mulai dari baris ke-5
        excelRows.push([
            index + 1, 
            infaq.kode_nota || '',
            infaq.bulan || '',
            infaq.tanggal ? dateFormatter.format(new Date(infaq.tanggal)) : '', // TANGGAL
            infaq.keterangan || '',  // SATUAN
            debit !== 0 ? currencyFormatter.format(debit) : '', // DEBIT
            kredit !== 0 ? currencyFormatter.format(kredit) : '', // KREDIT
            saldo !== 0 ? currencyFormatter.format(saldo) : '' // SALDO
        ]);
    });

    // Menambahkan total debit, kredit, dan saldo akhir
    const totalSaldoAkhir = totalDebit - totalKredit;
    excelRows.push([
        '', '', '', '', 'Total',
        currencyFormatter.format(totalDebit),
        currencyFormatter.format(totalKredit),
        currencyFormatter.format(totalSaldoAkhir)
    ]);

    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    // Mengatur lebar kolom agar terlihat lebih rapih
    const columnWidths = [
        { wpx: 30 }, // NO
        { wpx: 100 }, 
        { wpx: 100 }, 
        { wpx: 100 }, 
        { wpx: 120 }, 
        { wpx: 100 }, 
        { wpx: 100 }, 
        { wpx: 100 }  
    ];
    worksheet['!cols'] = columnWidths;

    // Merge cells untuk judul di baris 1 dan 2
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Merge judul baris pertama
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Merge judul baris kedua
    ];

    const workbook = XLSX.utils.book_new();
   
    // Gantilah karakter terlarang pada nama sheet (misalnya ":" menjadi "-")
    const sanitizedSheetName = `Laporan ${tahunPelajaran}`.replace(/[:\/?*\[\]]/g, "-");

    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);

    // Export file Excel
    XLSX.writeFile(workbook, `Laporan_Arus_Kas_${nama_sekolah}_${tahunPelajaran}.xlsx`);
};
