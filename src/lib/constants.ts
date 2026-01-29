// Lucenera stock address - origin for delivery routes
export const ENDERECO_ESTOQUE = {
  rua: "R. Dr. Hugo Fortes",
  numero: "1010",
  bairro: "Parque Industrial Lagoinha",
  cidade: "Ribeirão Preto",
  estado: "SP",
  completo: "R. Dr. Hugo Fortes, 1010 – Parque Industrial Lagoinha – Ribeirão Preto/SP",
  // For Google Maps URL generation
  encoded: encodeURIComponent("R. Dr. Hugo Fortes, 1010, Parque Industrial Lagoinha, Ribeirão Preto, SP, Brazil"),
};

// Generate next obra code based on current year
export function generateObraCode(lastCode: string | null): string {
  const currentYear = new Date().getFullYear();
  const yearPrefix = String(currentYear).slice(-2); // "26" for 2026
  
  if (!lastCode || !lastCode.startsWith(yearPrefix)) {
    return `${yearPrefix}001`;
  }
  
  const sequentialPart = parseInt(lastCode.slice(2), 10);
  const nextSequential = String(sequentialPart + 1).padStart(3, '0');
  
  return `${yearPrefix}${nextSequential}`;
}

// Phone mask for Brazilian format
export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// Validate Brazilian phone
export function isValidPhoneBR(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}
