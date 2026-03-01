"use client";

import { useEffect, useState } from "react";
import { fetchGastosPublicos, type GastosApiResponse } from "@/services/transparencia";

export function useCguGastos() {
  const [data, setData] = useState<GastosApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGastosPublicos()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
