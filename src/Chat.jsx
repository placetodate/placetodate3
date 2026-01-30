import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAvatar, getAvatarUrl } from './utils/avatarUtils';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from './BottomNav';

const Chat = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // The other user
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [matchEvent, setMatchEvent] = useState(null);
    const scrollRef = useRef(null);

    // Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Target User
    useEffect(() => {
        const fetchUser = async () => {
            if (!uid) return;
            try {
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                } else {
                    console.error("Chat: User document not found for uid:", uid);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [uid]);

    // Fetch Shared Event
    useEffect(() => {
        if (!currentUser || !uid) return;

        // Query all events (or optimized: events where currentUser is attendee, but array-contains is limited)
        // For simplicity/scale of this app: fetch all and filter clientside, or better:
        // 'events' collection is likely small enough for now.
        // A better query would be: where('attendees', 'array-contains', currentUser.uid)
        // and then filter for the other user in JS.
        const q = query(collection(db, "events"), orderBy("dateTime", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter for events where BOTH are attendees
            const sharedEvents = allEvents.filter(event =>
                event.attendees &&
                event.attendees.includes(currentUser.uid) &&
                event.attendees.includes(uid)
            );

            if (sharedEvents.length > 0) {
                setMatchEvent(sharedEvents[0]);
            } else {
                setMatchEvent(null);
            }
        });

        return () => unsubscribe();
    }, [currentUser, uid]);

    const formatEventDate = (dateStr) => {
        if (!dateStr) return 'Date TBD';
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    // Fetch Current User Profile (for own image)
    useEffect(() => {
        if (!currentUser) return;
        const fetchCurrentProfile = async () => {
            const docSnap = await getDoc(doc(db, "users", currentUser.uid));
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.images && data.images.length > 0) {
                    // Update local state or auth profile if needed, 
                    // but for now let's just use a ref or state for the image to avoid re-renders loop if we strictly relied on auth
                    // Simpler: Just rely on fetching it once or using a new state currentProfile
                    setCurrentUserProfile(data);
                }
            }
        };
        fetchCurrentProfile();
    }, [currentUser]);

    const [currentUserProfile, setCurrentUserProfile] = useState(null);

    // Listen for Messages
    useEffect(() => {
        if (!currentUser || !uid) return;

        const chatId = [currentUser.uid, uid].sort().join("_");
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);

            // Scroll to bottom on new message
            if (scrollRef.current) {
                setTimeout(() => {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }, 100);
            }
        });

        return () => unsubscribe();
    }, [currentUser, uid]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !currentUser) return;

        const textToSend = messageInput; // Capture current input
        setMessageInput(''); // Clear input immediately

        try {
            const chatId = [currentUser.uid, uid].sort().join("_");

            // 1. Create/Update Chat Document (for list views)
            await setDoc(doc(db, "chats", chatId), {
                participants: [currentUser.uid, uid],
                lastMessage: textToSend,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. Add Message to Subcollection
            await addDoc(collection(db, "chats", chatId, "messages"), {
                text: textToSend,
                senderId: currentUser.uid,
                createdAt: serverTimestamp()
            });

        } catch (error) {
            console.error("Error sending message:", error);
            setMessageInput(textToSend); // Restore on failure
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-soft-gray">
                <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-soft-gray flex-col gap-4">
                <p className="text-text-muted">User not found.</p>
                <button
                    onClick={() => navigate('/events')}
                    className="text-primary font-bold"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    const userAge = user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : '';
    const userImage = user.isAvatarMode
        ? (user.avatarId ? getAvatarUrl(user.avatarId) : getAvatar(uid))
        : (user.images && user.images.length > 0 ? user.images[0] : 'https://via.placeholder.com/150');

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-soft-bg border-x border-border-light shadow-2xl font-display">
            {/* Header */}
            <div className="shrink-0 z-40 w-full flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                    <span className="material-symbols-outlined">arrow_back_ios_new</span>
                </button>
                <div className="flex items-center gap-3 cursor-pointer flex-1 justify-center" onClick={() => navigate(`/profile/${uid}`)}>
                    <div className="relative">
                        <div
                            className="w-10 h-10 rounded-full bg-center bg-cover border border-border-light shadow-sm"
                            style={{ backgroundImage: `url('${userImage}')`, backgroundColor: user.isAvatarMode ? '#fff' : 'transparent' }}
                        >
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <h1 className="text-base font-bold tracking-tight text-text-main">{user.name}, {userAge}</h1>
                </div>
                <div className="flex w-10 items-center justify-end">
                    <div className="size-10"></div>
                </div>
            </div>

            {/* Chat Area */}
            <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-4 flex flex-col bg-white">

                <div className="flex justify-center my-4">
                    <span className="bg-gray-100 text-text-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Today</span>
                </div>

                {/* Messages List */}
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.uid;
                    const timeString = msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';

                    let senderImage = 'https://via.placeholder.com/150';
                    let isSenderAvatar = false;

                    if (isMe) {
                        if (currentUserProfile) {
                            if (currentUserProfile.isAvatarMode) {
                                senderImage = currentUserProfile.avatarId ? getAvatarUrl(currentUserProfile.avatarId) : getAvatar(currentUser.uid);
                                isSenderAvatar = true;
                            } else if (currentUserProfile.images && currentUserProfile.images.length > 0) {
                                senderImage = currentUserProfile.images[0];
                            } else if (currentUser?.photoURL) {
                                senderImage = currentUser.photoURL;
                            }
                        } else if (currentUser?.photoURL) {
                            senderImage = currentUser.photoURL;
                        }
                    } else {
                        senderImage = userImage;
                        isSenderAvatar = user.isAvatarMode;
                    }

                    return (
                        <div key={msg.id} className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                            <div
                                className="w-12 h-12 rounded-2xl bg-center bg-cover shrink-0 border border-border-light shadow-sm"
                                style={{ backgroundImage: `url('${senderImage}')`, backgroundColor: isSenderAvatar ? '#fff' : 'transparent' }}
                            ></div>
                            <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-text-muted px-1">{timeString}</span>
                                <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-text-main rounded-bl-none'}`}>
                                    <p className="text-base">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {messages.length === 0 && (
                    <div className="flex justify-center mt-10">
                        <p className="text-text-muted text-sm italic">No messages yet. Say hello!</p>
                    </div>
                )}

            </main>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-border-light pb-24">
                <div className="flex items-center gap-2 bg-soft-gray border border-border-light rounded-full p-1.5 pl-4 pr-1.5 focus-within:ring-2 ring-primary/20 transition-all">
                    <button className="flex items-center justify-center p-1 text-text-muted hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 placeholder-text-muted/60 text-text-main focus:outline-none"
                        placeholder={`Message ${user.name}...`}
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="flex items-center justify-center p-2 rounded-full bg-primary text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>

            {/* Bottom Nav */}
            <BottomNav />
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-border-light rounded-full pointer-events-none"></div>
        </div>
    );
};

export default Chat;
