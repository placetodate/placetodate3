import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from './BottomNav';

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = [
        { id: 'all', label: 'All', icon: 'apps' },
        { id: 'coffee', label: 'Coffee', icon: 'coffee' },
        { id: 'hiking', label: 'Hiking', icon: 'hiking' },
        { id: 'music', label: 'Music', icon: 'music_note' },
        { id: 'dinner', label: 'Dinner', icon: 'restaurant' },
        { id: 'drinks', label: 'Drinks', icon: 'local_bar' },
        { id: 'art', label: 'Art', icon: 'theater_comedy' },
    ];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const eventsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let result = [];
        if (selectedFilter === 'All') {
            result = [...events];
        } else {
            result = events.filter(event => event.type === selectedFilter);
        }

        // Filter out private events
        result = result.filter(event => {
            if (!event.isPrivate) return true;
            if (!user) return false;
            return event.createdBy === user.uid || (event.attendees && event.attendees.includes(user.uid));
        });

        // Sort: Joined events first
        if (user) {
            result.sort((a, b) => {
                const aJoined = a.attendees && a.attendees.includes(user.uid);
                const bJoined = b.attendees && b.attendees.includes(user.uid);
                if (aJoined && !bJoined) return -1;
                if (!aJoined && bJoined) return 1;
                return 0;
            });
        }

        setFilteredEvents(result);
    }, [events, selectedFilter, user]);

    const isToday = (timestamp) => {
        if (!timestamp) return false;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatDate = (dateString, timestamp) => {
        if (!dateString && !timestamp) return 'Date TBD';
        const date = dateString ? new Date(dateString) : (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col max-w-[430px] mx-auto overflow-x-hidden shadow-xl pb-24 border-x border-border-light bg-white">
            <header className="sticky top-0 z-50 glass-effect pt-4 px-4 pb-2 border-b border-border-light">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="size-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                        <h2 className="text-text-main text-xl font-bold leading-tight tracking-tight">placeToDate</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => navigate('/edit-event')} className="size-10 flex items-center justify-center rounded-full bg-accent-pastel hover:bg-pink-100 transition-colors border border-pink-100">
                            <span className="material-symbols-outlined text-primary text-[24px]">add</span>
                        </button>
                        <button className="size-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-border-light">
                            <span className="material-symbols-outlined text-text-muted text-[24px]">tune</span>
                        </button>
                    </div>
                </div>
                <div className="pb-2">
                    <label className="flex flex-col min-w-40 h-12 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-gray-50 border border-border-light overflow-hidden">
                            <div className="text-text-muted flex items-center justify-center pl-4">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-text-main focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-text-muted/60 px-4 pl-2 text-base font-normal leading-normal" placeholder="Search social events..." />
                        </div>
                    </label>
                </div>
            </header>
            <main className="flex-1 px-4 pt-6 space-y-6">
                <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedFilter(filter.label)}
                            className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all ${selectedFilter === filter.label
                                ? 'bg-primary text-white shadow-sm scale-105 font-bold'
                                : 'bg-white border border-border-light text-text-main font-medium hover:bg-gray-50'
                                }`}
                        >
                            {filter.icon && <span className={`material-symbols-outlined text-sm ${selectedFilter === filter.label ? 'text-white' : 'text-text-muted'}`}>{filter.icon}</span>}
                            <p className="text-sm">{filter.label}</p>
                        </button>
                    ))}
                </div>
                <div className="space-y-6 mb-[10px]">
                    {filteredEvents.length === 0 ? (
                        <p className="text-text-muted text-center pt-8">No events found for this category.</p>
                    ) : (
                        filteredEvents.map((event) => {
                            const isJoined = user && event.attendees && event.attendees.includes(user.uid);
                            return (
                                <div
                                    key={event.id}
                                    onClick={() => navigate(`/event-details/${event.id}`)}
                                    className="group relative flex flex-col items-stretch justify-start rounded-xl bg-white border border-border-light overflow-hidden transition-all hover:border-primary/20 shadow-sm cursor-pointer"
                                >
                                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
                                        <div
                                            className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-105 transition-transform duration-500"
                                            style={{
                                                backgroundImage: `url("${event.imageUrl}")`,
                                                backgroundPosition: event.imagePosition ? `${event.imagePosition.x}% ${event.imagePosition.y}%` : 'center'
                                            }}
                                        ></div>
                                        {isToday(event.createdAt) && (
                                            <div className="absolute top-4 right-4 z-20">
                                                <span className="bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md">New</span>
                                            </div>
                                        )}
                                        {user && event.createdBy === user.uid && (
                                            <div
                                                className="absolute top-4 left-4 z-20"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/edit-event/${event.id}`);
                                                }}
                                            >
                                                <button className="bg-white/90 backdrop-blur-md size-8 flex items-center justify-center rounded-full text-primary shadow-md hover:bg-white transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col p-5 gap-3">
                                        <div>
                                            <p className="text-text-main text-xl font-bold leading-tight tracking-tight">{event.title}</p>
                                            <p className="text-primary text-sm font-semibold mt-1">
                                                {event.attendees ? event.attendees.length : 0} people joining
                                            </p>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-text-muted">
                                                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                    <p className="text-sm font-medium">{formatDate(event.dateTime, event.createdAt)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-text-muted">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    <p className="text-sm font-medium max-w-[150px] truncate">{event.location?.name || 'Location TBD'}</p>
                                                </div>
                                            </div>
                                            {isJoined && (
                                                <div className="flex items-center justify-center rounded-full h-10 px-6 bg-green-100 text-green-700 text-sm font-bold border border-green-200">
                                                    Joined
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default Events;
