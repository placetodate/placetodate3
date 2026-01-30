import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { storage, db, auth } from "./firebase";
import EventMap from './EventMap';
import { resizeImage } from './utils/imageUtils';
import BottomNav from './BottomNav';
import ShareModal from './ShareModal';

const EditEvent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [selectedEventType, setSelectedEventType] = useState('Coffee');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isAnytime, setIsAnytime] = useState(false);
    const [eventImage, setEventImage] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuB9WS9r2B6wLD0voVQ4UFtwvmx9cRI71kJG4XCF8q0fyRkt9K9KNFBdTxflBpaco9wVeqwjXIvzRGZ-W76LgACrzHpqhTx2O6nLa5tgYlYwUMao-1_yjVgsKRn0bRp9xvfGEXp5M03pzayVBQ9aRBdQ65O8xnhFb4UD_i0Tpe6v6VLeRyJW-97yqPDKCnhUNHCc8-nJvoiIWjFItFTvqga1h0S6Fy9cjL2nI_xs5yKAOl81fkZIEaW3ZAQ8_ZtKeRmt_8N9ZWg1lxM');
    const [uploading, setUploading] = useState(false);
    const [dateTime, setDateTime] = useState('2023-10-24T18:30');
    const fileInputRef = React.useRef(null);
    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState("Let's meet at the terrace for some drinks and great conversation as the sun goes down.");

    const [backgroundPosition, setBackgroundPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = React.useRef({ x: 0, y: 0 });

    const [coordinates, setCoordinates] = useState([51.505, -0.09]); // Default to London
    const [locationName, setLocationName] = useState('London, UK');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Export State
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (isEditMode) {
            fetchEventData();
        }
    }, [id]);

    const fetchEventData = async () => {
        try {
            const docRef = doc(db, "events", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setEventName(data.title);
                setDescription(data.description);
                setSelectedEventType(data.type);
                setEventImage(data.imageUrl);
                setBackgroundPosition(data.imagePosition || { x: 50, y: 50 });

                if (data.dateTime) {
                    setDateTime(data.dateTime);
                }
                if (data.isPrivate !== undefined) {
                    setIsPrivate(data.isPrivate);
                }
                if (data.isAnytime !== undefined) {
                    setIsAnytime(data.isAnytime);
                }

                if (data.location) {
                    setLocationName(data.location.name);
                    setCoordinates([data.location.coordinates.lat, data.location.coordinates.lng]);
                }
            } else {
                setError("Event not found!");
                // navigate('/events'); // Stay on page to show error or direct to events? User wants error message on screen.
            }
        } catch (error) {
            console.error("Error fetching event:", error);
        }
    };

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
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
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCoords = [parseFloat(lat), parseFloat(lon)];
                setCoordinates(newCoords);

                const parts = display_name.split(', ');
                const simpleAddress = parts.slice(0, 3).join(', ');
                setLocationName(simpleAddress);
            } else {
                setError('Location not found');
            }
        } catch (error) {
            console.error("Error searching location:", error);
            setError('Error searching location');
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const resizedDataUrl = await resizeImage(file);
            const blob = await (await fetch(resizedDataUrl)).blob();

            const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setEventImage(downloadURL);
            setBackgroundPosition({ x: 50, y: 50 });
        } catch (error) {
            console.error("Error uploading image: ", error);
            setError("Failed to upload image.");
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

        const sensitivity = 0.2;

        setBackgroundPosition(prev => {
            let newX = prev.x - (deltaX * sensitivity);
            let newY = prev.y - (deltaY * sensitivity);

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            return { x: newX, y: newY };
        });

        dragStartRef.current = { x: clientX, y: clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const validate = () => {
        const newErrors = {};
        if (!eventName.trim()) newErrors.eventName = "Event Name is required";
        if (!description.trim()) newErrors.description = "Description is required";
        if (!isAnytime && !dateTime) newErrors.dateTime = "Date and time are required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setUploading(true);
        try {
            await deleteDoc(doc(db, "events", id));
            navigate('/events');
        } catch (error) {
            console.error("Error deleting event:", error);
            setError("Error deleting event");
            setUploading(false);
            setShowDeleteModal(false);
        }
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        // ... (rest of handleSubmit logic remains same, just ensuring handleDelete is placed before or after)

        setUploading(true);
        try {
            const eventData = {
                imageUrl: eventImage,
                imagePosition: backgroundPosition,
                title: eventName,
                description: description,
                type: selectedEventType,
                isPrivate: isPrivate,
                isAnytime: isAnytime,
                dateTime: isAnytime ? null : dateTime,
                location: {
                    name: locationName,
                    coordinates: {
                        lat: coordinates[0],
                        lng: coordinates[1]
                    }
                }
            };

            if (isEditMode) {
                await updateDoc(doc(db, "events", id), {
                    ...eventData,
                    updatedAt: serverTimestamp()
                });
            } else {
                const userUid = auth.currentUser ? auth.currentUser.uid : "unknown";
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    createdBy: userUid,
                    attendees: [userUid],
                    createdAt: serverTimestamp()
                });
            }
            navigate('/events');
        } catch (error) {
            console.error("Error saving event: ", error);
            setError("Error saving event");
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
        <div className="bg-background-soft flex justify-center font-display h-[100dvh] overflow-hidden overscroll-none">
            <div className="relative w-full max-w-[480px] h-full flex flex-col bg-background-soft shadow-xl">
                {/* Header */}
                <header className="shrink-0 z-40 w-full flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                    <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-text-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">{isEditMode ? 'Edit Event' : 'New Event'}</h1>
                    <div className="flex w-10 items-center justify-end">
                        {isEditMode ? (
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="size-10 flex items-center justify-center rounded-full bg-gray-100 text-text-dark hover:bg-gray-200 transition-colors"
                            >
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        ) : (
                            <div className="size-10"></div>
                        )}
                    </div>
                </header>

                {/* Main Content - Scrolling */}
                <div className="flex-1 overflow-y-auto px-4 pt-6 pb-6">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                            <span className="material-symbols-outlined text-xl">error</span>
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <div
                            className={`relative w-full h-48 bg-gray-200 rounded-2xl overflow-hidden group border border-border-light touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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

                        <div className="space-y-2 pt-4">
                            <label className="text-sm font-bold text-primary ml-1">Event Name</label>
                            <input
                                className={`form-input flex w-full min-w-0 flex-1 rounded-2xl text-text-soft-dark focus:outline-0 focus:ring-2 focus:ring-primary/20 bg-white h-14 placeholder:text-gray-400 px-4 text-base font-medium ${errors.eventName ? 'border-2 border-red-600 focus:ring-red-600/20' : 'border border-border-light'}`}
                                placeholder="Event Name"
                                value={eventName}
                                onChange={(e) => {
                                    setEventName(e.target.value);
                                    if (!e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, eventName: "Event Name is required" }));
                                    } else {
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.eventName;
                                            return newErrors;
                                        });
                                    }
                                }}
                            />
                            {errors.eventName && <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{errors.eventName}</p>}
                        </div>
                        <div className="flex flex-wrap items-end gap-4 py-3">
                            <label className="flex flex-col min-w-40 flex-1">
                                <p className="text-sm font-bold text-primary mb-2 ml-1">Description</p>
                                <textarea
                                    className={`form-input flex w-full min-w-0 flex-1 resize-none rounded-2xl text-text-soft-dark focus:outline-0 focus:ring-2 focus:ring-primary/20 bg-white min-h-32 placeholder:text-gray-400 p-4 text-base font-medium ${errors.description ? 'border-2 border-red-600 focus:ring-red-600/20' : 'border border-border-light'}`}
                                    placeholder="Describe the vibe..."
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setErrors(prev => ({ ...prev, description: "Description is required" }));
                                        } else {
                                            setErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.description;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                ></textarea>
                                {errors.description && <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{errors.description}</p>}
                            </label>
                        </div>
                        <div className="py-4">
                            <p className="px-1 text-sm font-bold text-primary mb-3">Event Type</p>
                            <div className="flex flex-wrap gap-3">
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
                        <div className="py-4">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <p className="text-sm font-bold text-primary">When</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isAnytime}
                                            onChange={(e) => setIsAnytime(e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                    <span className="text-xs font-medium text-gray-500">Anytime</span>
                                </label>
                            </div>

                            {!isAnytime && (
                                <>
                                    <div className={`bg-white border rounded-2xl p-4 flex items-center gap-3 ${errors.dateTime ? 'border-2 border-red-600' : 'border-border-light'}`}>
                                        <span className="material-symbols-outlined text-primary">calendar_month</span>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Date & Time</p>
                                            <input
                                                type="datetime-local"
                                                value={dateTime}
                                                onChange={(e) => {
                                                    setDateTime(e.target.value);
                                                    if (!e.target.value) {
                                                        setErrors(prev => ({ ...prev, dateTime: "Date and time are required" }));
                                                    } else {
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.dateTime;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                className="w-full text-sm font-semibold text-text-soft-dark border-none p-0 focus:ring-0"
                                            />
                                        </div>
                                    </div>
                                    {errors.dateTime && <p className="text-xs text-red-600 mt-1 ml-1 font-medium">{errors.dateTime}</p>}
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <h3 className="text-sm font-bold text-primary ml-1">Location</h3>
                            <span className="text-xs font-medium text-gray-400 max-w-[200px] truncate">{locationName}</span>
                        </div>
                        <div className="py-3 relative">
                            <EventMap
                                coordinates={coordinates}
                                onLocationSelect={handleLocationUpdate}
                                address={locationName}
                                onSearch={handleSearch}
                            />
                            <button
                                className="absolute bottom-6 right-4 bg-white size-12 flex items-center justify-center rounded-full shadow-lg border border-border-light text-primary z-[400] hover:scale-105 transition-transform"
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
                        <div className="flex items-center justify-between pt-4 pb-2">
                            <h3 className="text-sm font-bold text-primary ml-1">Privacy</h3>
                        </div>
                        <div className="bg-white border border-border-light rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`size-10 rounded-full flex items-center justify-center ${isPrivate ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <span className="material-symbols-outlined">{isPrivate ? 'lock' : 'public'}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-text-dark">Make this event private</p>
                                    <p className="text-xs text-text-muted">Only attendees can see this event</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer - Updated/Save Button - Sticky/Static */}
                <div className="shrink-0 max-w-[480px] mx-auto w-full px-4 pt-3 pb-3 bg-white border-t border-border-light z-20 flex flex-col gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || Object.keys(errors).length > 0}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Saving...' : (isEditMode ? 'Update Event Details' : 'Create Event')}
                    </button>

                    {isEditMode && (
                        <button
                            onClick={handleDelete}
                            disabled={uploading}
                            className="w-full bg-red-50 text-red-500 py-3 rounded-2xl font-bold text-lg border-2 border-red-100 flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-red-100"
                        >
                            Delete Event
                        </button>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
                        <div className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 transition-transform">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="size-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-dark">Delete Event?</h3>
                                <p className="text-text-muted leading-relaxed">
                                    Are you sure you want to delete this event? This action cannot be undone.
                                </p>
                                <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="py-3 rounded-2xl font-bold text-text-dark bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={uploading}
                                        className="py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                                    >
                                        {uploading ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <ShareModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    eventLink={`${window.location.origin}/event-details/${id}`}
                    eventName={eventName}
                />
            </div>
        </div>
    );
};

export default EditEvent;
