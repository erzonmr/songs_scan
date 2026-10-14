import { HttpsError } from "firebase-functions/v2/https";
export type Usage = {
  day: string;
  hour: string;
  daily: number;
  hourly: number;
  lastRequest: number;
};
export function nextUsage(
  previous: Partial<Usage> | undefined,
  now: number,
): Usage {
  const day = new Date(now).toISOString().slice(0, 10);
  const hour = new Date(now).toISOString().slice(0, 13);
  const daily = previous?.day === day ? Number(previous.daily) || 0 : 0;
  const hourly = previous?.hour === hour ? Number(previous.hourly) || 0 : 0;
  if (
    daily >= 30 ||
    hourly >= 10 ||
    now - (Number(previous?.lastRequest) || 0) < 10_000
  )
    throw new HttpsError(
      "resource-exhausted",
      "Límite de IA alcanzado (10 intentos/hora, 30/día y 10 segundos entre intentos). Inténtalo más tarde.",
    );
  return { day, hour, daily: daily + 1, hourly: hourly + 1, lastRequest: now };
}
