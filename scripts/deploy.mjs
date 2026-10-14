import { spawnSync } from "node:child_process";
import { prepareDeployment } from "./prepare-deploy.mjs";
const values = prepareDeployment();
// Los hooks de firebase.json compilan y vuelven a validar antes de publicar.
const result = spawnSync(
  process.platform === "win32" ? "firebase.cmd" : "firebase",
  [
    "deploy",
    "--project",
    values.VITE_FIREBASE_PROJECT_ID,
    "--only",
    "hosting,firestore,functions",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
