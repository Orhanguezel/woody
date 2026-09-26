'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';

import { addressApi, type GeoSuggestion } from './address-api';

type Props = {
  label?: string;
  placeholder?: string;
  noResultsLabel?: string;
  unavailableLabel?: string;
  onSelect: (suggestion: GeoSuggestion) => void;
};

/** Yazarken adres önerir (OSM/Photon, sunucu vekili). Klavye ile gezilebilir. */
export default function AddressAutocomplete({ label, placeholder, noResultsLabel, unavailableLabel, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const data = await addressApi.search(q, controller.signal);
        setResults(data.results);
        setActive(data.results.length ? 0 : -1);
        setOpen(true);
      } catch (error) {
        if ((error as Error)?.name !== 'AbortError') setFailed(true);
      } finally {
        setLoading(false);
      }
    }, 320);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  function choose(item: GeoSuggestion) {
    onSelect(item);
    setQuery(item.label);
    setOpen(false);
  }

  return (
    <div ref={wrap} className="relative">
      {label ? <span className="mb-1.5 block text-[12px] font-black uppercase tracking-[0.08em] text-[#9a8a74]">{label}</span> : null}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8a74]" aria-hidden />
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={query}
          placeholder={placeholder}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={(event) => {
            if (!open || !results.length) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActive((i) => (i + 1) % results.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive((i) => (i - 1 + results.length) % results.length);
            } else if (event.key === 'Enter' && active >= 0) {
              event.preventDefault();
              choose(results[active]);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="w-full rounded-lg border border-[#eadfce] bg-white py-2.5 pl-9 pr-9 text-[14px] text-[#24333f] outline-none transition focus:border-[#f58220] focus:ring-2 focus:ring-[#f58220]/20"
          autoComplete="off"
          data-testid="address-search"
        />
        {loading ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#f58220]" aria-hidden /> : null}
      </div>
      {open && query.trim().length >= 3 ? (
        <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl bg-white py-1 shadow-[0_18px_40px_rgba(36,51,63,0.18)] ring-1 ring-[#eadfce]">
          {results.length ? (
            results.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(item);
                }}
                onMouseEnter={() => setActive(index)}
                className={`flex cursor-pointer items-start gap-2.5 px-3 py-2.5 text-[13px] ${index === active ? 'bg-[#fff3e6]' : ''}`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#f58220]" aria-hidden />
                <span>
                  <span className="block font-bold text-[#24333f]">{item.address || item.label}</span>
                  <span className="block text-[12px] text-[#68727b]">{[item.district, item.city, item.postalCode].filter(Boolean).join(' · ')}</span>
                </span>
              </li>
            ))
          ) : (
            <li className="px-3 py-2.5 text-[13px] text-[#68727b]">{failed ? unavailableLabel : noResultsLabel}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
