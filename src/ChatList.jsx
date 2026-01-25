import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import BottomNav from './BottomNav';

const ChatList = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                setLoading(false);
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (!currentUser) return;

        const chatsRef = collection(db, "chats");
        // Query chats where currentUser is a participant. 
        // Note: Firestore array-contains is simple. For 'orderBy' to work with 'where', we need an index.
        // We will sort client-side if index is missing or for simplicity.
        const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chatsData = await Promise.all(snapshot.docs.map(async (chatDoc) => {
                const data = chatDoc.data();
                const otherUserId = data.participants.find(uid => uid !== currentUser.uid);

                let otherUser = null;
                if (otherUserId) {
                    try {
                        const userSnap = await getDoc(doc(db, "users", otherUserId));
                        if (userSnap.exists()) {
                            otherUser = userSnap.data();
                        }
                    } catch (err) {
                        console.error("Error fetching other user:", err);
                    }
                }

                return {
                    id: chatDoc.id,
                    ...data,
                    otherUserId,
                    otherUser
                };
            }));

            // Sort by updatedAt desc
            chatsData.sort((a, b) => {
                const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
                const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
                return timeB - timeA;
            });

            setChats(chatsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < oneDay && now.getDate() === date.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < oneDay * 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-background-dark">
                <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const currentUserImage = currentUser?.photoURL || 'https://via.placeholder.com/150';

    return (
        <div className="bg-white text-text-main min-h-screen flex flex-col max-w-[430px] mx-auto border-x border-border-light font-display">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md pt-4 px-4 pb-2 border-b border-border-light">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-text-main text-lg font-bold leading-tight tracking-tight flex-1 text-center">Messages</h2>
                    <div className="flex w-10 items-center justify-end">
                        <button className="text-text-main">
                            <span className="material-symbols-outlined text-[24px]">tune</span>
                        </button>
                    </div>
                </div>
                <div className="pb-2">
                    <label className="flex flex-col h-12 w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-full h-full bg-gray-50 border border-border-light overflow-hidden">
                            <div className="text-text-muted flex items-center justify-center pl-4">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-text-muted/60 px-4 pl-2 text-base font-normal leading-normal" placeholder="Search matches or events" />
                        </div>
                    </label>
                </div>
                <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
                    <button className="flex h-9 shrink-0 items-center justify-center rounded-full bg-primary text-white px-5 shadow-sm">
                        <p className="text-sm font-bold">All</p>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center rounded-full bg-white border border-border-light hover:bg-gray-50 px-5 transition-colors">
                        <p className="text-text-main text-sm font-medium">Your Turn</p>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center rounded-full bg-white border border-border-light hover:bg-gray-50 px-5 transition-colors">
                        <p className="text-text-main text-sm font-medium">Events</p>
                    </button>
                    <button className="flex h-9 shrink-0 items-center justify-center rounded-full bg-white border border-border-light hover:bg-gray-50 px-5 transition-colors">
                        <p className="text-text-main text-sm font-medium">Archived</p>
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-24 overflow-y-auto">
                <div className="flex flex-col">
                    {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">chat_bubble_outline</span>
                            <p className="text-text-muted font-medium">No messages yet</p>
                            <p className="text-text-muted/70 text-sm mt-1">Start matching to chat with new people!</p>
                            <button onClick={() => navigate('/events')} className="mt-4 text-primary font-bold text-sm">Find Events</button>
                        </div>
                    ) : (
                        chats.map((chat) => {
                            const otherUserImage = chat.otherUser?.images?.[0] || 'https://via.placeholder.com/150';
                            const otherUserName = chat.otherUser?.name || 'User';

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => navigate(`/chat/${chat.otherUserId}`)}
                                    className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-50 dark:border-white/5"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14" style={{ backgroundImage: `url("${otherUserImage}")` }}></div>
                                        {/* Status indicator logic could go here */}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <p className="text-[#1b0e15] dark:text-[#fcf8fa] text-base font-bold">{otherUserName}</p>
                                            <p className="text-[#974e79] dark:text-[#974e79] text-[12px] font-normal">{formatTime(chat.updatedAt)}</p>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className="text-[#974e79] dark:text-[#c4a1b5] text-[14px] font-normal line-clamp-1 opacity-70">
                                                {chat.lastMessage || 'Start the conversation...'}
                                            </p>
                                            {/* Unread indicator could go here */}
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

export default ChatList;
