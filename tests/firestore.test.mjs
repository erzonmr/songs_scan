import { after, before, beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
let environment;
const song = () => ({
  title: "Canción",
  content: "Letra",
  category: "Prueba",
  favorite: false,
  version: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
const ref = (uid = "owner", pathUid = uid) =>
  doc(
    environment.authenticatedContext(uid).firestore(),
    `users/${pathUid}/songs/test`,
  );
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-songscan",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8").replaceAll(
        "__OWNER_UID__",
        "owner",
      ),
    },
  });
});
beforeEach(async () => environment.clearFirestore());
after(async () => environment?.cleanup());
test("el propietario puede crear, consultar, editar y borrar", async () => {
  const target = ref();
  await assertSucceeds(setDoc(target, song()));
  await assertSucceeds(getDoc(target));
  await assertSucceeds(
    updateDoc(target, {
      content: "Letra corregida",
      version: 2,
      updatedAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(deleteDoc(target));
});
test("deniega otras cuentas, usuarios anónimos y rutas de otro propietario", async () => {
  await assertSucceeds(setDoc(ref(), song()));
  await assertFails(getDoc(ref("stranger", "owner")));
  await assertFails(setDoc(ref("stranger"), song()));
  await assertFails(setDoc(ref("owner", "stranger"), song()));
  await assertFails(
    getDoc(
      doc(
        environment.unauthenticatedContext().firestore(),
        "users/owner/songs/test",
      ),
    ),
  );
});
test("rechaza tipos, tamaños, timestamps y campos extra incorrectos", async () => {
  for (const change of [
    { title: "" },
    { title: "a".repeat(251) },
    { content: "a".repeat(60001) },
    { category: 4 },
    { favorite: "true" },
    { version: 2 },
    { createdAt: Timestamp.fromMillis(0) },
    { extra: true },
  ])
    await assertFails(setDoc(ref(), { ...song(), ...change }));
});
test("rechaza versiones obsoletas, cambios de creación y tipos inválidos al editar", async () => {
  await assertSucceeds(setDoc(ref(), song()));
  for (const change of [
    { version: 1 },
    { version: 2, title: 3 },
    { version: 2, createdAt: Timestamp.fromMillis(0) },
    { version: 2, updatedAt: Timestamp.fromMillis(0) },
  ])
    await assertFails(
      updateDoc(ref(), { updatedAt: serverTimestamp(), ...change }),
    );
});
test("los contadores de consumo son inaccesibles al cliente", async () => {
  const target = doc(
    environment.authenticatedContext("owner").firestore(),
    "internalUsage/owner",
  );
  await assertFails(getDoc(target));
  await assertFails(setDoc(target, { daily: 0 }));
});
