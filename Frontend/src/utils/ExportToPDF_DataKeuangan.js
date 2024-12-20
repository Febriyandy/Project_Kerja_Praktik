import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (datadonatur, datakas, { tahunPelajaran, bulan }) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [330, 210]
    });

    // Title
    doc.setFontSize(10);
    doc.text(
        `Laporan Keuangan Majelis Dikdasmen dan PNF Muhammadiyah Tanjungpinang \nTahun Pelajaran ${tahunPelajaran}`,
        doc.internal.pageSize.width / 2,
        15,
        { align: 'center' }
    );

    // Menambahkan jarak antara judul dan tabel
    const startYPosition = 35;

    // Table Header
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

    const tableRows = [];

    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Variabel untuk menyimpan total pendapatan dan pengeluaran
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

        // Menghitung pendapatan dan pengeluaran
        const pendapatan = SAT + danaBOS + spp;
        const pengeluaran = gajiGuru + operasional + lainnya;
        const saldo = pendapatan - pengeluaran;

        // Add to totals
        totalSaldoAkhirTahun += SAT;
        totalDanaBOS += danaBOS;
        totalSPP += spp;
        totalGajiGuru += gajiGuru;
        totalOperasional += operasional;
        totalLainnya += lainnya;
        totalPendapatan += pendapatan;
        totalPengeluaran += pengeluaran;
        totalSaldo += saldo;

        // Push data to the table rows
        tableRows.push([
            index + 1,
            item.npsn === 11001970 ? "SD Muhammadiyah" : item.npsn === 11001860 ? "SMP Muhammadiyah" : "SMA Muhammadiyah",
            currencyFormatter.format(SAT), // Menggunakan saldo akhir tahun
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

    // Variabel untuk total dari donatur
    let totalDebitDonatur = 0;
    let totalKreditDonatur = 0;
    let totalSaldoDonatur = 0;

    // Baris baru untuk Donatur
    datadonatur.forEach((item) => {
        const debitDonatur = parseInt(item.total_debit, 10) || 0;
        const kreditDonatur = parseInt(item.total_kredit, 10) || 0;
        const saldoDonatur = parseInt(item.saldo, 10) || 0;

        // Tambahkan ke total donatur
        totalDebitDonatur += debitDonatur;
        totalKreditDonatur += kreditDonatur;
        totalSaldoDonatur += saldoDonatur;

        tableRows.push([
            tableRows.length + 1, // Nomor urut
            "Kas Yayasan",
            "-", // Kolom DANA BOS
            "-", // Kolom SPP
            "-", // Kolom GAJI GURU
            "-", // Kolom OPERASIONAL
            "-", // Kolom LAINNYA
            "-", // Kolom LAINNYA
            currencyFormatter.format(debitDonatur), // Kolom PENDAPATAN
            currencyFormatter.format(kreditDonatur), // Kolom PENGELUARAN
            currencyFormatter.format(saldoDonatur), // Kolom SISA SALDO
        ]);
    });

    // Footer row for totals
    tableRows.push([
        { content: "Total", colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
        currencyFormatter.format(totalSaldoAkhirTahun),
        currencyFormatter.format(totalDanaBOS),
        currencyFormatter.format(totalSPP),
        currencyFormatter.format(totalGajiGuru),
        currencyFormatter.format(totalOperasional),
        currencyFormatter.format(totalLainnya),
        currencyFormatter.format(totalPendapatan + totalDebitDonatur),
        currencyFormatter.format(totalPengeluaran + totalKreditDonatur),
        currencyFormatter.format(totalSaldo + totalSaldoDonatur)
    ]);

    // Add table to PDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startYPosition,
        styles: {
            fontSize: 7,
            cellPadding: 1,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { left: 10 },
        
    });

    // Save the PDF
    doc.save(`Laporan_Keuangan_${tahunPelajaran}.pdf`);
};
