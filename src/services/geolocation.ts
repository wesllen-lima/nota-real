import { z } from "zod";

// Nominatim (OpenStreetMap) - gratuito, sem API key
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const NominatimAddressSchema = z.object({
  address: z.object({
    state: z.string().optional(),
    country_code: z.string(),
    // ISO 3166-2 retorna "BR-SP" -> extraimos "SP"
    "ISO3166-2-lvl4": z.string().optional(),
  }),
});

export interface GeolocationResult {
  uf: string;
  stateName: string;
  latitude: number;
  longitude: number;
}

export type GeolocationErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "REVERSE_GEOCODE_ERROR"
  | "NOT_BRAZIL"
  | "UNSUPPORTED";

export interface GeolocationError {
  code: GeolocationErrorCode;
  message: string;
}

function extractUFFromISO(iso: string): string | null {
  // "BR-SP" -> "SP"
  const match = /^BR-([A-Z]{2})$/.exec(iso.toUpperCase());
  return match ? match[1] : null;
}

function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject({ code: "UNSUPPORTED", message: "Geolocation nao suportada" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => {
        const codeMap: Record<number, GeolocationErrorCode> = {
          1: "PERMISSION_DENIED",
          2: "POSITION_UNAVAILABLE",
          3: "TIMEOUT",
        };
        reject({
          code: codeMap[err.code] ?? "POSITION_UNAVAILABLE",
          message: err.message,
        });
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  });
}

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ uf: string; stateName: string }> {
  const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`;
  const res = await fetch(url, {
    headers: { "User-Agent": "NotaReal/1.0 (transparencia fiscal)" },
  });
  if (!res.ok) {
    throw { code: "REVERSE_GEOCODE_ERROR", message: `Nominatim ${res.status}` };
  }
  const raw = await res.json();
  const parsed = NominatimAddressSchema.parse(raw);

  if (parsed.address.country_code !== "br") {
    throw { code: "NOT_BRAZIL", message: "Localizacao fora do Brasil" };
  }

  const iso = parsed.address["ISO3166-2-lvl4"];
  const uf = iso ? extractUFFromISO(iso) : null;

  if (!uf) {
    throw {
      code: "REVERSE_GEOCODE_ERROR",
      message: "Nao foi possivel determinar a UF a partir das coordenadas",
    };
  }

  return { uf, stateName: parsed.address.state ?? uf };
}

/**
 * Detecta automaticamente a UF do usuario via Geolocation API + Nominatim.
 * Retorna null em caso de erro (fallback para selecao manual).
 */
export async function detectUF(): Promise<GeolocationResult | null> {
  try {
    const coords = await getCurrentPosition();
    const { uf, stateName } = await reverseGeocode(
      coords.latitude,
      coords.longitude
    );
    return {
      uf,
      stateName,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  } catch {
    return null;
  }
}
