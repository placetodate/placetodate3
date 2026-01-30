import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvatar, getAvatarUrl } from './utils/avatarUtils';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from './BottomNav';
import ShareModal from './ShareModal';

const EventDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [hasJoined, setHasJoined] = useState(false);
    const [attendeesData, setAttendeesData] = useState([]);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, "events", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const eventData = { id: docSnap.id, ...docSnap.data() };
                    setEvent(eventData);
                    if (auth.currentUser && eventData.attendees && eventData.attendees.includes(auth.currentUser.uid)) {
                        setHasJoined(true);
                    }
                } else {
                    console.log("No such event!");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    useEffect(() => {
        const fetchAttendees = async () => {
            if (event && event.attendees && event.attendees.length > 0) {
                try {
                    const attendeesPromises = event.attendees.map(uid => getDoc(doc(db, "users", uid)));
                    const attendeesDocs = await Promise.all(attendeesPromises);
                    const attendeesList = attendeesDocs.map(docSnap => {
                        if (docSnap.exists()) {
                            return { uid: docSnap.id, ...docSnap.data() };
                        }
                        return null;
                    }).filter(Boolean);
                    const filteredAttendees = attendeesList.filter(attendee => attendee.uid !== auth.currentUser?.uid);
                    setAttendeesData(filteredAttendees);
                } catch (error) {
                    console.error("Error fetching attendees:", error);
                }
            } else {
                setAttendeesData([]);
            }
        };

        if (event) {
            fetchAttendees();
        }
    }, [event]);

    const formatDate = (dateString, timestamp, isAnytime) => {
        if (isAnytime) return 'Anytime';
        if (!dateString && !timestamp) return 'Date TBD';
        const date = dateString ? new Date(dateString) : (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const handleJoinEvent = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const docRef = doc(db, "events", id);
            await updateDoc(docRef, {
                attendees: arrayUnion(user.uid)
            });
            setHasJoined(true);
        } catch (error) {
            console.error("Error joining event:", error);
        }
    };

    const handleLeaveEvent = async () => {
        if (!user) return;

        try {
            const docRef = doc(db, "events", id);
            await updateDoc(docRef, {
                attendees: arrayRemove(user.uid)
            });
            setHasJoined(false);
        } catch (error) {
            console.error("Error leaving event:", error);
        }
    };

    const handleAddToCalendar = () => {
        if (!event) return;

        const title = event.title || "PlaceToDate Event";
        const description = event.description || "";
        const location = event.location?.name || "";

        // Handle Firestore Timestamp or Date string
        const startDate = event.dateTime?.toDate ? event.dateTime.toDate() : new Date(event.dateTime);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

        const formatDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        };

        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "BEGIN:VEVENT",
            `SUMMARY:${title}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${location}`,
            `DTSTART:${formatDate(startDate)}`,
            `DTEND:${formatDate(endDate)}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenMaps = () => {
        if (!event?.location?.name) return;
        const query = encodeURIComponent(event.location.name);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light">
                <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light flex-col gap-4">
                <p className="text-text-muted">Event not found.</p>
                <button onClick={() => navigate('/events')} className="text-primary font-bold">Back to Events</button>
            </div>
        );
    }

    return (
        <div className="font-display bg-background-light flex justify-center text-text-dark h-[100dvh] overflow-hidden overscroll-none">
            <div className="relative flex w-full flex-col max-w-[430px] h-full overflow-hidden shadow-xl bg-background-light">
                {/* Header - Sticky */}
                <div className="shrink-0 z-40 w-full flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                    <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-text-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Event Details</h2>
                    <div className="flex w-10 items-center justify-end">
                        <button onClick={handleShare} className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-text-dark hover:bg-gray-200 transition-colors relative">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span>
                        </button>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto w-full pb-32">
                    <div className="relative w-full aspect-[4/5] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent z-10"></div>
                        <div
                            className="w-full h-full bg-center bg-no-repeat bg-cover"
                            style={{
                                backgroundImage: `url('${event.imageUrl}')`,
                                backgroundPosition: event.imagePosition ? `${event.imagePosition.x}% ${event.imagePosition.y}%` : 'center'
                            }}
                        >
                        </div>
                        <div className="absolute bottom-12 left-4 z-10">
                            <span className="px-3 py-1 bg-primary text-xs font-bold uppercase tracking-widest rounded-full text-white shadow-sm">Trending Event</span>
                        </div>
                    </div>

                    <div className="relative -mt-10 z-10 bg-background-light rounded-t-[2.5rem] px-4 pt-8 pb-8">
                        <h1 className="text-text-dark tracking-tight text-4xl font-extrabold leading-tight pb-6">{event.title}</h1>
                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCalendar}
                                disabled={event.isAnytime}
                                className={`w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl ${event.isAnytime ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 rounded-2xl border border-border-light shadow-sm active:scale-[0.98] transition-all hover:border-primary/30">
                                    <div className="text-primary flex items-center justify-center rounded-xl bg-accent-pink shrink-0 size-12">
                                        <span className="material-symbols-outlined">calendar_today</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-text-dark text-base font-bold leading-normal">{formatDate(event.dateTime, event.createdAt, event.isAnytime)}</p>
                                        {!event.isAnytime && (
                                            <p className="text-primary text-sm font-bold leading-normal flex items-center gap-1">
                                                Add to calendar
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleOpenMaps}
                                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-sky-500/20 rounded-2xl"
                            >
                                <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 rounded-2xl border border-border-light shadow-sm active:scale-[0.98] transition-all hover:border-sky-200">
                                    <div className="text-secondary-dark text-sky-500 flex items-center justify-center rounded-xl bg-sky-50 shrink-0 size-12">
                                        <span className="material-symbols-outlined">location_on</span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className="text-text-dark text-base font-bold leading-normal max-w-[200px] truncate">{event.location?.name || 'Location TBD'}</p>
                                        <p className="text-sky-500 text-sm font-bold leading-normal flex items-center gap-1">
                                            Open in Maps
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                        <div className="py-8">
                            <h3 className="text-text-dark text-xl font-bold mb-3">About the event</h3>
                            <p className="text-text-muted leading-relaxed">
                                {event.description || "No description provided."}
                            </p>
                        </div>

                        {hasJoined ? (
                            <div className="py-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-text-dark text-xl font-bold">Who's Joining</h3>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                                    {attendeesData.map((attendee) => {
                                        const age = attendee.birthDate ? new Date().getFullYear() - new Date(attendee.birthDate).getFullYear() : 'N/A';

                                        const imageUrl = attendee.isAvatarMode
                                            ? (attendee.avatarId ? getAvatarUrl(attendee.avatarId) : getAvatar(attendee.uid))
                                            : (attendee.images && attendee.images.find(img => img) ? attendee.images.find(img => img) : 'https://via.placeholder.com/150');
                                        const isMatch = false;

                                        return (
                                            <div
                                                key={attendee.uid}
                                                onClick={() => navigate(`/profile/${attendee.uid}`)}
                                                className="flex-none w-40 relative group cursor-pointer active:scale-95 transition-transform"
                                            >
                                                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border-light shadow-sm bg-white">
                                                    <img className="w-full h-full object-cover" src={imageUrl} alt={attendee.name || 'User'} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                    <div className="absolute bottom-3 left-3">
                                                        <p className="text-white font-bold text-sm">{attendee.name}, {age}</p>
                                                    </div>
                                                </div>
                                                {isMatch && (
                                                    <button className="absolute -bottom-2 right-2 size-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                                        <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-white rounded-2xl border border-border-light mb-4">
                                <span className="material-symbols-outlined text-4xl text-primary mb-2">lock</span>
                                <p className="text-text-dark font-bold">Join to see who's going!</p>
                                <p className="text-text-muted text-sm px-8">Join this event to unlock the guest list and start matching.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Join Button - Sticky */}
                {/* Footer Join/Leave Button - Sticky */}
                <div className="shrink-0 w-full pt-4 pb-4 px-6 bg-background-light border-t border-border-light z-20 mb-[85px]">
                    {hasJoined ? (
                        <button
                            onClick={handleLeaveEvent}
                            className="w-full h-14 bg-red-50 text-red-500 border-2 border-red-100 hover:bg-red-100 text-lg font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">cancel</span>
                            Leave Event
                        </button>
                    ) : (
                        <button
                            onClick={handleJoinEvent}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white text-lg font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">confirmation_number</span>
                            Join Event
                        </button>
                    )}
                </div>

                {/* Bottom Nav - Sticky */}
                <BottomNav />

                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    eventLink={window.location.href}
                    eventName={event.title}
                />
            </div>
        </div >
    );
};

export default EventDetails;
