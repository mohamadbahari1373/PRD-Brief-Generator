import * as XLSX from "xlsx";

export interface ParsedSheetData {
  headers: string[];
  rows: Record<string, string>[];
  rawText: string;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file into headers, structured rows, and a raw text summary.
 */
export function parseUploadedFile(file: File): Promise<ParsedSheetData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          return reject(new Error("محتوای فایل خالی است یا خوانده نشد."));
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
          return reject(new Error("شیت معتبری در فایل یافت نشد."));
        }

        // Parse with header array representation
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (rawJson.length === 0) {
          return resolve({ headers: [], rows: [], rawText: "" });
        }

        // Extract headers from the first row and clean them
        const rawHeaders = rawJson[0];
        const headers = rawHeaders.map((h, index) => {
          const val = String(h || "").trim();
          return val ? val : `ستون_${index + 1}`;
        });

        // Convert the remaining rows to key-value objects
        const rows: Record<string, string>[] = [];
        let summaryText = "";

        for (let i = 1; i < rawJson.length; i++) {
          const rowData = rawJson[i];
          // Skip entirely empty rows
          if (!rowData || rowData.length === 0 || rowData.every((cell) => cell === undefined || cell === null || String(cell).trim() === "")) {
            continue;
          }

          const rowObj: Record<string, string> = {};
          let rowSummaryText = `تراکنش #${i}: `;

          headers.forEach((header, colIndex) => {
            const cellValue = rowData[colIndex] !== undefined && rowData[colIndex] !== null
              ? String(rowData[colIndex]).trim()
              : "";
            rowObj[header] = cellValue;
            if (cellValue) {
              rowSummaryText += `[${header}: ${cellValue}] `;
            }
          });

          rows.push(rowObj);
          summaryText += rowSummaryText + "\n";
        }

        resolve({
          headers,
          rows,
          rawText: summaryText.trim(),
        });
      } catch (err: any) {
        reject(new Error(`خطا در خواندن فایل اکسل/CSV: ${err.message || err}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("خطای سیستمی در بارگذاری فایل."));
    };

    reader.readAsBinaryString(file);
  });
}
