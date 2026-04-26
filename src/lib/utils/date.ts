export function formatDateToBR(isoDate: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateToISO(brDate: string): string {
  if (!brDate) return '';
  const parts = brDate.split('/');
  if (parts.length !== 3) return '';

  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  return `${year}-${month}-${day}`;
}

export function formatBRDateInput(value: string): string {
  const only = value.replace(/\D/g, '');

  if (only.length <= 2) return only;
  if (only.length <= 4) return `${only.slice(0, 2)}/${only.slice(2)}`;
  return `${only.slice(0, 2)}/${only.slice(2, 4)}/${only.slice(4, 8)}`;
}
