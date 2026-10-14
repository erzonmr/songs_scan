import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useState } from "react";
import type { User } from "firebase/auth";
const state = vi.hoisted(() => ({
  listener: undefined as undefined | ((user: User | null) => void),
}));
vi.mock("./firebase", () => ({
  auth: {},
  cloudEnabled: true,
  ownerUid: "owner",
}));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, listener) => {
    state.listener = listener;
    return vi.fn();
  }),
  signOut: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));
import { SessionGate } from "./SessionGate";
afterEach(cleanup);
function PrivateWorkspace() {
  const [draft, setDraft] = useState("");
  return (
    <input
      aria-label="Borrador privado"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
    />
  );
}
it("no monta el espacio privado para una cuenta no autorizada", () => {
  const child = vi.fn(() => <PrivateWorkspace />);
  render(<SessionGate>{child}</SessionGate>);
  act(() => state.listener?.({ uid: "stranger" } as User));
  expect(child).not.toHaveBeenCalled();
  expect(screen.getByText("Acceso restringido")).toBeTruthy();
});
it("desmonta datos privados al cerrar sesión y crea una sesión limpia", async () => {
  const { default: userEvent } = await import("@testing-library/user-event");
  const user = userEvent.setup();
  render(<SessionGate>{() => <PrivateWorkspace />}</SessionGate>);
  act(() => state.listener?.({ uid: "owner" } as User));
  await user.type(screen.getByLabelText("Borrador privado"), "Letra privada");
  act(() => state.listener?.(null));
  expect(screen.queryByLabelText("Borrador privado")).toBeNull();
  act(() => state.listener?.({ uid: "owner" } as User));
  expect(
    (screen.getByLabelText("Borrador privado") as HTMLInputElement).value,
  ).toBe("");
});
