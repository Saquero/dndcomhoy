import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.heat";

// Minimal typing for the heat layer (no @types)
type HeatTuple = [number, number, number?];
type HeatOptions = {
  minOpacity?: number;
  maxZoom?: number;
  radius?: number;
  blur?: number;
  gradient?: Record<number, string>;
};
type LeafletHeat = typeof L & {
  heatLayer: (latlngs: HeatTuple[], options?: HeatOptions) => L.Layer;
};
const LH = L as LeafletHeat;

// Explicit icon to avoid the “broken image” marker
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MarkerItem = {
  id: number | string;
  nombre: string;
  latitud: number;
  longitud: number;
  direccion?: string | null;
  ciudad?: string | null;
};

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Compute bounds for all items
function useItemsBounds(items: MarkerItem[]) {
  return useMemo(() => {
    const pts = items.map((i) => [i.latitud, i.longitud]) as [number, number][];
    return pts.length ? L.latLngBounds(pts) : null;
  }, [items]);
}

// Auto fit on mount / items change
function AutoFit({ items }: { items: MarkerItem[] }) {
  const map = useMap();
  const bounds = useItemsBounds(items);

  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);

  return null;
}

// Leaflet control: “Center map”
class FitBoundsControl extends L.Control {
  private readonly items: MarkerItem[];

  constructor(items: MarkerItem[]) {
    super({ position: "topright" });
    this.items = items;
  }

  onAdd(map: L.Map): HTMLElement {
    const container = L.DomUtil.create("div", "leaflet-bar");
    const btn = L.DomUtil.create("a", "", container);

    btn.href = "#";
    btn.title = "Centrar mapa";
    btn.innerHTML = "⤢";
    Object.assign(btn.style, {
      width: "30px",
      height: "30px",
      lineHeight: "30px",
      textAlign: "center",
      fontSize: "16px",
      cursor: "pointer",
    });

    L.DomEvent.on(btn, "click", (e) => {
      L.DomEvent.preventDefault(e);
      L.DomEvent.stopPropagation(e);
      const pts = this.items.map((i) => [i.latitud, i.longitud]) as [
        number,
        number
      ][];
      if (pts.length) {
        const bounds = L.latLngBounds(pts);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return container as HTMLElement;
  }
}

function FitButtonControl({ items }: { items: MarkerItem[] }) {
  const map = useMap();
  useEffect(() => {
    const ctl = new FitBoundsControl(items);
    ctl.addTo(map);
    return () => {
      ctl.remove();
    };
  }, [map, items]);
  return null;
}

// Leaflet control: Heatmap ON/OFF
class HeatToggleControl extends L.Control {
  private readonly items: MarkerItem[];
  private layer?: L.Layer;
  private active = false;

  constructor(items: MarkerItem[]) {
    super({ position: "topright" });
    this.items = items;
  }

  onAdd(map: L.Map): HTMLElement {
    const container = L.DomUtil.create("div", "leaflet-bar");
    const btn = L.DomUtil.create("a", "", container);

    btn.href = "#";
    btn.title = "Heatmap ON/OFF";
    btn.innerHTML = "🔥";
    Object.assign(btn.style, {
      width: "30px",
      height: "30px",
      lineHeight: "30px",
      textAlign: "center",
      fontSize: "16px",
      cursor: "pointer",
    });

    const buildLayer = () => {
      const pts: HeatTuple[] = this.items.map((i) => [
        i.latitud,
        i.longitud,
        0.6,
      ]);
      return LH.heatLayer(pts, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        minOpacity: 0.2,
        gradient: {
          0.2: "#3b82f6",
          0.4: "#22c55e",
          0.6: "#f59e0b",
          0.8: "#ef4444",
        },
      });
    };

    const toggle = () => {
      if (!this.active) {
        this.layer = buildLayer();
        if (this.layer) {
          this.layer.addTo(map);
          this.active = true;
          btn.style.background = "#222";
          btn.style.color = "#fff";
        }
      } else {
        if (this.layer) {
          map.removeLayer(this.layer);
          this.layer = undefined;
        }
        this.active = false;
        btn.style.background = "";
        btn.style.color = "";
      }
    };

    L.DomEvent.on(btn, "click", (e) => {
      L.DomEvent.preventDefault(e);
      L.DomEvent.stopPropagation(e);
      toggle();
    });

    return container as HTMLElement;
  }
}

function HeatButtonControl({ items }: { items: MarkerItem[] }) {
  const map = useMap();
  useEffect(() => {
    const ctl = new HeatToggleControl(items);
    ctl.addTo(map);
    return () => {
      ctl.remove();
    };
  }, [map, items]);
  return null;
}

// Cluster layer with color by density
function MarkerClusterLayer({ items }: { items: MarkerItem[] }) {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let bg = "#3b82f6"; // blue
        let size = 34;
        if (count >= 10 && count < 50) {
          bg = "#22c55e"; // green
          size = 40;
        } else if (count >= 50 && count < 200) {
          bg = "#f59e0b"; // amber
          size = 46;
        } else if (count >= 200) {
          bg = "#ef4444"; // red
          size = 52;
        }
        const html = `
          <div style="
            background:${bg};
            color:#fff;
            width:${size}px;height:${size}px;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-weight:600;
            box-shadow:0 0 0 2px #fff;
            line-height:1;
          ">
            ${count}
          </div>`;
        return L.divIcon({
          html,
          className: "custom-cluster",
          iconSize: [size, size],
        });
      },
    });

    items.forEach((i) => {
      const m = L.marker([i.latitud, i.longitud], { icon: defaultIcon });
      const content = `
        <div style="font-size:12px;line-height:1.2">
          <div style="font-weight:600">${escapeHtml(i.nombre)}</div>
          <div style="color:#4b5563">${escapeHtml(i.direccion ?? "")}${
        i.ciudad ? " — " + escapeHtml(i.ciudad) : ""
      }</div>
        </div>`;
      m.bindPopup(content);
      clusterGroup.addLayer(m);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
      clusterGroup.clearLayers();
    };
  }, [map, items]);

  return null;
}

export default function Map({ items }: { items: MarkerItem[] }) {
  const hasPoints = items && items.length > 0;
  const fallbackCenter: [number, number] = [38.3452, -0.481]; // Alicante
  const first = hasPoints
    ? ([items[0].latitud, items[0].longitud] as [number, number])
    : fallbackCenter;

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border bg-gray-50">
      <MapContainer
        center={first}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasPoints && <AutoFit items={items} />}
        {hasPoints && <MarkerClusterLayer items={items} />}
        {hasPoints && <FitButtonControl items={items} />}
        {hasPoints && <HeatButtonControl items={items} />}
      </MapContainer>
    </div>
  );
}
