import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

type props = {
  lat: number;
  lng: number;
  address: string;
};

const Map = ({ lat, lng, address }: props) => {
  if (!lat || !lng) {
    return <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#94a3b8", fontSize: "14px" }}>Map coordinates missing</div>;
  }

  return (
    <div>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "300px", width: "100%", zIndex: 1 }}
      >
        <TileLayer url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
        <Marker position={[lat, lng]}>
          <Popup>{address} </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
