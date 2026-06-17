import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function escapeHTML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatCellValue(val: unknown): string {
  if (val == null) return '';
  return escapeHTML(String(val));
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  const rows = data.map((row) =>
    `<tr>${headers.map((h) => `<td>${formatCellValue(row[h])}</td>`).join('')}</tr>`
  ).join('\n');

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${escapeHTML(filename)}</x:Name>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; width: 100%; }
    th { background-color: #1a1a2e; color: #ffffff; padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid #333; }
    td { padding: 6px 12px; border: 1px solid #d0d0d0; }
    tr:nth-child(even) td { background-color: #f5f5fa; }
    tr:nth-child(odd) td { background-color: #ffffff; }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>${headers.map((h) => `<th>${escapeHTML(h)}</th>`).join('')}</tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
