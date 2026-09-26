'use client';

import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react';

import { FOCUS_RING } from '@/lib/a11y';

/**
 * Bağımlılıksız OpenStreetMap seçici. İğne sabit ortadadır; harita sürüklenir
 * (bırakınca onChange), tıklanan nokta ortaya alınır. Karolar tile.openstreetmap.org.
 */

const TILE = 256;
const MIN_ZOOM = 5;
const MAX_ZOOM = 19;
const TURKEY = { lat: 39.0, lon: 35.2 };

function project(lat: number, lon: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const sin = Math.sin((Math.max(-85, Math.min(85, lat)) * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function unproject(x: number, y: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const lon = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat: Math.round(lat * 1e7) / 1e7, lon: Math.round(lon * 1e7) / 1e7 };
}

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lon: number) => void;
  hint?: string;
  locateLabel?: string;
  locationDeniedLabel?: string;
};

export default function MapPicker({ latitude, longitude, onChange, hint, locateLabel, locationDeniedLabel }: Props) {
  const hasPoint = latitude !== null && longitude !== null;
  const [zoom, setZoom] = useState(hasPoint ? 17 : 5);
  const [center, setCenter] = useState(hasPoint ? { lat: latitude!, lon: longitude! } : TURKEY);
  const [width, setWidth] = useState(640);
  const [drag, setDrag] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  const [locError, setLocError] = useState('');
  const box = useRef<HTMLDivElement>(null);
  const height = 240;

  // Dışarıdan gelen yeni nokta (arama sonucu) haritayı oraya taşır.
  useEffect(() => {
    if (latitude === null || longitude === null) return;
    setCenter({ lat: latitude, lon: longitude });
    setZoom((z) => (z < 15 ? 17 : z));
  }, [latitude, longitude]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const origin = project(center.lat, center.lon, zoom);
  const left = origin.x - width / 2 - (drag?.dx ?? 0);
  const top = origin.y - height / 2 - (drag?.dy ?? 0);
  const maxTile = 2 ** zoom;
  const tiles: Array<{ key: string; x: number; y: number; src: string }> = [];
  for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + width) / TILE); tx++) {
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + height) / TILE); ty++) {
      if (ty < 0 || ty >= maxTile) continue;
      const wrapped = ((tx % maxTile) + maxTile) % maxTile;
      tiles.push({ key: `${zoom}/${tx}/${ty}`, x: tx * TILE - left, y: ty * TILE - top, src: `https://tile.openstreetmap.org/${zoom}/${wrapped}/${ty}.png` });
    }
  }

  function commit(next: { lat: number; lon: number }) {
    setCenter(next);
    onChange(next.lat, next.lon);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    const moved = Math.abs(drag.dx) + Math.abs(drag.dy);
    if (moved > 4) {
      commit(unproject(origin.x - drag.dx, origin.y - drag.dy, zoom));
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      commit(unproject(left + (event.clientX - rect.left), top + (event.clientY - rect.top), zoom));
    }
    setDrag(null);
  }

  function locate() {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError(locationDeniedLabel || '');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setZoom(17);
        commit({ lat: Math.round(pos.coords.latitude * 1e7) / 1e7, lon: Math.round(pos.coords.longitude * 1e7) / 1e7 });
      },
      () => setLocError(locationDeniedLabel || ''),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div>
      <div
        ref={box}
        className="relative h-[240px] touch-none select-none overflow-hidden rounded-xl bg-[#e8eef0] ring-1 ring-[#eadfce]"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ x: event.clientX, y: event.clientY, dx: 0, dy: 0 });
        }}
        onPointerMove={(event) => {
          if (drag) setDrag({ ...drag, dx: event.clientX - drag.x, dy: event.clientY - drag.y });
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
        style={{ cursor: drag ? 'grabbing' : 'grab' }}
        data-testid="map-picker"
      >
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            aria-hidden
            draggable={false}
            width={TILE}
            height={TILE}
            className="pointer-events-none absolute max-w-none"
            style={{ left: tile.x, top: tile.y }}
          />
        ))}
        <MapPin
          className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-full fill-[#f58220] text-white drop-shadow-[0_3px_4px_rgba(0,0,0,0.35)]"
          aria-hidden
        />
        <div className="absolute right-2 top-2 flex flex-col overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/10" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" aria-label="+" onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))} className={`p-2 hover:bg-[#fff3e6] ${FOCUS_RING}`}>
            <Plus className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" aria-label="-" onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))} className={`border-t border-black/10 p-2 hover:bg-[#fff3e6] ${FOCUS_RING}`}>
            <Minus className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={locate}
          className={`absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-black text-[#24333f] shadow ring-1 ring-black/10 hover:bg-[#fff3e6] ${FOCUS_RING}`}
        >
          <LocateFixed className="h-4 w-4 text-[#f58220]" aria-hidden />
          {locateLabel}
        </button>
        <span className="pointer-events-none absolute bottom-1 right-2 rounded bg-white/80 px-1 text-[10px] text-[#5f6871]">© OpenStreetMap</span>
      </div>
      {hint ? <p className="mt-1.5 text-[11px] font-semibold text-[#9a8a74]">{hint}</p> : null}
      {locError ? <p className="mt-1 text-[12px] font-semibold text-red-700" role="alert">{locError}</p> : null}
    </div>
  );
}
