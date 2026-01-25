import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from './BottomNav';

const Matches = () => {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [likesYou, setLikesYou] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchData(user.uid);
            } else {
                setLoading(false);
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchData = async (uid) => {
        try {
            // 1. Fetch Likes Sent by me (to find matches)
            const sentLikesQuery = query(collection(db, "likes"), where("from", "==", uid));
            const sentLikesSnap = await getDocs(sentLikesQuery);
            const sentLikesToUids = new Set(sentLikesSnap.docs.map(d => d.data().to));

            // 2. Fetch Likes Received by me
            const receivedLikesQuery = query(collection(db, "likes"), where("to", "==", uid));
            const receivedLikesSnap = await getDocs(receivedLikesQuery);

            const matchesList = [];
            const likesYouList = [];
            const userIdsToFetch = new Set();

            receivedLikesSnap.docs.forEach(docSnap => {
                const data = docSnap.data();
                const fromUid = data.from;
                userIdsToFetch.add(fromUid);

                if (sentLikesToUids.has(fromUid)) {
                    matchesList.push({ uid: fromUid, ...data });
                } else {
                    likesYouList.push({ uid: fromUid, ...data });
                }
            });

            // 3. Fetch User Profiles
            const profiles = {};
            await Promise.all(Array.from(userIdsToFetch).map(async (userId) => {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    profiles[userId] = userDoc.data();
                }
            }));

            // 4. Calculate Shared Events (Batch fetch all events to be safe, or cache)
            // For optimization, we only fetch events if we have profiles to show
            let sharedEventsCounts = {};
            if (userIdsToFetch.size > 0) {
                const eventsRef = collection(db, "events");
                // Filter client side for simplicity as "array-contains" is one value
                const eventsSnap = await getDocs(eventsRef);
                const allEvents = eventsSnap.docs.map(d => d.data());

                userIdsToFetch.forEach(otherUid => {
                    const count = allEvents.filter(ev =>
                        ev.attendees &&
                        ev.attendees.includes(uid) &&
                        ev.attendees.includes(otherUid)
                    ).length;
                    sharedEventsCounts[otherUid] = count;
                });
            }

            // Combine Data
            const enrichedMatches = matchesList.map(m => ({
                uid: m.uid,
                profile: profiles[m.uid],
                sharedEvents: sharedEventsCounts[m.uid] || 0
            })).filter(m => m.profile); // Filter out deleted users

            const enrichedLikes = likesYouList.map(l => ({
                uid: l.uid,
                profile: profiles[l.uid],
                sharedEvents: sharedEventsCounts[l.uid] || 0
            })).filter(l => l.profile);

            setMatches(enrichedMatches);
            setLikesYou(enrichedLikes);

        } catch (error) {
            console.error("Error fetching matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        return new Date().getFullYear() - new Date(birthDate).getFullYear();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-soft-white">
                <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-soft-white min-h-screen text-text-dark font-display flex justify-center">
            <div className="relative w-full max-w-[430px] flex flex-col min-h-screen bg-soft-white shadow-xl border-x border-border-light">
                <div className="shrink-0 z-40 w-full flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                    <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-text-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Matches & Likes</h2>
                    <div className="flex w-10 items-center justify-end">
                        <div className="size-10"></div>
                    </div>
                </div>

                <main className="max-w-md mx-auto pb-32 w-full">
                    <section>
                        <div className="flex items-center justify-between px-4 pt-6 pb-2">
                            <h3 className="text-text-dark text-lg font-bold leading-tight tracking-tight font-display">New Matches</h3>
                            <span className="text-primary text-sm font-semibold">{matches.length} new</span>
                        </div>
                        <div className="flex w-full overflow-x-auto px-4 py-3 no-scrollbar h-28">
                            {matches.length === 0 ? (
                                <p className="text-text-muted text-sm italic w-full text-center pt-4">No matches yet. Keep exploring!</p>
                            ) : (
                                <div className="flex min-h-min flex-row items-start justify-start gap-5">
                                    {matches.map(({ uid, profile }) => (
                                        <div key={uid} onClick={() => navigate(`/chat/${uid}`)} className="flex flex-col items-center gap-2 w-20 group cursor-pointer hover:scale-105 transition-transform">
                                            <div className="relative p-1 rounded-full border-2 border-primary">
                                                <div className="w-16 h-16 bg-center bg-no-repeat bg-cover rounded-full shadow-sm" style={{ backgroundImage: `url('${profile.images && profile.images[0] ? profile.images[0] : 'https://via.placeholder.com/150'}')` }}>
                                                </div>
                                                <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-soft-white flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[12px] filled-icon">bolt</span>
                                                </div>
                                            </div>
                                            <p className="text-text-dark text-[13px] font-semibold leading-normal font-display truncate w-full text-center">{profile.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="mt-4">
                        <div className="flex items-center justify-between px-4 pt-4 pb-2">
                            <h3 className="text-text-dark text-lg font-bold leading-tight tracking-tight font-display">Likes You</h3>
                            <div className="flex items-center gap-1 text-primary text-sm font-semibold cursor-pointer hover:bg-gray-100 rounded-full px-2 py-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">filter_list</span>
                                <span>Filter</span>
                            </div>
                        </div>

                        {likesYou.length === 0 ? (
                            <p className="text-text-muted text-sm italic w-full text-center pt-8">No new likes yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 p-4">
                                {likesYou.map(({ uid, profile, sharedEvents }) => (
                                    <div key={uid} onClick={() => navigate(`/profile/${uid}`)} className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light group cursor-pointer hover:shadow-md transition-shadow">
                                        <div className="bg-cover bg-center flex flex-col justify-end aspect-[3/4]" style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%), url('${profile.images && profile.images[0] ? profile.images[0] : 'https://via.placeholder.com/300'}')` }}>
                                            <div className="p-3">
                                                <p className="text-white text-base font-bold leading-tight font-display">{profile.name}, {getAge(profile.birthDate)}</p>
                                                {sharedEvents > 0 && (
                                                    <div className="flex items-center mt-2 bg-accent-blue/90 backdrop-blur-md rounded-full px-2 py-1 w-fit border border-blue-100">
                                                        <span className="material-symbols-outlined text-[10px] text-blue-600 filled-icon mr-1">event</span>
                                                        <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">{sharedEvents} Shared Event{sharedEvents !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Upgrade Teaser - Only show if we have some likes to look busy, or always at end? Let's keep it conditional or just static for the "vibe" */}
                                <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light group cursor-pointer hover:shadow-md transition-shadow">
                                    <div className="bg-cover bg-center flex flex-col justify-center items-center aspect-[3/4] opacity-50 grayscale blur-sm" style={{ backgroundImage: 'linear-gradient(45deg, #ff79c6 0%, #e3f2fd 100%)' }}>
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                        <div className="bg-white/90 p-3 rounded-full shadow-lg mb-2">
                                            <span className="material-symbols-outlined text-primary text-2xl filled-icon">lock</span>
                                        </div>
                                        <p className="text-text-dark text-xs font-bold font-display uppercase tracking-widest">Upgrade to see</p>
                                        <p className="text-text-muted text-[10px] mt-1">more likes</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export default Matches;
