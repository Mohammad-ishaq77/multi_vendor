import { useCallback, useEffect, useRef, useState } from "react";
import { Map, MapStyle, Marker, config as maptilerConfig } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { AlertCircle, Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import { MAPTILER_API_KEY, hasMapTilerKey } from "../../config/env";
import { reverseGeocode, searchPlaces } from "../../services/geocodingService";

/** Srinagar — the app's initial map centre when nothing is picked yet. */
const DEFAULT_CENTER = { lat: 34.0837, lng: 74.7973 };

const PERMISSION_DENIED_MESSAGE =
  "Location permission was denied. Please search and select your location on the map.";
const LOCATION_UNAVAILABLE_MESSAGE =
  "Unable to get your current location. Please search and select your location on the map.";

const round6 = (value) => Math.round(Number(value) * 1e6) / 1e6;

const toLngLat = (value) => {
  if (value?.lat == null || value?.lng == null) return null;
  return Number.isFinite(Number(value.lat)) && Number.isFinite(Number(value.lng))
    ? { lat: round6(value.lat), lng: round6(value.lng) }
    : null;
};

/**
 * Map-based location picker (MapTiler).
 *
 * Search a place, tap the map or drag the pin — the picked coordinates are
 * pushed to the parent through `onChange` and the reverse-geocoded address
 * parts (street, city, state, pincode) through `onAddressChange`, so forms can
 * prefill their fields while the user keeps full editing control.
 */
const LocationPicker = ({
  value = null,
  onChange,
  onAddressChange,
  label = "Location on the map",
  hint,
  mapHeight = "h-72 sm:h-80",
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const coordsRef = useRef(null);
  const reverseSeq = useRef(0);
  const onChangeRef = useRef(onChange);
  const onAddressRef = useRef(onAddressChange);
  onChangeRef.current = onChange;
  onAddressRef.current = onAddressChange;

  const [coords, setCoords] = useState(() => toLngLat(value));
  const [address, setAddress] = useState(null);
  const [addressNote, setAddressNote] = useState("");
  const [resolving, setResolving] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [locating, setLocating] = useState(false);
  const [mapError, setMapError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState("");

  /** Reverse geocode a position and notify the parent with address parts. */
  const resolveAddress = useCallback((next) => {
    const seq = ++reverseSeq.current;
    if (!next) {
      setAddress(null);
      setAddressNote("");
      setResolving(false);
      onAddressRef.current?.(null);
      return;
    }
    setResolving(true);
    setAddress(null);
    setAddressNote("");
    reverseGeocode(next.lng, next.lat)
      .then((place) => {
        if (seq !== reverseSeq.current) return;
        setAddress(place);
        onAddressRef.current?.(place);
      })
      .catch((error) => {
        if (seq !== reverseSeq.current) return;
        setAddress(null);
        setAddressNote(error?.message || "We could not read the address for this point.");
        onAddressRef.current?.(null);
      })
      .finally(() => {
        if (seq === reverseSeq.current) setResolving(false);
      });
  }, []);

  /** Move (or create) the pin. Emits to the parent unless told otherwise. */
  const showPosition = useCallback(
    (next, { fly = false, emit = true } = {}) => {
      const position = toLngLat(next);
      if (!position) return;
      coordsRef.current = position;
      setCoords(position);
      setGeoError("");

      const map = mapRef.current;
      if (map) {
        if (!markerRef.current) {
          markerRef.current = new Marker({ draggable: true, cursor: "grab" })
            .setLngLat([position.lng, position.lat])
            .addTo(map);
          markerRef.current.on("dragend", () => {
            const dragged = markerRef.current?.getLngLat();
            if (dragged) showPosition({ lat: dragged.lat, lng: dragged.lng });
          });
        } else {
          markerRef.current.setLngLat([position.lng, position.lat]);
        }
        if (fly) {
          map.flyTo({ center: [position.lng, position.lat], zoom: Math.max(map.getZoom(), 15), essential: true });
        }
      }

      resolveAddress(position);
      if (emit) onChangeRef.current?.(position);
    },
    [resolveAddress]
  );

  /* ------------------------------- Map setup ------------------------------ */

  useEffect(() => {
    if (!hasMapTilerKey() || !containerRef.current || mapRef.current) return undefined;
    maptilerConfig.apiKey = MAPTILER_API_KEY;
    const initial = toLngLat(value) || DEFAULT_CENTER;

    let map;
    try {
      map = new Map({
        container: containerRef.current,
        style: MapStyle.STREETS,
        center: [initial.lng, initial.lat],
        zoom: toLngLat(value) ? 15 : 12,
        attributionControl: { compact: true },
      });
    } catch {
      setMapError("The map could not be loaded. Please search for your location instead.");
      return undefined;
    }

    mapRef.current = map;
    map.on("click", (event) => showPosition({ lat: event.lngLat.lat, lng: event.lngLat.lng }));

    return () => {
      reverseSeq.current += 1;
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // The map is created once; external position changes are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------- Adopt coordinates from the parent ---------------- */

  useEffect(() => {
    const external = toLngLat(value);
    if (!external) return;
    if (coordsRef.current && coordsRef.current.lat === external.lat && coordsRef.current.lng === external.lng) return;
    showPosition(external, { fly: true, emit: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, showPosition]);

  /* -------------------------------- Search -------------------------------- */

  useEffect(() => {
    const text = searchText.trim();
    if (text.length < 3) {
      setResults([]);
      setSearching(false);
      setSearchError("");
      return undefined;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(text, { proximity: coordsRef.current || DEFAULT_CENTER });
        if (!active) return;
        setResults(places);
        setSearchError("");
        setSearchOpen(true);
      } catch (error) {
        if (!active) return;
        setResults([]);
        setSearchError(error?.message || "Location search is unavailable right now. Please try again.");
      } finally {
        if (active) setSearching(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText]);

  const chooseResult = (place) => {
    setSearchOpen(false);
    setSearchText(place.label);
    setResults([]);
    setSearchError("");
    showPosition({ lat: place.lat, lng: place.lng }, { fly: true });
  };

  /* --------------------------- Current location --------------------------- */

  const locateMe = () => {
    if (!navigator.geolocation) {
      setGeoError(LOCATION_UNAVAILABLE_MESSAGE);
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        showPosition(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          { fly: true }
        );
      },
      (error) => {
        setLocating(false);
        setGeoError(error?.code === 1 ? PERMISSION_DENIED_MESSAGE : LOCATION_UNAVAILABLE_MESSAGE);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const clearLocation = () => {
    reverseSeq.current += 1;
    coordsRef.current = null;
    setCoords(null);
    setAddress(null);
    setAddressNote("");
    setResolving(false);
    setGeoError("");
    markerRef.current?.remove();
    markerRef.current = null;
    onChangeRef.current?.(null);
    onAddressRef.current?.(null);
  };

  /* -------------------------------- Render -------------------------------- */

  if (!hasMapTilerKey()) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
        <MapPin className="mx-auto mb-2 h-6 w-6 text-gray-400" />
        <p className="text-sm font-semibold text-gray-700">MapTiler key not configured</p>
        <p className="mt-1 text-xs text-gray-500">
          Add <code className="rounded bg-gray-200 px-1">VITE_MAPTILER_API_KEY</code> to FrontEnd/.env and
          restart the dev server to enable the map.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">{label}</p>
        {coords && (
          <button
            type="button"
            onClick={clearLocation}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}

      {/* Search + current location */}
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => results.length && setSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (results[0]) chooseResult(results[0]);
            }
            if (event.key === "Escape") setSearchOpen(false);
          }}
          placeholder="Search for a place, street or landmark…"
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-24 text-sm outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {searching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            title="Use my current location"
            className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-1.5 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand-muted disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Locate me</span>
          </button>
        </div>

        {searchOpen && (results.length > 0 || searchError) && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {searchError && <li className="px-3 py-2 text-xs text-rose-600">{searchError}</li>}
            {results.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => chooseResult(place)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-brand-muted"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>{place.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {geoError && (
        <p className="mb-2 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {geoError}
        </p>
      )}

      {/* Map */}
      <div className={`relative overflow-hidden rounded-lg border border-gray-200 ${mapHeight}`}>
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 px-6 text-center text-sm text-gray-600">
            {mapError}
          </div>
        )}
        {!coords && !mapError && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-600 shadow">
              Search, tap the map or drag the pin to set the location
            </span>
          </div>
        )}
      </div>

      {/* Picked location readout */}
      <div className="mt-2 flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2.5">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div className="min-w-0 flex-1">
          {!coords ? (
            <p className="text-xs text-gray-500">No location selected yet.</p>
          ) : (
            <>
              <p className="truncate text-xs font-semibold text-gray-800">
                {resolving ? "Finding address…" : address?.formattedAddress || addressNote || "Address unavailable for this point."}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-gray-400">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            </>
          )}
        </div>
        {resolving && <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-gray-400" />}
      </div>
    </div>
  );
};

export default LocationPicker;
