import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Datos</x:Name></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; }
  th { background-color: #1a1a2e; color: #fff; padding: 8px 12px; text-align: left; font-weight: 600; border: 1px solid #ccc; }
  td { padding: 6px 12px; border: 1px solid #ddd; }
  tr:nth-child(even) td { background-color: #f8f8f8; }
  tr:hover td { background-color: #e8f0fe; }
</style></head><body><table>
  <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
  <tbody>${data.map((row) =>
    `<tr>${headers.map((h) => {
      const val = row[h];
      const str = val == null ? '' : String(val);
      return `<td>${escapeHtml(str)}</td>`;
    }).join('')}</tr>`
  ).join('')}</tbody>
</table></body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}
