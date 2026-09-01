export interface LeadExportItem {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status: string;
  source: string;
  notes?: string;
  createdAt: string;
  createdDate: string;
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If contains commas, double quotes, or newlines, enclose in quotes and double internal quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportLeadsToCsv(leads: LeadExportItem[], orgSlug: string) {
  if (!leads || leads.length === 0) {
    alert("No leads available to export.");
    return;
  }

  const headers = [
    "Lead ID",
    "Name",
    "Email",
    "Phone",
    "Status",
    "Source",
    "Notes",
    "Created Date",
    "Created ISO",
  ];

  const rows = leads.map((lead) => [
    escapeCsvCell(lead.id),
    escapeCsvCell(lead.name || ""),
    escapeCsvCell(lead.email || ""),
    escapeCsvCell(lead.phone || ""),
    escapeCsvCell(lead.status),
    escapeCsvCell(lead.source),
    escapeCsvCell(lead.notes || ""),
    escapeCsvCell(lead.createdDate),
    escapeCsvCell(lead.createdAt),
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const today = new Date().toISOString().split("T")[0];
  const filename = `leads-${orgSlug || "export"}-${today}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
