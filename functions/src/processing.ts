import { HttpsError } from "firebase-functions/v2/https";

export function validateImages(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 3)
    throw new HttpsError("invalid-argument", "Envía entre 1 y 3 imágenes.");
  let total = 0;
  for (const image of value) {
    if (
      typeof image !== "string" ||
      image.length > 2_800_000 ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(image)
    )
      throw new HttpsError(
        "invalid-argument",
        "Imagen JPEG inválida o demasiado grande.",
      );
    const bytes = Buffer.from(image.slice(image.indexOf(",") + 1), "base64");
    if (
      bytes.length < 4 ||
      bytes[0] !== 0xff ||
      bytes[1] !== 0xd8 ||
      bytes[2] !== 0xff
    )
      throw new HttpsError(
        "invalid-argument",
        "El archivo no es una imagen JPEG.",
      );
    total += image.length;
  }
  if (total > 6_000_000)
    throw new HttpsError(
      "invalid-argument",
      "El conjunto de imágenes es demasiado grande. Recorta o reduce las fotografías.",
    );
  return value as string[];
}

export function parseTranscription(value: unknown): {
  title: string;
  content: string;
  warnings: string[];
} {
  const response = value as {
    status?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  } | null;
  if (response?.status !== "completed")
    throw new HttpsError(
      "unavailable",
      "La transcripción quedó incompleta. Prueba con menos páginas.",
    );
  const parts = response.output?.flatMap((item) => item.content ?? []) ?? [];
  if (parts.some((part) => part.type === "refusal"))
    throw new HttpsError(
      "failed-precondition",
      "No se pudo transcribir esta imagen. Prueba con otra fotografía.",
    );
  const text = parts
    .filter((part) => part.type === "output_text")
    .map((part) => part.text ?? "")
    .join("");
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new HttpsError(
      "internal",
      "La IA no devolvió una transcripción válida.",
    );
  }
  const song = parsed as {
    title?: unknown;
    content?: unknown;
    warnings?: unknown;
  } | null;
  if (
    !song ||
    typeof song.title !== "string" ||
    typeof song.content !== "string" ||
    !song.content.trim() ||
    !Array.isArray(song.warnings) ||
    !song.warnings.every((item) => typeof item === "string") ||
    song.content.length > 60000
  )
    throw new HttpsError(
      "internal",
      "La transcripción tiene un formato o tamaño inválido.",
    );
  return {
    title: song.title.trim().slice(0, 250) || "Sin título",
    content: song.content,
    warnings: song.warnings.slice(0, 30).map((item) => item.slice(0, 500)),
  };
}
