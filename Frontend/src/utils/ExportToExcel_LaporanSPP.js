import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = (totals_SD, totals_SMP, totals_SMA, filterInfo) => {
    const { tahunPelajaran } = filterInfo;

    // Format header
    const title = [
        ['Laporan Pendapatan SPP'],
        ['SD SMP SMA Muhammadiyah Tanjungpinang'],
        [`Tahun Pelajaran ${tahunPelajaran}`],
        []
    ];

    const header = [
        ["NO", "SEKOLAH", "BULAN", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "JUL", "AGST", "SEP", "OKT", "NOV", "DES", "JAN", "FEB", "MAR", "APR", "MEI", "JUN", "TOTAL PERTAHUN"]
    ];

    const monthProperties = ['juli', 'agustus', 'september', 'oktober', 'november', 'desember', 'januari', 'februari', 'maret', 'april', 'mei', 'juni'];

    // Function to calculate total per year
    const calculateTotal = (data) => {
        return monthProperties.reduce((acc, month) => acc + (data[month] || 0), 0);
    };

    // Prepare the data
    const data = [
        ...title,
        ...header,
        ['1', 'SD MUHAMMADIYAH', ...monthProperties.map(month => totals_SD[month] || 0), calculateTotal(totals_SD)],
        ['2', 'SMP MUHAMMADIYAH', ...monthProperties.map(month => totals_SMP[month] || 0), calculateTotal(totals_SMP)],
        ['3', 'SMA MUHAMMADIYAH', ...monthProperties.map(month => totals_SMA[month] || 0), calculateTotal(totals_SMA)]
    ];

    // Calculate totals
    const totals = monthProperties.map(month => 
        (totals_SD[month] || 0) + (totals_SMP[month] || 0) + (totals_SMA[month] || 0)
    );
    const grandTotal = totals.reduce((acc, val) => acc + val, 0);

    // Add total row
    data.push(['', 'TOTAL', ...totals, grandTotal]);

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Merge cells
    const merge = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }, // Subtitle row
        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // Tahun Pelajaran row
        { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // Merge NO column with its row
        { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } }, // Merge SEKOLAH column with its row
        { s: { r: 4, c: 3 }, e: { r: 4, c: 14 } } // Merge BULAN header row
    ];
    ws['!merges'] = merge;

    // Set column widths
    const colWidths = [
        { wch: 5 }, // NO
        { wch: 20 }, // SEKOLAH
        ...Array(12).fill({ wch: 15 }), // Months
        { wch: 20 } // TOTAL PERTAHUN
    ];
    ws['!cols'] = colWidths;

    // Apply styles
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = { c: C, r: R };
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if (!ws[cell_ref]) continue;

            ws[cell_ref].s = {
                font: { name: "Arial", sz: 11 },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" }
                }
            };

            // Header styles
            if (R < 4) {
                ws[cell_ref].s.font.bold = true;
            }

            // Align SEKOLAH column to left
            if (C === 1 && R >= 4) {
                ws[cell_ref].s.alignment.horizontal = "left";
            }

            // Apply currency format to numeric cells
            if (R >= 4 && C > 1) {
                ws[cell_ref].z = '#,##0';
            }
        }
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Laporan SPP");

    // Generate Excel file
    XLSX.writeFile(wb, `Laporan_Pendapatan_SPP_${tahunPelajaran}.xlsx`);
};
