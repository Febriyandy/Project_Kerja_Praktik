import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (datadonatur, datakas, { tahunPelajaran }) => {
    const worksheetData = [];

    // Title rows
    worksheetData.push([`Laporan Keuangan Majelis Dikdasmen dan PNF Muhammadiyah Tanjungpinang`]);
    worksheetData.push([`Tahun Pelajaran ${tahunPelajaran}`]);
    worksheetData.push([]); // Empty row for spacing

    // Table header
    const tableColumn = [
        "NO", 
        "SEKOLAH", 
        "SALDO AKHIR TAHUN", 
        "DANA BOS", 
        "SPP", 
        "GAJI GURU", 
        "OPERASIONAL", 
        "LAINNYA", 
        "PENDAPATAN", 
        "PENGELUARAN", 
        "SISA SALDO"
    ];
    worksheetData.push(tableColumn);

    // Formatter for currency
    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Variables for totals
    let totalSaldoAkhirTahun = 0;
    let totalDanaBOS = 0;
    let totalSPP = 0;
    let totalGajiGuru = 0;
    let totalOperasional = 0;
    let totalLainnya = 0;
    let totalPendapatan = 0;
    let totalPengeluaran = 0;
    let totalSaldo = 0;

    // Populate table rows for kas data
    datakas.forEach((item, index) => {
        const SAT = parseInt(item.saldo_akhir_tahun, 10) || 0;
        const danaBOS = parseInt(item.dana_bos, 10) || 0;
        const spp = parseInt(item.dana_spp, 10) || 0;
        const gajiGuru = parseInt(item.gaji_guru, 10) || 0;
        const operasional = parseInt(item.operasional, 10) || 0;
        const lainnya = parseInt(item.lainnya, 10) || 0;

        const pendapatan = danaBOS + spp + SAT;
        const pengeluaran = gajiGuru + operasional + lainnya;
        const saldo = pendapatan - pengeluaran;

        totalSaldoAkhirTahun += SAT;
        totalDanaBOS += danaBOS;
        totalSPP += spp;
        totalGajiGuru += gajiGuru;
        totalOperasional += operasional;
        totalLainnya += lainnya;
        totalPendapatan += pendapatan;
        totalPengeluaran += pengeluaran;
        totalSaldo += saldo;

        worksheetData.push([
            index + 1,
            item.npsn === 11001970 ? "SD Muhammadiyah" : item.npsn === 11001860 ? "SMP Muhammadiyah" : "SMA Muhammadiyah",
            currencyFormatter.format(SAT),
            currencyFormatter.format(danaBOS),
            currencyFormatter.format(spp),
            currencyFormatter.format(gajiGuru),
            currencyFormatter.format(operasional),
            currencyFormatter.format(lainnya),
            currencyFormatter.format(pendapatan),
            currencyFormatter.format(pengeluaran),
            currencyFormatter.format(saldo),
        ]);
    });

    // Populate table rows for donatur data
    datadonatur.forEach((item, index) => {
        const totalDebitDonatur = parseInt(item.total_debit, 10) || 0;
        const totalKreditDonatur = parseInt(item.total_kredit, 10) || 0;
        const saldoDonatur = parseInt(item.saldo, 10) || 0;

        worksheetData.push([
            datakas.length + index + 1, // Nomor urut
            "Donatur",
            "-", // Kolom DANA BOS
            "-", // Kolom SPP
            "-", // Kolom GAJI GURU
            "-", // Kolom OPERASIONAL
            "-", // Kolom OPERASIONAL
            "-", // Kolom OPERASIONAL
            currencyFormatter.format(totalDebitDonatur), // Kolom PENDAPATAN
            currencyFormatter.format(totalKreditDonatur), // Kolom PENGELUARAN
            currencyFormatter.format(saldoDonatur), // Kolom SISA SALDO
        ]);
    });

    // Footer row for totals
    const totalDebitDonatur = datadonatur.reduce((sum, item) => sum + parseInt(item.total_debit, 10) || 0, 0);
    const totalKreditDonatur = datadonatur.reduce((sum, item) => sum + parseInt(item.total_kredit, 10) || 0, 0);
    const totalSaldoDonatur = datadonatur.reduce((sum, item) => sum + parseInt(item.saldo, 10) || 0, 0);

    worksheetData.push([
        "",
        "Total",
        currencyFormatter.format(totalSaldoAkhirTahun),
        currencyFormatter.format(totalDanaBOS),
        currencyFormatter.format(totalSPP),
        currencyFormatter.format(totalGajiGuru),
        currencyFormatter.format(totalOperasional),
        currencyFormatter.format(totalLainnya),
        currencyFormatter.format(totalPendapatan + totalDebitDonatur),
        currencyFormatter.format(totalPengeluaran + totalKreditDonatur),
        currencyFormatter.format(totalSaldo + totalSaldoDonatur),
    ]);

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Adjust column widths
    worksheet['!cols'] = [
        { wch: 5 },  // NO
        { wch: 20 }, // SEKOLAH
        { wch: 20 }, // DANA BOS
        { wch: 15 }, // DANA BOS
        { wch: 15 }, // SPP
        { wch: 15 }, // GAJI GURU
        { wch: 15 }, // OPERASIONAL
        { wch: 15 }, // OPERASIONAL
        { wch: 15 }, // PENDAPATAN
        { wch: 15 }, // PENGELUARAN
        { wch: 15 }  // SISA SALDO
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan Keuangan`);

    // Create Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Laporan_Keuangan_${tahunPelajaran}.xlsx`);
};
