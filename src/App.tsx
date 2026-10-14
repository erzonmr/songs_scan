import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Camera,
  Cloud,
  CloudOff,
  FilePenLine,
  Heart,
  LogOut,
  Plus,
  RotateCw,
  Scissors,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  ArrowLeft,
  Check,
  Download,
} from "lucide-react";
import { signOut, type User } from "firebase/auth";
import { SessionGate } from "./SessionGate";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { auth, cloudEnabled, db, functions } from "./firebase";
import { fileToDataUrl, cropAndCompress } from "./image";
import { removeObviousChordLines } from "./lyrics";
import type { Crop, Photo, Song } from "./types";
type Page = "library" | "scanner" | "edit" | "settings";
const fullCrop: Crop = { x: 0, y: 0, width: 1, height: 1 };
const demoSong: Song = {
  id: "demo",
  title: "Canción de ejemplo",
  content:
    "Primera estrofa de ejemplo\nSegunda línea de ejemplo\n\nCoro de ejemplo",
  favorite: false,
  category: "Sin categoría",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: 1,
};
function localSong(
  title: string,
  content: string,
  category: string,
  favorite = false,
): Song {
  return {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    favorite,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
  };
}
export default function App() {
  return <SessionGate>{(user) => <Workspace user={user} />}</SessionGate>;
}
function Workspace({ user }: { user: User | null }) {
  const [page, setPage] = useState<Page>("library"),
    [songs, setSongs] = useState<Song[]>(cloudEnabled ? [] : [demoSong]);
  const [syncReady, setSyncReady] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]),
    [selectedPhoto, setSelectedPhoto] = useState(0),
    [prepared, setPrepared] = useState<string[]>([]);
  const [title, setTitle] = useState(""),
    [content, setContent] = useState(""),
    [category, setCategory] = useState("Sin categoría"),
    [editingId, setEditingId] = useState<string | null>(null),
    [editingVersion, setEditingVersion] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [search, setSearch] = useState(""),
    [favOnly, setFavOnly] = useState(false),
    [showImage, setShowImage] = useState(true);
  const crop = photos[selectedPhoto]?.crop || fullCrop;
  function setCrop(value: Crop) {
    setPhotos((items) =>
      items.map((item, i) =>
        i === selectedPhoto ? { ...item, crop: value } : item,
      ),
    );
    setPrepared([]);
  }
  function setRotation(update: (previous: number) => number) {
    setPhotos((items) =>
      items.map((item, i) =>
        i === selectedPhoto
          ? { ...item, rotation: update(item.rotation) }
          : item,
      ),
    );
    setPrepared([]);
  }
  const fileRef = useRef<HTMLInputElement | null>(null),
    imageRef = useRef<HTMLImageElement | null>(null),
    dragRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!db || !user) return;
    const q = query(collection(db, "users", user.uid, "songs"));
    return onSnapshot(
      q,
      (snap) => {
        setSyncReady(true);
        setSongs(
          snap.docs.map((d) => {
            const v = d.data();
            return {
              id: d.id,
              title: v.title || "",
              content: v.content || "",
              favorite: !!v.favorite,
              category: v.category || "Sin categoría",
              createdAt: v.createdAt?.toMillis?.() || 0,
              updatedAt: v.updatedAt?.toMillis?.() || 0,
              version: v.version || 1,
            };
          }),
        );
      },
      (e) => {
        setSyncReady(false);
        setError("No se puede leer la biblioteca: " + e.message);
      },
    );
  }, [user]);
  function alertError(e: unknown) {
    setError(e instanceof Error ? e.message : String(e));
  }
  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("Sin categoría");
    setEditingId(null);
    setEditingVersion(null);
    setWarnings([]);
    setPrepared([]);
    setPhotos([]);
    setSelectedPhoto(0);
  }
  function startScan() {
    resetForm();
    setPage("scanner");
    setError("");
    setNotice("");
  }
  async function filesChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      const items = await Promise.all(
        files.slice(0, 3 - photos.length).map(async (f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          dataUrl: await fileToDataUrl(f),
          crop: { ...fullCrop },
          rotation: 0,
        })),
      );
      if (!items.length) {
        setError("El MVP permite un máximo de 3 páginas.");
        return;
      }
      setPhotos((p) => [...p, ...items]);
      setSelectedPhoto(photos.length);
      setPrepared([]);
    } catch (err) {
      alertError(err);
    } finally {
      setBusy(false);
    }
  }
  async function prepare() {
    if (!photos.length) {
      setError("Agrega al menos una imagen.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result: string[] = [];
      for (let i = 0; i < photos.length; i++)
        result.push(
          await cropAndCompress(
            photos[i].dataUrl,
            photos[i].crop,
            photos[i].rotation,
          ),
        );
      setPrepared(result);
      setNotice(
        "Imágenes listas. Revisa la vista previa o inicia el reconocimiento con IA.",
      );
    } catch (e) {
      alertError(e);
    } finally {
      setBusy(false);
    }
  }
  async function process() {
    if (!functions) {
      setError(
        "Para utilizar IA debes configurar Firebase y desplegar la función processSong. En modo demostración puedes escribir o pegar una letra manualmente.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const imgs = prepared.length
        ? prepared
        : await Promise.all(
            photos.map((p) => cropAndCompress(p.dataUrl, p.crop, p.rotation)),
          );
      const callable = httpsCallable<
        { images: string[] },
        { title: string; content: string; warnings: string[] }
      >(functions, "processSong", { timeout: 120000 });
      const result = await callable({ images: imgs });
      setTitle(result.data.title);
      setContent(result.data.content);
      setWarnings(result.data.warnings || []);
      setPrepared(imgs);
      setPage("edit");
    } catch (e) {
      alertError(e);
    } finally {
      setBusy(false);
    }
  }
  function newManual() {
    resetForm();
    setPage("edit");
  }
  function openSong(s: Song) {
    resetForm();
    setEditingId(s.id);
    setEditingVersion(s.version);
    setTitle(s.title);
    setContent(s.content);
    setCategory(s.category);
    setPage("edit");
  }
  async function save() {
    if (
      !title.trim() ||
      !content.trim() ||
      title.length > 250 ||
      content.length > 60000 ||
      category.length > 100
    ) {
      setError(
        "Revisa los campos: título obligatorio (máx. 250), letra obligatoria (máx. 60000) y categoría (máx. 100).",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (!db || !user) {
        setSongs((prev) => {
          if (editingId) {
            return prev.map((s) =>
              s.id === editingId
                ? {
                    ...s,
                    title: title.trim(),
                    content,
                    category,
                    version: s.version + 1,
                    updatedAt: Date.now(),
                  }
                : s,
            );
          }
          return [localSong(title.trim(), content, category), ...prev];
        });
        setNotice(
          "Guardado solo en memoria para la demostración. Se perderá al recargar.",
        );
      } else if (editingId) {
        const target = doc(db, "users", user.uid, "songs", editingId);
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(target);
          if (!snap.exists() || snap.data().version !== editingVersion)
            throw new Error(
              "Conflicto de edición. Vuelve a abrir la canción para cargar su versión más reciente.",
            );
          tx.update(target, {
            title: title.trim(),
            content,
            category,
            updatedAt: serverTimestamp(),
            version: (editingVersion || 1) + 1,
          });
        });
        setNotice("Cambios sincronizados en la nube.");
      } else {
        const id = crypto.randomUUID();
        await setDoc(doc(db, "users", user.uid, "songs", id), {
          title: title.trim(),
          content,
          category,
          favorite: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          version: 1,
        });
        setNotice("Canción guardada en la nube.");
      }
      resetForm();
      setPage("library");
    } catch (e) {
      alertError(e);
    } finally {
      setBusy(false);
    }
  }
  async function remove(s: Song) {
    if (!window.confirm("¿Eliminar definitivamente «" + s.title + "»?")) return;
    try {
      if (!db || !user) setSongs((p) => p.filter((x) => x.id !== s.id));
      else await deleteDoc(doc(db, "users", user.uid, "songs", s.id));
    } catch (e) {
      alertError(e);
    }
  }
  async function toggleFavorite(s: Song) {
    try {
      if (!db || !user)
        setSongs((prev) =>
          prev.map((x) =>
            x.id === s.id
              ? { ...x, favorite: !x.favorite, version: x.version + 1 }
              : x,
          ),
        );
      else {
        const ref = doc(db, "users", user.uid, "songs", s.id);
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists()) return;
          tx.update(ref, {
            favorite: !snap.data().favorite,
            version: (snap.data().version || 1) + 1,
            updatedAt: serverTimestamp(),
          });
        });
      }
    } catch (e) {
      alertError(e);
    }
  }
  function downloadText() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (title || "cancion").replace(/[^\w\-áéíóúñ ]/gi, "") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  function dragStart(e: React.PointerEvent<HTMLDivElement>) {
    if (busy) return;
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    dragRef.current = { x, y };
    setCrop({ x, y, width: 0.01, height: 0.01 });
    e.currentTarget.setPointerCapture(e.pointerId);
    setPrepared([]);
  }
  function dragMove(e: React.PointerEvent<HTMLDivElement>) {
    if (busy) return;
    if (!dragRef.current || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const a = dragRef.current;
    setCrop({
      x: Math.min(a.x, x),
      y: Math.min(a.y, y),
      width: Math.max(0.01, Math.abs(x - a.x)),
      height: Math.max(0.01, Math.abs(y - a.y)),
    });
  }
  function dragEnd() {
    dragRef.current = null;
  }
  const filtered = songs
    .filter(
      (s) =>
        (!favOnly || s.favorite) &&
        (s.title + " " + s.content + " " + s.category)
          .toLocaleLowerCase("es")
          .includes(search.toLocaleLowerCase("es")),
    )
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <BookOpen size={28} />
          <span>SongScan</span>
        </div>
        <p className="aside-caption">Cancionero digital</p>
        <nav>
          <button
            disabled={busy}
            className={page === "library" ? "active" : ""}
            onClick={() => setPage("library")}
          >
            <BookOpen /> Biblioteca
          </button>
          <button
            disabled={busy}
            className={page === "scanner" ? "active" : ""}
            onClick={startScan}
          >
            <Camera /> Escanear
          </button>
          <button
            disabled={busy}
            onClick={() => {
              setFavOnly(true);
              setPage("library");
            }}
          >
            <Heart /> Favoritos
          </button>
          <button
            disabled={busy}
            className={page === "settings" ? "active" : ""}
            onClick={() => setPage("settings")}
          >
            <Settings2 /> Ajustes
          </button>
        </nav>
        <div className="aside-bottom">
          {cloudEnabled ? (
            <>
              <span className="online">
                <Cloud size={15} />{" "}
                {syncReady
                  ? "Biblioteca sincronizada"
                  : "Sin sincronización confirmada"}
              </span>
              <button disabled={busy} onClick={() => auth && signOut(auth)}>
                <LogOut /> Cerrar sesión
              </button>
            </>
          ) : (
            <span className="warning">
              <CloudOff size={15} /> DEMO sin persistencia
            </span>
          )}
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="mini-brand">
            <BookOpen /> SongScan
          </div>
          <span>
            {cloudEnabled
              ? "Biblioteca privada · Firebase"
              : "Modo demostración · memoria temporal"}
          </span>
        </header>
        <div className="container">
          {error && (
            <div className="error" role="alert">
              {error}
              <button disabled={busy} onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button disabled={busy} onClick={() => setNotice("")}>
                ×
              </button>
            </div>
          )}
          {page === "library" && (
            <>
              <div className="heading">
                <div>
                  <span className="eyebrow">MI BIBLIOTECA</span>
                  <h1>Tus canciones</h1>
                  <p>
                    Organiza y consulta tus letras desde cualquier dispositivo.
                  </p>
                </div>
                <button disabled={busy} className="primary" onClick={startScan}>
                  <Camera size={18} /> Escanear canción
                </button>
              </div>
              <div className="toolbar">
                <div className="search">
                  <Search size={18} />
                  <input
                    disabled={busy}
                    placeholder="Buscar por título, letra o categoría…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  disabled={busy}
                  className={"secondary " + (favOnly ? "is-on" : "")}
                  onClick={() => setFavOnly((v) => !v)}
                >
                  <Heart size={17} /> {favOnly ? "Ver todas" : "Favoritos"}
                </button>
                <button
                  disabled={busy}
                  className="secondary"
                  onClick={newManual}
                >
                  <Plus size={17} /> Nueva letra
                </button>
              </div>
              <div className="stats">
                <div>
                  <strong>{songs.length}</strong>
                  <span>Canciones</span>
                </div>
                <div>
                  <strong>{songs.filter((s) => s.favorite).length}</strong>
                  <span>Favoritas</span>
                </div>
                <div>
                  <strong>{new Set(songs.map((s) => s.category)).size}</strong>
                  <span>Categorías</span>
                </div>
              </div>
              {filtered.length ? (
                <div className="song-grid">
                  {filtered.map((s) => (
                    <article className="song-card" key={s.id}>
                      <div className="song-icon">
                        <BookOpen />
                      </div>
                      <div className="song-body">
                        <span className="category">{s.category}</span>
                        <h3>{s.title}</h3>
                        <p>{s.content.replace(/\n/g, " ").slice(0, 120)}</p>
                      </div>
                      <div className="song-actions">
                        <button
                          disabled={busy}
                          aria-label="Favorito"
                          onClick={() => toggleFavorite(s)}
                          title="Favorito"
                        >
                          <Heart
                            size={18}
                            fill={s.favorite ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => openSong(s)}
                          title="Abrir canción"
                        >
                          <FilePenLine size={18} />
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => remove(s)}
                          title="Eliminar canción"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <BookOpen size={38} />
                  <h3>No hay canciones en esta vista</h3>
                  <p>Escanea tu primer cancionero o escribe una letra.</p>
                  <button
                    disabled={busy}
                    className="primary"
                    onClick={startScan}
                  >
                    <Camera size={18} /> Comenzar a escanear
                  </button>
                </div>
              )}
            </>
          )}
          {page === "scanner" && (
            <>
              <div className="heading">
                <div>
                  <span className="eyebrow">DIGITALIZACIÓN</span>
                  <h1>Escanear canción</h1>
                  <p>
                    Agrega hasta tres páginas, delimita el contenido y envíalo a
                    la IA.
                  </p>
                </div>
                <button
                  disabled={busy}
                  className="secondary"
                  onClick={() => setPage("library")}
                >
                  <ArrowLeft size={17} /> Biblioteca
                </button>
              </div>
              <div className="work-grid">
                <section className="panel">
                  <h2>1. Fotografías</h2>
                  <p className="muted">
                    Puedes usar la cámara o elegir imágenes de tu dispositivo.
                  </p>
                  <input
                    disabled={busy}
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    multiple
                    onChange={filesChanged}
                    style={{ display: "none" }}
                  />
                  <button
                    className="upload-box"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy || photos.length >= 3}
                  >
                    <Upload size={30} />
                    <strong>Fotografiar o seleccionar imágenes</strong>
                    <small>JPG, PNG o WebP · máximo 3 páginas</small>
                  </button>
                  {photos.length > 0 && (
                    <>
                      <div className="thumbs">
                        {photos.map((p, i) => (
                          <button
                            disabled={busy}
                            key={p.id}
                            className={selectedPhoto === i ? "selected" : ""}
                            onClick={() => {
                              setSelectedPhoto(i);
                              setPrepared([]);
                            }}
                          >
                            <img src={p.dataUrl} alt={"Página " + (i + 1)} />
                            <span>Pág. {i + 1}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={busy}
                        className="text-button"
                        onClick={() => {
                          setPhotos((p) =>
                            p.filter((_, i) => i !== selectedPhoto),
                          );
                          setSelectedPhoto(0);
                          setPrepared([]);
                        }}
                      >
                        Eliminar página seleccionada
                      </button>
                    </>
                  )}
                </section>
                <section className="panel">
                  <h2>2. Recortar imagen</h2>
                  <p className="muted">
                    Arrastra sobre la fotografía para seleccionar un rectángulo.
                    El recorte y el giro se conservan de forma independiente en
                    cada página.
                  </p>
                  {photos.length ? (
                    <>
                      <div
                        className="image-stage"
                        onPointerDown={dragStart}
                        onPointerMove={dragMove}
                        onPointerUp={dragEnd}
                        onPointerCancel={dragEnd}
                      >
                        <img
                          ref={imageRef}
                          src={photos[selectedPhoto]?.dataUrl}
                          alt="Imagen a recortar"
                          draggable={false}
                        />
                        <div
                          className="crop-overlay"
                          style={{
                            left: crop.x * 100 + "%",
                            top: crop.y * 100 + "%",
                            width: crop.width * 100 + "%",
                            height: crop.height * 100 + "%",
                          }}
                        />
                      </div>
                      <div className="row actions">
                        <button
                          disabled={busy}
                          className="secondary"
                          onClick={() => {
                            setCrop(fullCrop);
                            setPrepared([]);
                          }}
                        >
                          <Scissors size={17} /> Todo el documento
                        </button>
                        <button
                          disabled={busy}
                          className="secondary"
                          onClick={() => {
                            setRotation((r) => (r + 90) % 360);
                            setPrepared([]);
                          }}
                        >
                          <RotateCw size={17} /> Girar 90°
                        </button>
                      </div>
                      <small className="muted">
                        Cada página se procesará con su propio recorte y giro.
                      </small>
                    </>
                  ) : (
                    <div className="placeholder">
                      La vista previa aparecerá aquí.
                    </div>
                  )}
                </section>
              </div>
              <section className="panel bottom-panel">
                <h2>3. Procesamiento</h2>
                <div className="row actions">
                  <button
                    className="secondary"
                    disabled={busy || !photos.length}
                    onClick={prepare}
                  >
                    <Scissors size={17} /> Preparar imagen
                  </button>
                  <button
                    className="primary"
                    disabled={busy || !photos.length}
                    onClick={process}
                  >
                    <Sparkles size={17} />
                    {busy ? "Procesando…" : "Extraer letra con IA"}
                  </button>
                  <button
                    disabled={busy}
                    className="text-button"
                    onClick={newManual}
                  >
                    Escribir letra manualmente
                  </button>
                </div>
                {prepared.length > 0 && (
                  <div className="prepared-preview">
                    <p>Vista previa del recorte preparado:</p>
                    <img
                      src={prepared[selectedPhoto] || prepared[0]}
                      alt="Imagen preparada"
                    />
                  </div>
                )}
              </section>
            </>
          )}
          {page === "edit" && (
            <>
              <div className="heading">
                <div>
                  <span className="eyebrow">REVISIÓN DE LETRA</span>
                  <h1>{editingId ? "Editar canción" : "Nueva canción"}</h1>
                  <p>Revisa el texto y guarda cuando esté listo.</p>
                </div>
                <button
                  disabled={busy}
                  className="secondary"
                  onClick={() => setPage("library")}
                >
                  <ArrowLeft size={17} /> Volver
                </button>
              </div>
              {warnings.length > 0 && (
                <div className="notice">
                  <strong>Revisa estos fragmentos:</strong>
                  <ul>
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="edit-grid">
                <section className="panel">
                  <label>
                    Título de la canción
                    <input
                      disabled={busy}
                      value={title}
                      maxLength={250}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título"
                    />
                  </label>
                  <label>
                    Categoría
                    <input
                      disabled={busy}
                      maxLength={100}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Adoración, alabanza…"
                    />
                  </label>
                  <div className="row between">
                    <label htmlFor="lyrics">Letra sin acordes</label>
                    <button
                      disabled={busy}
                      className="text-button"
                      onClick={() =>
                        setContent(removeObviousChordLines(content))
                      }
                    >
                      Quitar líneas de acordes evidentes
                    </button>
                  </div>
                  <textarea
                    disabled={busy}
                    maxLength={60000}
                    id="lyrics"
                    rows={18}
                    spellCheck
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="La letra de la canción aparecerá aquí…"
                  />
                  <div className="row actions">
                    <button className="primary" disabled={busy} onClick={save}>
                      <Check size={17} />
                      {busy ? "Guardando…" : "Guardar canción"}
                    </button>
                    <button
                      disabled={busy}
                      className="secondary"
                      onClick={downloadText}
                    >
                      <Download size={17} /> Exportar .txt
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <div className="row between">
                    <h2>Referencia</h2>
                    <button
                      disabled={busy}
                      className="text-button"
                      onClick={() => setShowImage((v) => !v)}
                    >
                      {showImage ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {showImage && photos.length ? (
                    <img
                      className="reference-image"
                      src={prepared[0] || photos[0].dataUrl}
                      alt="Imagen original para comparar"
                    />
                  ) : (
                    <div className="placeholder">
                      {photos.length
                        ? "Referencia oculta"
                        : "Sin imagen asociada a esta edición."}
                    </div>
                  )}
                  <p className="muted">
                    La biblioteca guarda el texto, no la fotografía, en esta
                    versión.
                  </p>
                </section>
              </div>
            </>
          )}
          {page === "settings" && (
            <>
              <div className="heading">
                <div>
                  <span className="eyebrow">CONFIGURACIÓN</span>
                  <h1>Ajustes</h1>
                  <p>Información de la aplicación.</p>
                </div>
              </div>
              <section className="panel settings">
                <p>
                  <strong>Versión:</strong> 0.2.0
                </p>
                <p>
                  <strong>Modo:</strong>{" "}
                  {cloudEnabled
                    ? "Firebase conectado"
                    : "Demostración temporal"}
                </p>
                <p>
                  <strong>Almacenamiento:</strong>{" "}
                  {cloudEnabled
                    ? "Firestore, sin persistencia de canciones en disco local"
                    : "Solo memoria RAM, se pierde al actualizar"}
                </p>
                <p>
                  <strong>Visión IA:</strong>{" "}
                  {cloudEnabled
                    ? "Función processSong (requiere despliegue y secreto)"
                    : "No disponible en demo"}
                </p>
                <p>
                  <strong>Captura:</strong> Navegador / archivos
                </p>
                <p>
                  <strong>Acceso:</strong> {user?.email || "Demostración"}
                </p>
                {cloudEnabled && (
                  <button
                    disabled={busy}
                    className="secondary"
                    onClick={() => auth && signOut(auth)}
                  >
                    <LogOut size={17} /> Cerrar sesión
                  </button>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <div className="mobile-nav">
        <button disabled={busy} onClick={() => setPage("library")}>
          <BookOpen /> Biblioteca
        </button>
        <button disabled={busy} onClick={startScan}>
          <Camera /> Escanear
        </button>
        <button disabled={busy} onClick={() => setPage("settings")}>
          <Settings2 /> Ajustes
        </button>
      </div>
    </div>
  );
}
