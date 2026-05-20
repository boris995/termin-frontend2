const pad = (value: number) => String(value).padStart(2, '0');

export const formatDateTime = (value?: string | Date | null) => {
  if (!value) return '-';
  const date = new Date(value);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}. ${pad(date.getHours())}h ${pad(date.getMinutes())}min`;
};

export const formatDateOnly = (value?: string | Date | null) => {
  if (!value) return '-';
  const date = new Date(value);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}.`;
};
