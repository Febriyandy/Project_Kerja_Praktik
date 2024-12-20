import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (data, { tahunPelajaran, nama_sekolah }) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Lebar halaman landscape A4
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(12);
    doc.text(
        `Laporan Arus Kas ${nama_sekolah} Muhammadiyah Tanjungpinang \nTahun Pelajaran ${tahunPelajaran}`,
        pageWidth / 2, 
        20, 
        { align: 'center' }
    );

    // Table Header
    const tableColumn = ["NO", "KODE NOTA","BULAN", "TANGGAL", "KETERANGAN", "DEBIT", "KREDIT", "SALDO"];
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
            infaq.kode_nota || '',
            infaq.bulan || '',
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
            1: { cellWidth: 30, halign: 'center', valign: 'middle' }, // KODE NOTA
            2: { cellWidth: 30, halign: 'center', valign: 'middle' }, // TANGGAL
            3: { cellWidth: 30, halign: 'center', valign: 'middle' }, // TANGGAL
            4: { cellWidth: 50, halign: 'center', valign: 'middle' }, // KETERANGAN
            5: { cellWidth: 30, halign: 'center', valign: 'middle' }, // DEBIT
            6: { cellWidth: 30, halign: 'center', valign: 'middle' }, // KREDIT
            7: { cellWidth: 30, halign: 'center', valign: 'middle' }, // SALDO
        },
        foot: [
            [
                "", // No column
                "", // Kode Nota
                "",
                "", // Keterangan
                "Total", // Total
                currencyFormatter.format(totalDebit), // Total Debit
                currencyFormatter.format(totalKredit), // Total Kredit
                currencyFormatter.format(totalSaldoAkhir) // Total Saldo Akhir
            ]
        ],
        footStyles: {
            fillColor: [245, 245, 245], // Background color for totals
            textColor: [33, 33, 33], // Text color for totals
            fontStyle: 'bold',
            halign: 'center', // Horizontal alignment for footer cells
            valign: 'middle', // Vertical alignment for footer cells
        },
        margin: { horizontal: (pageWidth - 240) / 2 } // Center table with approximate width of 240 mm
    });

    // Save the PDF
    doc.save(`Laporan_Arus_Kas_${nama_sekolah}_${tahunPelajaran}.pdf`);
};
