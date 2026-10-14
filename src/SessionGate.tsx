import { useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { BookOpen } from "lucide-react";
import { auth, cloudEnabled, ownerUid, googleAuthEnabled } from "./firebase";

export function SessionGate({
  children,
}: {
  children: (user: User | null) => ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(cloudEnabled);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(
      auth,
      (next) => {
        setUser(next);
        setLoading(false);
        setError("");
      },
      () => {
        setUser(null);
        setLoading(false);
        setError(
          "No se pudo comprobar la sesión. Recarga para volver a intentarlo.",
        );
      },
    );
  }, []);
  if (loading) return <div className="center-screen">Comprobando sesión…</div>;
  if (error)
    return (
      <div className="center-screen" role="alert">
        {error}
      </div>
    );
  if (cloudEnabled && (!ownerUid || (user && user.uid !== ownerUid))) {
    return (
      <div className="center-screen">
        <div className="auth-card">
          <h1>Acceso restringido</h1>
          <p>Esta cuenta no está autorizada para acceder al cancionero.</p>
          <button className="secondary" onClick={() => auth && signOut(auth)}>
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }
  if (cloudEnabled && !user) return <Login />;
  return <div key={user?.uid ?? "demo"}>{children(user)}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function resetPassword() {
    if (!auth) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(
        "Escribe tu correo para establecer o restablecer la contraseña.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(
        "Si el correo tiene una cuenta, recibirás un enlace para establecer tu contraseña. Revisa también la carpeta de spam.",
      );
    } catch {
      setError(
        "No se pudo solicitar el enlace. Vuelve a intentarlo más tarde.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function login(google = false) {
    if (!auth) return;
    setBusy(true);
    setError("");
    try {
      if (google) await signInWithPopup(auth, new GoogleAuthProvider());
      else await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError(
        "No se pudo iniciar sesión. Comprueba tus datos o vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="app-mark">
          <BookOpen /> SongScan
        </div>
        <h1>Tu cancionero privado</h1>
        <p>Inicia sesión con la cuenta del propietario.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button disabled={busy} className="primary" type="submit">
            Entrar
          </button>
        </form>
        <button
          disabled={busy}
          className="text-button"
          onClick={() => void resetPassword()}
        >
          Establecer o restablecer contraseña
        </button>
        <p>
          En tu primer acceso, escribe el correo del propietario y solicita el
          enlace para establecer tu contraseña.
        </p>
        {googleAuthEnabled && (
          <button
            disabled={busy}
            className="secondary full"
            onClick={() => void login(true)}
          >
            Continuar con Google
          </button>
        )}
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        <small>El acceso está limitado al propietario autorizado.</small>
      </div>
    </div>
  );
}
