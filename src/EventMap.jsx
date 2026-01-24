import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to recenter map when coordinates change
const RecenterMap = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(coordinates, map.getZoom());
    }, [coordinates, map]);
    return null;
};

// Component to handle map clicks
const LocationMarker = ({ position, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const CustomSearchBox = ({ address, onSearch }) => {
    const [query, setQuery] = useState(address || '');

    // Sync local state when address prop changes (reverse geocoding result)
    useEffect(() => {
        setQuery(address || '');
    }, [address]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch(query);
            // Prevent map interaction bubbles if needed
            e.stopPropagation();
        }
    };

    // Prevent map clicks when clicking input
    const preventMapClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="absolute top-4 left-4 right-4 z-[1000]"
            onMouseDown={preventMapClick}
            onDoubleClick={preventMapClick}
            onClick={preventMapClick}
        >
            <div className="bg-white/95 shadow-md rounded-full px-4 py-2.5 flex items-center gap-3 border border-border-light backdrop-blur-sm">
                <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                <input
                    className="bg-transparent border-none focus:ring-0 p-0 text-sm flex-1 placeholder:text-gray-500 text-text-soft-dark font-medium"
                    placeholder="Search for a venue..."
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={() => onSearch(query)}
                    className="text-primary text-xs font-bold uppercase hover:bg-primary/5 px-2 py-1 rounded-md transition-colors"
                >
                    Go
                </button>
            </div>
        </div>
    );
};

const EventMap = ({ coordinates, onLocationSelect, address, onSearch }) => {
    return (
        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-border-light relative shadow-sm z-0">
            <CustomSearchBox address={address} onSearch={onSearch} />
            <MapContainer
                center={coordinates}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={coordinates} onLocationSelect={onLocationSelect} />
                <RecenterMap coordinates={coordinates} />
            </MapContainer>
        </div>
    );
};

export default EventMap;
