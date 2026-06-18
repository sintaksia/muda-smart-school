// Utility functions untuk registration

// Format tanggal untuk display
export function formatTanggal(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format nomor telepon
export function formatPhoneNumber(phone: string): string {
  if (!phone) return "-";
  return phone.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
}

// Generate initial untuk avatar
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
