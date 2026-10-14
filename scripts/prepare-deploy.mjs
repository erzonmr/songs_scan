import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { loadEnv } from "vite";

export function deploymentConfig(directory = process.cwd()) {
  const values = { ...loadEnv("production", directory, ""), ...process.env };
  if (values.VITE_DEMO_MODE === "true")
    throw new Error("El modo demo no puede publicarse como producción.");
  const required = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_OWNER_UID",
    "VITE_RECAPTCHA_ENTERPRISE_SITE_KEY",
  ];
  const missing = required.filter(
    (key) =>
      !values[key]?.trim() ||
      /REEMPLAZAR|__OWNER|YOUR_|example/i.test(values[key]),
  );
  if (missing.length)
    throw new Error(
      `Configuración de producción pendiente: ${missing.join(", ")}. Completa .env.production.local siguiendo docs/DEPLOYMENT.md.`,
    );
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(values.VITE_FIREBASE_PROJECT_ID))
    throw new Error("Project ID Firebase inválido.");
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(values.VITE_OWNER_UID))
    throw new Error("UID del propietario inválido.");
  if (
    values.VITE_FIREBASE_FUNCTIONS_REGION &&
    values.VITE_FIREBASE_FUNCTIONS_REGION !== "us-central1"
  )
    throw new Error(
      "Esta versión despliega Functions en us-central1. Usa la misma región en el frontend.",
    );
  if (values.OWNER_UID && values.OWNER_UID !== values.VITE_OWNER_UID)
    throw new Error("OWNER_UID y VITE_OWNER_UID no coinciden.");
  if (
    values.GCLOUD_PROJECT &&
    values.GCLOUD_PROJECT !== values.VITE_FIREBASE_PROJECT_ID
  )
    throw new Error(
      "El proyecto seleccionado en Firebase CLI no coincide con la configuración web.",
    );
  return values;
}

export function prepareDeployment() {
  const values = deploymentConfig();
  mkdirSync(".firebase", { recursive: true });
  const template = readFileSync("firestore.rules", "utf8");
  if (!template.includes("__OWNER_UID__"))
    throw new Error(
      "La plantilla de reglas no contiene el marcador de propietario.",
    );
  writeFileSync(
    ".firebase/firestore.rules",
    template.replaceAll("__OWNER_UID__", values.VITE_OWNER_UID),
  );
  const functionEnv = `functions/.env.${values.VITE_FIREBASE_PROJECT_ID}`;
  let previous = "";
  try {
    previous = readFileSync(functionEnv, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const lines = previous
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.startsWith("OWNER_UID="));
  writeFileSync(
    functionEnv,
    [...lines, `OWNER_UID=${values.VITE_OWNER_UID}`, ""].join("\n"),
  );
  console.log(
    `Configuración validada para ${values.VITE_FIREBASE_PROJECT_ID}. Reglas y propietario de Functions preparados.`,
  );
  return values;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    prepareDeployment();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
