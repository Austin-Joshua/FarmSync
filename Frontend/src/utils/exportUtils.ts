// Utility functions for exporting data to CSV, PDF, and Excel formats
import * as XLSX from 'xlsx';

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string, headers?: string[]): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers
    csvHeaders.join(','),
    // Data rows
    ...data.map(row =>
      csvHeaders.map(header => {
        const value = row[header] || '';
        // Handle values with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export data to PDF format (simplified - creates formatted text document)
 * For full PDF support, consider using jsPDF library
 */
export const exportToPDF = (data: any[], filename: string, title: string, headers?: string[]): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const pdfHeaders = headers || Object.keys(data[0]);
  
  // Create HTML content for printing
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #16a34a; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #16a34a; color: white; padding: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <p>File: ${filename}</p>
      <table>
        <thead>
          <tr>
            ${pdfHeaders.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${pdfHeaders.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>FarmSync - Digital Farm Record Management System</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      // Optionally close after printing
      // printWindow.close();
    }, 250);
  }
};

/**
 * Export report data (for Reports page)
 */
export const exportReportData = (reportType: string, data: any[], format: 'csv' | 'pdf' = 'csv'): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `FarmSync_Report_${reportType}_${timestamp}`;
  const title = `FarmSync ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
  
  if (format === 'csv') {
    exportToCSV(data, filename);
  } else {
    exportToPDF(data, filename, title);
  }
};

/**
 * Export history data (for History page)
 */
export const exportHistoryData = (data: any[], type: 'income' | 'stock', format: 'csv' | 'pdf' = 'csv'): void => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `FarmSync_History_${type}_${timestamp}`;
  const title = `FarmSync ${type.charAt(0).toUpperCase() + type.slice(1)} History`;
  
  if (format === 'csv') {
    exportToCSV(data, filename);
  } else {
    exportToPDF(data, filename, title);
  }
};

/**
 * Format currency for export
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date for export
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Export data to Excel format (.xlsx)
 */
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1', headers?: string[]): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object if not provided
  const excelHeaders = headers || Object.keys(data[0]);
  
  // Prepare data for Excel
  const worksheetData = [
    excelHeaders, // Header row
    ...data.map(row =>
      excelHeaders.map(header => {
        const value = row[header] || '';
        // Format dates
        if (value instanceof Date) {
          return value.toLocaleDateString('en-IN');
        }
        return value;
      })
    ),
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = excelHeaders.map((header, index) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => {
        const value = row[header] || '';
        return String(value).length;
      })
    );
    return { wch: Math.min(maxLength + 2, 50) }; // Max width 50
  });
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file and download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export report data with multiple sheets (for complex reports)
 */
export const exportToExcelMultiSheet = (
  sheets: Array<{ name: string; data: any[]; headers?: string[] }>,
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ name, data, headers }) => {
    if (!data || data.length === 0) return;

    const excelHeaders = headers || Object.keys(data[0]);
    const worksheetData = [
      excelHeaders,
      ...data.map(row =>
        excelHeaders.map(header => {
          const value = row[header] || '';
          if (value instanceof Date) {
            return value.toLocaleDateString('en-IN');
          }
          return value;
        })
      ),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const columnWidths = excelHeaders.map((header) => {
      const maxLength = Math.max(
        header.length,
        ...data.map(row => {
          const value = row[header] || '';
          return String(value).length;
        })
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
