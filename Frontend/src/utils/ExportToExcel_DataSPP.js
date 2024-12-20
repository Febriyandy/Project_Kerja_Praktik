import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportToExcel = (data, filterInfo) => {
    const { tingkatSekolah, tahunPelajaran, tingkatKelas } = filterInfo;

    // Format header
    const title = [
        [`Daftar SPP`],
        [`${tingkatSekolah} Muhammadiyah Tanjungpinang ${tingkatKelas}`],
        [`Tahun Pelajaran ${tahunPelajaran}`],
        [] // Empty row for spacing
    ];

    const header = [
        ["NO", "NAMA SISWA", "SPP", "BULAN", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "JUL", "AGST", "SEP", "OKT", "NOV", "DES", "JAN", "FEB", "MAR", "APR", "MEI", "JUN"]
    ];

    // Format currency in Rupiah
    const formatCurrency = (value) => {
        return value !== null && value !== undefined
            ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
            : "";
    };

    // Mapping data
    const rows = data.map((item, index) => [
        index + 1,
        item.nama_siswa || "",
        formatCurrency(item.biaya_spp),
        formatCurrency(item.juli),
        formatCurrency(item.agustus),
        formatCurrency(item.september),
        formatCurrency(item.oktober),
        formatCurrency(item.november),
        formatCurrency(item.desember),
        formatCurrency(item.januari),
        formatCurrency(item.februari),
        formatCurrency(item.maret),
        formatCurrency(item.april),
        formatCurrency(item.mei),
        formatCurrency(item.juni)
    ]);

    // Calculate totals
    const totals = rows.reduce((acc, row) => {
        for (let i = 2; i < row.length; i++) {
            acc[i] = (acc[i] || 0) + (row[i] !== "" ? parseFloat(row[i].replace(/[^\d]/g, '')) : 0);
        }
        return acc;
    }, []);

    // Add total row with formatted currency
    const totalRow = ["", "TOTAL", ...totals.slice(2).map(total => formatCurrency(total))];

    // Combine all data
    const allData = [...title, ...header, ...rows, totalRow];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    const colWidths = [
        { wch: 5 },  // NO
        { wch: 30 }, // NAMA SISWA
        { wch: 15 }, // SPP
        ...Array(12).fill({ wch: 12 }) // Months
    ];
    ws['!cols'] = colWidths;

    // Merge cells for title, header, and NO, NAMA SISWA, SPP columns
    const merge = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Title row
        { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }, // Title row
        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // Title row
        { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // Merge NO column with its row
        { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } }, // Merge NAMA SISWA column with its row
        { s: { r: 4, c: 2 }, e: { r: 5, c: 2 } }, // Merge SPP column with its row
        { s: { r: 4, c: 3 }, e: { r: 4, c: 14 } }, // Merge BULAN with months row
    ];
    ws['!merges'] = merge;

    // Style the cells
    for (let i = 0; i < allData.length; i++) {
        for (let j = 0; j < allData[i].length; j++) {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: j });
            if (!ws[cellRef]) ws[cellRef] = {};

            // Title styles
            if (i < 3) {
                ws[cellRef].s = {
                    font: { bold: true, sz: 14 },
                    alignment: { horizontal: 'right', vertical: 'right', wrapText: true }
                };
            }
            // Header styles
            else if (i === 4 || i === 5) {
                ws[cellRef].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "2980B9" } },
                    alignment: { horizontal: 'right', vertical: 'right', wrapText: true }
                };
            }
            // Total row styles
            else if (i === allData.length - 1) {
                ws[cellRef].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "C8C8C8" } },
                    alignment: { horizontal: j === 1 ? 'left' : 'right', vertical: 'right' }
                };
            }
            // Data styles
            else {
                ws[cellRef].s = {
                    alignment: { 
                        horizontal: j === 0 || j === 1 ? 'center' : 'right', 
                        vertical: 'center' 
                    }
                };
            }
            // Add borders to all cells
            ws[cellRef].s = {
                ...ws[cellRef].s,
                border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                }
            };
        }
    }

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data SPP');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(file, `Data_Pembayaran_SPP_${tingkatKelas}.xlsx`);
};