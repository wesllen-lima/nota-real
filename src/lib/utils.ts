export const BRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const PCT = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`;
