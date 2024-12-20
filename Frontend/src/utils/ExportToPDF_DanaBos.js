import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPDF = (data, { npsn, tahunPelajaran }) => {
    const doc = new jsPDF({
        format: 'a4',
        unit: 'mm',
    });

    // Ubah npsn menjadi nama sekolah
    let namaSekolah = '';
    if (npsn === 11001970) {
        namaSekolah = 'SD';
    } else if (npsn === 11001860) {
        namaSekolah = 'SMP';
    } else if (npsn === 11001974) {
        namaSekolah = 'SMA';
    }

    doc.setFontSize(10);
    doc.text(
      `Laporan Pendapatan Dana Bos\n${namaSekolah} Muhammadiyah Tanjungpinang Tahun Pelajaran ${tahunPelajaran}`,
      doc.internal.pageSize.width / 2,
      15,
      { align: 'center' }
    );

    // Table Header
    const tableColumn = ["NO", "BULAN", "DANA BOS"];
    const tableRows = [];

    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    // Table Rows
    let totalDanaBos = 0;
    data.forEach((bos, index) => {
        totalDanaBos += bos.dana_bos; // Menghitung total
        const bosData = [
            index + 1,
            bos.bulan,
            currencyFormatter.format(bos.dana_bos),
        ];
        tableRows.push(bosData);
    });

    // Menambahkan tabel ke PDF dengan penyesuaian lebar kolom dan margin untuk memusatkan tabel
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: {
            fontSize: 7,
        },
        columnStyles: {
            0: { cellWidth: 10 },  // Kolom NO
            1: { cellWidth: 30 },  // Kolom BULAN
            2: { cellWidth: 50 },  // Kolom DANA BOS
        },
        margin: { left: (doc.internal.pageSize.width - 90) / 2 }, // Memusatkan tabel

        // Menambahkan total di bagian bawah
        foot: [
            ["", "Total", currencyFormatter.format(totalDanaBos)],
        ],
        footStyles: {
            fillColor: [245, 245, 245], // Warna latar untuk total
            textColor: [33, 33, 33], // Warna teks putih
        },
    });

    // Simpan PDF
    doc.save(`Laporan_Dana_Bos_${namaSekolah}_${tahunPelajaran}.pdf`);
};
