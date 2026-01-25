import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "./firebase";
import EventMap from './EventMap';

const EditEvent = () => {
    const navigate = useNavigate();

    const [selectedEventType, setSelectedEventType] = React.useState('Coffee');
    const [eventImage, setEventImage] = React.useState('https://lh3.googleusercontent.com/aida-public/AB6AXuB9WS9r2B6wLD0voVQ4UFtwvmx9cRI71kJG4XCF8q0fyRkt9K9KNFBdTxflBpaco9wVeqwjXIvzRGZ-W76LgACrzHpqhTx2O6nLa5tgYlYwUMao-1_yjVgsKRn0bRp9xvfGEXp5M03pzayVBQ9aRBdQ65O8xnhFb4UD_i0Tpe6v6VLeRyJW-97yqPDKCnhUNHCc8-nJvoiIWjFItFTvqga1h0S6Fy9cjL2nI_xs5yKAOl81fkZIEaW3ZAQ8_ZtKeRmt_8N9ZWg1lxM');
    const [uploading, setUploading] = React.useState(false);
    const [dateTime, setDateTime] = React.useState('2023-10-24T18:30');
    const fileInputRef = React.useRef(null);
    const [eventName, setEventName] = React.useState('');
    const [description, setDescription] = React.useState("Let's meet at the terrace for some drinks and great conversation as the sun goes down.");

    const [backgroundPosition, setBackgroundPosition] = React.useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartRef = React.useRef({ x: 0, y: 0 });

    const [coordinates, setCoordinates] = React.useState([51.505, -0.09]); // Default to London
    const [locationName, setLocationName] = React.useState('London, UK');

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                // Simplify address: take first 3 components or use display_name
                const parts = data.display_name.split(', ');
                const simpleAddress = parts.slice(0, 3).join(', ');
                setLocationName(simpleAddress);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const handleLocationUpdate = (newCoordinates) => {
        setCoordinates(newCoordinates);
        fetchAddress(newCoordinates[0], newCoordinates[1]);
    };

    const handleSearch = async (query) => {
        if (!query) return;
        try {
            // Using fetch directly since we removed leaflet-geosearch from EventMap but kept provider logic here
            // actually simpler to just use fetch as before or import provider if needed.
            // Let's use the fetch approach consistent with previous steps or the provider if installed.
            // Since we installed leaflet-geosearch, let's use the fetch endpoint directly to avoid context issues or just fetch.
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCoords = [parseFloat(lat), parseFloat(lon)];
                setCoordinates(newCoords);

                // Update location name from search result directly or fetch fresh
                // Using display_name often gives full address, we might want to simplify like in fetchAddress
                const parts = display_name.split(', ');
                const simpleAddress = parts.slice(0, 3).join(', ');
                setLocationName(simpleAddress);
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error("Error searching location:", error);
            alert('Error searching location');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setEventImage(downloadURL);
            setBackgroundPosition({ x: 50, y: 50 }); // Reset position on new image
        } catch (error) {
            console.error("Error uploading image: ", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - dragStartRef.current.x;
        const deltaY = clientY - dragStartRef.current.y;

        // Sensitivity factor - smaller means slower movement
        const sensitivity = 0.2;

        setBackgroundPosition(prev => {
            let newX = prev.x - (deltaX * sensitivity);
            let newY = prev.y - (deltaY * sensitivity);

            // Clamp between 0 and 100
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            return { x: newX, y: newY };
        });

        dragStartRef.current = { x: clientX, y: clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSubmit = async () => {
        if (!eventName) {
            alert("Please enter an event name");
            return;
        }

        setUploading(true);
        try {
            await addDoc(collection(db, "events"), {
                imageUrl: eventImage,
                imagePosition: backgroundPosition,
                title: eventName,
                description: description,
                type: selectedEventType,
                dateTime: dateTime,
                location: {
                    name: locationName,
                    coordinates: {
                        lat: coordinates[0],
                        lng: coordinates[1]
                    }
                },
                createdAt: serverTimestamp()
            });
            navigate(-1); // Go back to events list
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error saving event");
        } finally {
            setUploading(false);
        }
    };

    const eventTypes = [
        { id: 'coffee', label: 'Coffee', icon: 'coffee' },
        { id: 'hiking', label: 'Hiking', icon: 'hiking' },
        { id: 'music', label: 'Music', icon: 'music_note' },
        { id: 'dinner', label: 'Dinner', icon: 'restaurant' },
        { id: 'drinks', label: 'Drinks', icon: 'local_bar' },
        { id: 'art', label: 'Art', icon: 'theater_comedy' },
    ];

    return (
        <div className="bg-background-soft min-h-screen flex justify-center font-display">
            <div className="relative w-full max-w-[480px] min-h-screen flex flex-col bg-background-soft shadow-xl pb-20">
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-light px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-text-main text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-text-main">New Event</h1>
                    <div className="size-10"></div>
                </header>
                <div className="flex flex-col flex-1">
                    <div className="px-4 pt-6">
                        <div
                            className={`relative w-full h-48 bg-gray-200 rounded-2xl overflow-hidden group border border-border-light ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseUp}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-no-repeat"
                                style={{
                                    backgroundImage: `url('${eventImage}')`,
                                    backgroundPosition: `${backgroundPosition.x}% ${backgroundPosition.y}%`
                                }}
                            ></div>
                            <div className="absolute top-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">Drag to reposition</span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white size-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform pointer-events-auto"
                                    disabled={uploading}
                                >
                                    <span className="material-symbols-outlined text-primary text-2xl">
                                        {uploading ? 'hourglass_top' : 'add_a_photo'}
                                    </span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-4 px-4 py-4 pt-8">
                        <label className="flex flex-col min-w-40 flex-1">
                            <p className="text-sm font-bold text-primary mb-2 ml-1">Event Name</p>
                            <input
                                className="form-input flex w-full min-w-0 flex-1 rounded-2xl text-text-soft-dark focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-border-light bg-white h-auto py-2 placeholder:text-gray-400 px-6 pl-6 text-base font-medium"
                                placeholder="Event Name"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                            />
                        </label>
                    </div>
                    <div className="flex flex-wrap items-end gap-4 px-4 py-3">
                        <label className="flex flex-col min-w-40 flex-1">
                            <p className="text-sm font-bold text-primary mb-2 ml-1">Description</p>
                            <textarea
                                className="form-input flex w-full min-w-0 flex-1 resize-none rounded-2xl text-text-soft-dark focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-border-light bg-white min-h-32 placeholder:text-gray-400 p-5 text-base font-medium"
                                placeholder="Describe the vibe..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </label>
                    </div>
                    <div className="py-4">
                        <p className="px-5 text-sm font-bold text-primary mb-3">Event Type</p>
                        <div className="flex flex-wrap gap-3 px-4">
                            {eventTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedEventType(type.label)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all border ${selectedEventType === type.label
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white border-border-light text-text-soft-dark hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="px-4 py-4">
                        <p className="text-sm font-bold text-primary mb-3 ml-1">When</p>
                        <div className="bg-white border border-border-light rounded-2xl p-4 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            <div className="flex-1">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Date & Time</p>
                                <input
                                    type="datetime-local"
                                    value={dateTime}
                                    onChange={(e) => setDateTime(e.target.value)}
                                    className="w-full text-sm font-semibold text-text-soft-dark border-none p-0 focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-4 pt-4">
                        <h3 className="text-sm font-bold text-primary ml-1">Location</h3>
                        <span className="text-xs font-medium text-gray-400 max-w-[200px] truncate">{locationName}</span>
                    </div>
                    <div className="px-4 py-3 relative">
                        <EventMap
                            coordinates={coordinates}
                            onLocationSelect={handleLocationUpdate}
                            address={locationName}
                            onSearch={handleSearch}
                        />
                        <button
                            className="absolute bottom-6 right-8 bg-white size-12 flex items-center justify-center rounded-full shadow-lg border border-border-light text-primary z-[400] hover:scale-105 transition-transform"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition((position) => {
                                        handleLocationUpdate([position.coords.latitude, position.coords.longitude]);
                                    });
                                }
                            }}
                        >
                            <span className="material-symbols-outlined text-xl">my_location</span>
                        </button>
                    </div>
                    <div className="px-4 py-8 mb-4">
                        <button
                            onClick={handleSubmit}
                            disabled={uploading}
                            className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-70"
                        >
                            {uploading ? 'Saving...' : 'Update Event Details'}
                        </button>
                    </div>
                </div>
                <div className="fixed bottom-0 w-full max-w-[480px] z-50 ios-blur bg-white/90 border-t border-border-light pt-3 pb-3">
                    <div className="flex items-center justify-around px-4">
                        <button className="flex flex-col items-center gap-1 text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                            <span className="text-[10px] font-bold">Events</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="material-symbols-outlined">favorite</span>
                            <span className="text-[10px] font-bold">Matches</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <span className="text-[10px] font-bold">Chat</span>
                        </button>
                        <button onClick={() => navigate('/edit-profile')} className="flex flex-col items-center gap-1 text-gray-400">
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-[10px] font-bold">Profile</span>
                        </button>
                    </div>
                    <div className="w-full flex justify-center mt-4">
                        <div className="w-32 h-1.5 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEvent;
