import { useEffect, useRef, useState } from "react";
import { registerSW } from "virtual:pwa-register";
export function PwaUpdate() {
  const [available, setAvailable] = useState(false);
  const update = useRef<ReturnType<typeof registerSW> | null>(null);
  useEffect(() => {
    update.current = registerSW({
      immediate: true,
      onNeedRefresh: () => setAvailable(true),
    });
  }, []);
  if (!available) return null;
  return (
    <div className="pwa-update" role="status">
      <p>Hay una nueva versión. Guarda tu trabajo antes de actualizar.</p>
      <button className="primary" onClick={() => void update.current?.(true)}>
        Actualizar aplicación
      </button>
      <button className="secondary" onClick={() => setAvailable(false)}>
        Más tarde
      </button>
    </div>
  );
}
