import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (data, { tahunPelajaran }) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Lebar halaman landscape A4
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(12);
    doc.text(
        `Laporan Arus Kas Majelis Dikdasmen dan PNF Muhammadiyah Tanjungpinang \nTahun Pelajaran ${tahunPelajaran}`,
        pageWidth / 2, 
        20, 
        { align: 'center' }
    );

    // Table Header
    const tableColumn = ["NO", "TANGGAL", "KETERANGAN", "DEBIT", "KREDIT", "SALDO"];
    const tableRows = [];

    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Date formatter
    const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    // Variabel untuk menyimpan total debit, kredit, dan saldo
    let totalDebit = 0;
    let totalKredit = 0;
    let totalSaldo = 0;

    // Table Rows
    data.forEach((infaq, index) => {
        const debit = infaq.debit || 0;
        const kredit = infaq.kredit || 0;
        const saldo = infaq.saldo || 0;

        totalDebit += debit;
        totalKredit += kredit;
        totalSaldo = saldo; // Ambil saldo terakhir untuk total

        const infaqData = [
            index + 1,
            infaq.tanggal ? dateFormatter.format(new Date(infaq.tanggal)) : '',
            infaq.keterangan || '',
            debit !== 0 ? currencyFormatter.format(debit) : '',
            kredit !== 0 ? currencyFormatter.format(kredit) : '',
            saldo !== 0 ? currencyFormatter.format(saldo) : '',
        ];
        tableRows.push(infaqData);
    });

    // Menghitung total saldo akhir (total debit - total kredit)
    const totalSaldoAkhir = totalDebit - totalKredit;

    // Menambahkan tabel ke PDF dengan penyesuaian lebar kolom dan margin untuk memusatkan tabel
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: {
            fontSize: 10,
            halign: 'center',  // Horizontal alignment for all cells
            valign: 'middle',  // Vertical alignment for all cells
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' }, // NO
            1: { cellWidth: 30, halign: 'center', valign: 'middle' }, 
            4: { cellWidth: 30, halign: 'center', valign: 'middle' }, // DEBIT
            5: { cellWidth: 30, halign: 'center', valign: 'middle' }, // KREDIT
            6: { cellWidth: 30, halign: 'center', valign: 'middle' }, // SALDO
        },
        foot: [
            [
                "", // No column
                "", // Keterangan
                "Total", // Satuan
                currencyFormatter.format(totalDebit), // Total Debit
                currencyFormatter.format(totalKredit), // Total Kredit
                currencyFormatter.format(totalSaldoAkhir) // Total Saldo Akhir
            ]
        ],
        footStyles: {
            fillColor: [245, 245, 245], // Warna latar untuk total
            textColor: [33, 33, 33], // Warna teks
            fontStyle: 'bold',
            halign: 'center', // Horizontal alignment for footer cells
            valign: 'middle', // Vertical alignment for footer cells
        },
        margin: { horizontal: (pageWidth - 240) / 2 } // Memusatkan tabel dengan lebar tabel sekitar 240 mm
    });

    // Save the PDF
    doc.save(`Laporan_Arus_Kas_Yayasan_${tahunPelajaran}.pdf`);
};
