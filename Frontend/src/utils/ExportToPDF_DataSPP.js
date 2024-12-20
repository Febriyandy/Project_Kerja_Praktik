import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (data, filterInfo) => {
  const { tingkatSekolah, tahunPelajaran, tingkatKelas } = filterInfo;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [330, 210]
  });

  // Judul dokumen
  doc.setFontSize(10);
  doc.text(
    `Daftar Pembayaran SPP\n${tingkatSekolah} Muhammadiyah Tanjungpinang ${tingkatKelas}\nTahun Pelajaran ${tahunPelajaran}`,
    doc.internal.pageSize.width / 2, 
    15, 
    { align: 'center' }
  );

  // Menambahkan jarak antara judul dan tabel
  const startYPosition = 35;
  
  // Membuat tabel
  const months = ['JUL', 'AGST', 'SEP', 'OKT', 'NOV', 'DES', 'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN'];
  const monthProperties = ['juli', 'agustus', 'september', 'oktober', 'november', 'desember', 'januari', 'februari', 'maret', 'april', 'mei', 'juni'];
  
  const columns = [
    { content: 'NO', rowSpan: 2 },
    { content: 'NAMA SISWA', rowSpan: 2 },
    { content: 'SPP', rowSpan: 2 },
    { content: 'BULAN', colSpan: 12 }
  ];
  const subColumns = months.map(month => ({ content: month }));

  const rows = data.map((siswa, index) => [
    index + 1,
    siswa.nama_siswa,
    formatCurrency(siswa.biaya_spp),
    ...monthProperties.map(month => formatCurrencyOrBlank(siswa[month]))
  ]);

  // Menghitung total
  const totals = data.reduce((acc, siswa) => {
    acc.biaya_spp += siswa.biaya_spp || 0;
    monthProperties.forEach(month => {
      acc[month] += siswa[month] || 0;
    });
    return acc;
  }, { biaya_spp: 0, ...Object.fromEntries(monthProperties.map(m => [m, 0])) });

  // Menambahkan baris total
  const totalRow = [
    '', 'TOTAL',
    formatCurrency(totals.biaya_spp),
    ...monthProperties.map(month => formatCurrency(totals[month]))
  ];
  
  doc.autoTable({
    head: [columns, subColumns],
    body: [...rows],
    foot: [totalRow],
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
      1: { cellWidth: 40, halign: 'left' },
      2: { cellWidth: 22 },
      ...Object.fromEntries(Array(12).fill().map((_, i) => [i + 3, { cellWidth: 20 }]))
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
    margin: {left: 10},
    drawCell: function(cell, opts) {
      var doc = opts.doc;
      doc.setDrawColor(0);
      doc.setLineWidth(0.1);
      doc.rect(cell.x, cell.y, cell.width, cell.height);
    }
  });

  // Simpan PDF
  doc.save(`Data_Pembayaran_SPP_${tingkatKelas}.pdf`);
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

const formatCurrencyOrBlank = (value) => {
  return value === null ? '' : formatCurrency(value);
};