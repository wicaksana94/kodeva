export interface Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landingPath?: string;
  capturedAt: string;
}

export const ATTRIBUTION_STORAGE_KEY = 'kodeva:attribution';
export const ATTRIBUTION_TTL_DAYS = 30;

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

function pick(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key)?.trim();
  return value ? value : undefined;
}

/**
 * Mengambil atribusi dari query string. Mengembalikan null jika tidak ada
 * parameter atribusi (utm_* / gclid / fbclid) sama sekali.
 */
export function parseAttribution(
  search: string,
  options: { referrer?: string; pathname?: string; now?: Date } = {},
): Attribution | null {
  const params = new URLSearchParams(search);
  const values: Partial<Record<(typeof UTM_KEYS)[number], string>> = {};
  for (const key of UTM_KEYS) {
    const value = pick(params, key);
    if (value) values[key] = value;
  }
  if (Object.keys(values).length === 0) return null;

  const attribution: Attribution = { capturedAt: (options.now ?? new Date()).toISOString() };
  if (values.utm_source) attribution.utmSource = values.utm_source;
  if (values.utm_medium) attribution.utmMedium = values.utm_medium;
  if (values.utm_campaign) attribution.utmCampaign = values.utm_campaign;
  if (values.utm_content) attribution.utmContent = values.utm_content;
  if (values.utm_term) attribution.utmTerm = values.utm_term;
  if (values.gclid) attribution.gclid = values.gclid;
  if (values.fbclid) attribution.fbclid = values.fbclid;
  if (options.referrer) attribution.referrer = options.referrer;
  if (options.pathname) attribution.landingPath = options.pathname;
  return attribution;
}

export function saveAttribution(
  attribution: Attribution,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void {
  storage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
}

/** Mengembalikan atribusi tersimpan bila belum kedaluwarsa (default 30 hari). */
export function getStoredAttribution(
  options: { now?: Date; ttlDays?: number } = {},
  storage?: Pick<Storage, 'getItem'>,
): Attribution | null {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
  if (!store) return null;
  const raw = store.getItem(ATTRIBUTION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Attribution;
    if (!parsed || typeof parsed !== 'object' || !parsed.capturedAt) return null;
    const now = options.now ?? new Date();
    const ttlMs = (options.ttlDays ?? ATTRIBUTION_TTL_DAYS) * 24 * 60 * 60 * 1000;
    if (now.getTime() - new Date(parsed.capturedAt).getTime() > ttlMs) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAttribution(storage: Pick<Storage, 'removeItem'> = window.localStorage): void {
  storage.removeItem(ATTRIBUTION_STORAGE_KEY);
}
