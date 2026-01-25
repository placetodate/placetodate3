import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const ProfileView = () => {
    const navigate = useNavigate();
    const { uid } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [isMatch, setIsMatch] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [joinedEvents, setJoinedEvents] = useState([]);

    useEffect(() => {
        const fetchJoinedEvents = async () => {
            if (!uid || !currentUser) return;
            try {
                // Fetch events where the viewed user is attending
                const q = query(collection(db, "events"), where("attendees", "array-contains", uid));
                const querySnapshot = await getDocs(q);

                // Filter client-side for events where CURRENT user is also attending
                const events = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(event => event.attendees && event.attendees.includes(currentUser.uid));

                setJoinedEvents(events);
            } catch (error) {
                console.error("Error fetching joined events:", error);
            }
        };
        fetchJoinedEvents();
    }, [uid, currentUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setCurrentUserProfile(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching current user profile:", error);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!uid) return;
            try {
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such profile!");
                    navigate('/events');
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        const checkLikeStatus = async () => {
            if (!auth.currentUser || !uid) return;

            try {
                const likeDocRef = doc(db, "likes", `${auth.currentUser.uid}_${uid}`);
                const likeSnap = await getDoc(likeDocRef);
                setIsLiked(likeSnap.exists());

                const reverseLikeDocRef = doc(db, "likes", `${uid}_${auth.currentUser.uid}`);
                const reverseLikeSnap = await getDoc(reverseLikeDocRef);

                if (likeSnap.exists() && reverseLikeSnap.exists()) {
                    setIsMatch(true);
                }

            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };

        fetchProfile();
        if (currentUser) {
            checkLikeStatus();
        }
    }, [uid, currentUser]);

    const handleLike = async () => {
        if (!currentUser) return;

        try {
            const likeDocId = `${currentUser.uid}_${uid}`;
            const likeDocRef = doc(db, "likes", likeDocId);

            if (isLiked) {
                // Toggle off logic if desired, but typically liking is permanent until unliked
            } else {
                await setDoc(likeDocRef, {
                    from: currentUser.uid,
                    to: uid,
                    timestamp: new Date()
                });
                setIsLiked(true);

                const reverseLikeDocRef = doc(db, "likes", `${uid}_${currentUser.uid}`);
                const reverseLikeSnap = await getDoc(reverseLikeDocRef);
                if (reverseLikeSnap.exists()) {
                    setIsMatch(true);
                    alert("It's a Match!");
                }
            }
        } catch (error) {
            console.error("Error liking user:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light">
                <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    const age = profile.birthDate ? new Date().getFullYear() - new Date(profile.birthDate).getFullYear() : 'N/A';
    const rawImages = profile.images || [];
    const validImages = rawImages.filter(img => img && typeof img === 'string');
    const images = validImages.length > 0 ? validImages : ['https://via.placeholder.com/400'];
    const imageUrl = images[currentImageIndex] || images[0];

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="flex justify-center bg-background-light font-display h-screen overflow-hidden">
            <div className="relative flex w-full max-w-[430px] flex-col h-full bg-background-light shadow-xl">
                {/* Header - Sticky */}
                {/* Header - Sticky */}
                <div className="shrink-0 z-40 w-full flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                    <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-text-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Profile</h2>
                    <div className="flex w-10 items-center justify-end">
                        <div className="size-10"></div>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto w-full pb-6">
                    <div className="px-4 py-4">
                        <div
                            className="relative bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-2xl aspect-[3/4] shadow-lg transition-all duration-300"
                            onClick={handleNextImage}
                            style={{
                                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 40%), url("${imageUrl}")`
                            }}
                        >
                            <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={(e) => { e.stopPropagation(); handlePrevImage(e); }}></div>
                            <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}></div>

                            <div className="absolute top-4 left-4 z-20">
                                <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                    <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
                                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">3 Shared Events</span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-2 p-5 z-20">
                                {images.map((_, idx) => (
                                    <div key={idx} className={`size-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 items-start px-6">
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-text-dark text-3xl font-bold leading-tight tracking-tight">{profile.name}, {age}</h1>
                            <span className="material-symbols-outlined text-blue-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-muted font-medium mt-1">
                            <span className="material-symbols-outlined text-lg">location_on</span>
                            <p className="text-sm">Living in {profile.location || 'somewhere'}</p>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-2">
                        <h3 className="text-text-dark text-lg font-bold leading-tight">About myself</h3>
                        <p className="text-text-muted text-base font-normal leading-relaxed">
                            {profile.bio || "No bio yet."}
                        </p>
                    </div>

                    <div className="px-6 pb-4 space-y-3">
                        <h3 className="text-text-dark text-lg font-bold leading-tight">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests && profile.interests.map((interest, index) => {
                                const isCommon = currentUserProfile?.interests?.includes(interest);
                                return (
                                    <div key={index} className={`flex items-center gap-1.5 px-4 py-2 border rounded-full transition-all ${isCommon ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-border-light text-text-muted'}`}>
                                        <span className={`text-sm font-semibold ${isCommon ? 'text-white' : 'text-text-muted'}`}>{interest}</span>
                                    </div>
                                );
                            })}
                            {(!profile.interests || profile.interests.length === 0) && (
                                <p className="text-text-muted text-sm">No interests listed.</p>
                            )}
                        </div>
                    </div>

                    <div className="px-6 pb-24 space-y-3">
                        <h3 className="text-text-dark text-lg font-bold leading-tight">Shared Events</h3>
                        {joinedEvents.length === 0 ? (
                            <p className="text-text-muted text-sm">No shared upcoming events.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {joinedEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => navigate(`/event-details/${event.id}`)}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-border-light shadow-sm cursor-pointer hover:border-primary/30 transition-all"
                                    >
                                        <div
                                            className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0"
                                            style={{ backgroundImage: `url('${event.imageUrl}')` }}
                                        ></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-text-dark text-sm font-bold truncate">{event.title}</p>
                                            <p className="text-primary text-xs font-semibold">{new Date(event.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                            <p className="text-text-muted text-xs truncate max-w-[150px]">{event.location?.name || 'Location TBD'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Sticky Button */}
                <div className="shrink-0 w-full p-4 bg-white border-t border-border-light z-50">
                    {isMatch ? (
                        <button
                            onClick={() => navigate(`/chat/${profile.id}`)}
                            className="w-full flex h-14 items-center justify-center rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:brightness-105 active:scale-[0.98] transition-all gap-2"
                        >
                            <span className="material-symbols-outlined text-2xl">chat</span>
                            Chat
                        </button>
                    ) : (
                        <button
                            onClick={handleLike}
                            disabled={isLiked}
                            className={`w-full flex h-14 items-center justify-center rounded-2xl ${isLiked ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-primary text-white hover:brightness-105 shadow-lg shadow-primary/30'} font-bold text-lg active:scale-[0.98] transition-all gap-2`}
                        >
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            {isLiked ? 'Liked' : `Like ${profile.name || 'User'}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
