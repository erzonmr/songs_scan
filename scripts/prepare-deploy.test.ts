// @vitest-environment node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
// @ts-expect-error Módulo de scripts Node sin declaraciones TypeScript.
import { deploymentConfig } from "./prepare-deploy.mjs";
const directories: string[] = [];
it("impide publicar un build configurado explícitamente como demo", () => {
  vi.stubEnv("VITE_DEMO_MODE", "true");
  expect(() => deploymentConfig(fixture())).toThrow("modo demo");
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "songscan-config-"));
  directories.push(directory);
  writeFileSync(
    join(directory, ".env.production.local"),
    "VITE_FIREBASE_API_KEY=public-key\nVITE_FIREBASE_AUTH_DOMAIN=songscan-test.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=songscan-test\nVITE_FIREBASE_APP_ID=1:123:web:abc\nVITE_OWNER_UID=owner\nVITE_RECAPTCHA_ENTERPRISE_SITE_KEY=site-key\n",
  );
  return directory;
}
it("rechaza producción sin configuración y acepta configuración completa", () => {
  expect(() => deploymentConfig(fixture())).not.toThrow();
  vi.stubEnv("VITE_OWNER_UID", "");
  expect(() => deploymentConfig(fixture())).toThrow("VITE_OWNER_UID");
});
it("rechaza regiones y propietarios incoherentes", () => {
  vi.stubEnv("VITE_FIREBASE_FUNCTIONS_REGION", "europe-west1");
  expect(() => deploymentConfig(fixture())).toThrow("us-central1");
  vi.stubEnv("VITE_FIREBASE_FUNCTIONS_REGION", "us-central1");
  vi.stubEnv("OWNER_UID", "other-owner");
  expect(() => deploymentConfig(fixture())).toThrow("no coinciden");
});
