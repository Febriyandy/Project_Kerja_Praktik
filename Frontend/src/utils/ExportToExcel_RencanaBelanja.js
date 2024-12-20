import XLSX from 'xlsx';

export const exportToExcel = (data, { tahunPelajaran, nama_sekolah, periode, ttd_bendahara, ttd_kasir }) => {
    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Header
    const headers = ["NO", "KODE NOTA", "TANGGAL PENGAJUAN", "NAMA BARANG", "JUMLAH HARGA", "HARGA SATUAN", "TOTAL HARGA", "STATUS PENGAJUAN", "KETERANGAN"];
    wsData.push(headers);

    // Data rows
    const currencyFormatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    });

    const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const dateFormatter1 = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let total_belanja = 0;
    data.forEach((belanja, index) => {
        total_belanja += belanja.total_harga;
        const row = [
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
        wsData.push(row);
    });

    // Add total row
    wsData.push([
        "", "", "", "", "", "Total", currencyFormatter.format(total_belanja), "", ""
    ]);

    // Create worksheet and add it to the workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Rencana Belanja');

    // Save the workbook
    XLSX.writeFile(wb, `Laporan_Rencana_Belanja_${nama_sekolah}_${tahunPelajaran}_Periode_${periode}.xlsx`);
};
