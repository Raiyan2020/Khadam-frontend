import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { useLanguage } from '../i18n';

// Fix leaflet's default icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface LatLng {
  lat: number;
  lng: number;
}

export interface KuwaitCity {
  nameEn: string;
  nameAr: string;
  center: LatLng;
}

export const KUWAIT_CITIES: KuwaitCity[] = [
  { nameEn: 'Kuwait City', nameAr: 'العاصمة', center: { lat: 29.3759, lng: 47.9774 } },
  { nameEn: 'Hawalli', nameAr: 'حولي', center: { lat: 29.3320, lng: 48.0290 } },
  { nameEn: 'Salmiya', nameAr: 'السالمية', center: { lat: 29.3366, lng: 48.0741 } },
  { nameEn: 'Farwaniya', nameAr: 'الفروانية', center: { lat: 29.2767, lng: 47.9596 } },
  { nameEn: 'Ahmadi', nameAr: 'الأحمدي', center: { lat: 29.0769, lng: 48.0838 } },
  { nameEn: 'Jahra', nameAr: 'الجهراء', center: { lat: 29.3375, lng: 47.6581 } },
  { nameEn: 'Mubarak Al-Kabeer', nameAr: 'مبارك الكبير', center: { lat: 29.2000, lng: 48.1000 } },
  { nameEn: 'Shuwaikh', nameAr: 'الشويخ', center: { lat: 29.3600, lng: 47.9300 } },
  { nameEn: 'Fintas', nameAr: 'الفنطاس', center: { lat: 29.1950, lng: 48.1250 } },
  { nameEn: 'Rumaithiya', nameAr: 'الرميثية', center: { lat: 29.3250, lng: 48.0800 } },
];

// Component to programmatically fly the map to a new center
const MapFlyTo: React.FC<{ center: LatLng }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 13, { duration: 0.8 });
  }, [center, map]);
  return null;
};

// Click-to-place-marker handler
const MarkerPlacer: React.FC<{ onPlace: (pos: LatLng) => void }> = ({ onPlace }) => {
  useMapEvents({
    click(e) {
      onPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

interface LocationPickerProps {
  value: { position: LatLng | null };
  onChange: (val: { position: LatLng | null }) => void;
  selectedStateName?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, selectedStateName }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const selectedCity = KUWAIT_CITIES.find(c => 
    selectedStateName && (c.nameAr === selectedStateName || c.nameEn === selectedStateName)
  ) ?? KUWAIT_CITIES[0];

  const handleMapClick = (pos: LatLng) => {
    onChange({ position: pos });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=kw`);
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
          onChange({ position: newPos });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      {/* Search Input and Leaflet map */}

      {/* Leaflet map */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-primary px-1">
          {isAr ? 'اختر موقعك على الخريطة' : 'Pin your exact location'}
        </label>
        <div className="w-full h-64 rounded-2xl overflow-hidden border border-border shadow-sm relative">
          <div className="absolute top-3 start-3 end-3 z-[1000]">
            <form onSubmit={handleSearch} className="relative shadow-lg rounded-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن شارع، مبنى، أو معلم' : 'Search for street, building, or landmark'}
                className="w-full h-11 bg-background/95 backdrop-blur-md border border-border rounded-xl ps-4 pe-12 text-sm text-primary placeholder-secondary/70 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute inset-y-0 end-0 px-3 flex items-center justify-center text-secondary hover:text-brand-500 transition-colors disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-y-2 border-brand-500 border-x-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </form>
          </div>
          <MapContainer
            center={[selectedCity.center.lat, selectedCity.center.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo center={value.position || selectedCity.center} />
            <MarkerPlacer onPlace={handleMapClick} />
            {value.position && (
              <Marker position={[value.position.lat, value.position.lng]} />
            )}
          </MapContainer>
        </div>
        {value.position && (
          <p className="text-[10px] text-secondary px-1">
            {isAr ? 'الموقع: ' : 'Pinned: '}
            {value.position.lat.toFixed(5)}, {value.position.lng.toFixed(5)}
          </p>
        )}
        {!value.position && (
          <p className="text-[10px] text-secondary/60 px-1">
            {isAr ? 'انقر على الخريطة لتحديد موقعك' : 'Tap the map to pin your location'}
          </p>
        )}
      </div>
    </div>
  );
};
