import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = async (data, { tahunPelajaran, nama_sekolah, periode}) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 330] }); // F4 size

    // Lebar dan tinggi halaman F4
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(12);
    doc.text(
        `Laporan Rencana Belanja ${nama_sekolah} Muhammadiyah Tanjungpinang \nPeriode ${periode} Tahun Pelajaran ${tahunPelajaran}`,
        pageWidth / 2, 
        20, 
        { align: 'center' }
    );

    // Table Header
    const tableColumn = ["NO", "KODE NOTA", "TANGGAL PENGAJUAN", "NAMA BARANG", "JUMLAH HARGA", "HARGA SATUAN", "TOTAL HARGA", "STATUS PENGAJUAN", "KETERANGAN"];
    const tableRows = [];

    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Date formatter
    const dateFormatter1 = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let total_belanja = 0;


    data.forEach((belanja, index) => {
        total_belanja += belanja.total_harga;
        const belanjaData = [
            index + 1,
            belanja.kode_nota || '',
            belanja.tanggal_pengajuan ? dateFormatter1.format(new Date(belanja.tanggal_pengajuan)) : '',
            belanja.nama_barang || '',
            belanja.jumlah_barang || '',
            currencyFormatter.format(belanja.harga_satuan),
            currencyFormatter.format(belanja.total_harga),
            belanja.status_pengajuan || '',
            belanja.keterangan || '',
        ];
        tableRows.push(belanjaData);
    });

    // Add table with autoTable
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        styles: {
            fontSize: 9,
            halign: 'center',
            valign: 'middle',
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center', valign: 'middle' }, 
            1: { cellWidth: 30, halign: 'center', valign: 'middle' }, 
            2: { cellWidth: 30, halign: 'center', valign: 'middle' }, 
            3: { cellWidth: 50, halign: 'center', valign: 'middle' }, 
            4: { cellWidth: 25, halign: 'center', valign: 'middle' }, 
            5: { cellWidth: 40, halign: 'center', valign: 'middle' }, 
            6: { cellWidth: 40, halign: 'center', valign: 'middle' }, 
            7: { cellWidth: 30, halign: 'center', valign: 'middle' }, 
            8: { cellWidth: 40, halign: 'center', valign: 'middle' }, 
        },
        foot: [
            [
                "", 
                "", 
                "", 
                "", 
                "", 
                "Total",
                currencyFormatter.format(total_belanja),
                "",
                ""
            ]
        ],
        footStyles: {
            fillColor: [245, 245, 245],
            textColor: [33, 33, 33],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
        },
        margin: { horizontal: (pageWidth - 290) / 2 },
    });

    // Save the PDF
    doc.save(`Laporan_Rencana_Belanja_${nama_sekolah}_${tahunPelajaran}_Periode_${periode}.pdf`);
};
