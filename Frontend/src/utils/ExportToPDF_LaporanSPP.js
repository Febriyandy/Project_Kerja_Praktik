import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (totals_SD, totals_SMP, totals_SMA, filterInfo) => {
    const { tahunPelajaran } = filterInfo;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [330, 210] });

    // Judul dokumen
    doc.setFontSize(10);
    doc.text(
        `Laporan Pendapatan SPP\nSD SMP SMA Muhammadiyah Tanjungpinang\nTahun Pelajaran ${tahunPelajaran}`,
        doc.internal.pageSize.width / 2, 15,
        { align: 'center' }
    );

    // Menambahkan jarak antara judul dan tabel
    const startYPosition = 35;

    // Membuat tabel
    const months = ['JUL', 'AGST', 'SEP', 'OKT', 'NOV', 'DES', 'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN'];
    const monthProperties = ['juli', 'agustus', 'september', 'oktober', 'november', 'desember', 'januari', 'februari', 'maret', 'april', 'mei', 'juni'];

    const columns = [
        { content: 'NO', rowSpan: 2 },
        { content: 'SEKOLAH', rowSpan: 2 },
        { content: 'BULAN', colSpan: 12 },
        { content: 'TOTAL PERTAHUN', rowSpan: 2 }
    ];

    const subColumns = months.map(month => ({ content: month }));

    // Fungsi untuk menghitung total per tahun
    const calculateTotal = (data) => {
        return monthProperties.reduce((acc, month) => acc + (data[month] || 0), 0);
    };

    const rows = [
        ['1', 'SD MUHAMMADIYAH', ...monthProperties.map(month => formatCurrency(totals_SD[month])), formatCurrency(calculateTotal(totals_SD))],
        ['2', 'SMP MUHAMMADIYAH', ...monthProperties.map(month => formatCurrency(totals_SMP[month])), formatCurrency(calculateTotal(totals_SMP))],
        ['3', 'SMA MUHAMMADIYAH', ...monthProperties.map(month => formatCurrency(totals_SMA[month])), formatCurrency(calculateTotal(totals_SMA))]
    ];

    // Menghitung total per bulan dari semua sekolah
    const totals = monthProperties.map(month => 
        (totals_SD[month] || 0) + (totals_SMP[month] || 0) + (totals_SMA[month] || 0)
    );

    const grandTotal = totals.reduce((acc, val) => acc + val, 0);

    // Menambahkan baris total
    const totalRow = [
        '', 'TOTAL', ...totals.map(formatCurrency), formatCurrency(grandTotal)
    ];

    // Menggambar tabel
    doc.autoTable({
        head: [columns, subColumns],
        body: [...rows, totalRow],
        startY: startYPosition,
        styles: {
            fontSize: 7,
            cellPadding: 1,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 30, halign: 'left' },
            ...Object.fromEntries(Array(12).fill().map((_, i) => [i + 2, { cellWidth: 20 }])),
            14: { cellWidth: 25 }
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
        footStyles: {
            fillColor: [200, 200, 200],
            textColor: 0,
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.1,
            lineColor: [0, 0, 0]
        },
        margin: { left: 10 },
        drawCell: function(cell, opts) {
            const doc = opts.doc;
            doc.setDrawColor(0);
            doc.setLineWidth(0.1);
            doc.rect(cell.x, cell.y, cell.width, cell.height);
        }
    });

    // Simpan PDF
    doc.save(`Laporan_Pendapatan_SPP_${tahunPelajaran}.pdf`);
};

// Fungsi untuk memformat nilai menjadi mata uang
const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
};