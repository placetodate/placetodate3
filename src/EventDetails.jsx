import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const EventDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, "events", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
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

    const formatDate = (dateString, timestamp) => {
        if (!dateString && !timestamp) return 'Date TBD';
        const date = dateString ? new Date(dateString) : (timestamp?.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
        <div className="font-display bg-background-light min-h-screen flex justify-center text-text-dark">
            <div className="relative flex min-h-screen w-full flex-col max-w-[430px] overflow-x-hidden shadow-xl">
                <div className="fixed top-0 z-40 w-full max-w-[430px] flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                    <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-text-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Event Details</h2>
                    <div className="flex w-10 items-center justify-end">
                        <button className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-text-dark">
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>share</span>
                        </button>
                    </div>
                </div>
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
                    {/* Hardcoded tag for now, logic can be added later if needed */}
                    <div className="absolute bottom-12 left-4 z-10">
                        <span className="px-3 py-1 bg-primary text-xs font-bold uppercase tracking-widest rounded-full text-white shadow-sm">Trending Event</span>
                    </div>
                </div>
                <div className="relative -mt-10 z-10 bg-background-light rounded-t-[2.5rem] px-4 pt-8 pb-40">
                    <h1 className="text-text-dark tracking-tight text-4xl font-extrabold leading-tight pb-6">{event.title}</h1>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 rounded-2xl border border-border-light shadow-sm">
                            <div className="text-primary flex items-center justify-center rounded-xl bg-accent-pink shrink-0 size-12">
                                <span className="material-symbols-outlined">calendar_today</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-text-dark text-base font-bold leading-normal">{formatDate(event.dateTime, event.createdAt)}</p>
                                <p className="text-primary text-sm font-medium leading-normal">Add to calendar</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 rounded-2xl border border-border-light shadow-sm">
                            <div className="text-secondary-dark text-sky-500 flex items-center justify-center rounded-xl bg-sky-50 shrink-0 size-12">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-text-dark text-base font-bold leading-normal max-w-[200px] truncate">{event.location?.name || 'Location TBD'}</p>
                                <p className="text-sky-500 text-sm font-medium leading-normal">Open in Maps</p>
                            </div>
                        </div>
                    </div>
                    <div className="py-8">
                        <h3 className="text-text-dark text-xl font-bold mb-3">About the night</h3>
                        <p className="text-text-muted leading-relaxed">
                            {event.description || "No description provided."}
                        </p>
                    </div>
                    <div className="py-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-text-dark text-xl font-bold">Who's Joining</h3>
                            <span className="text-primary text-sm font-bold">42 Attending</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                            <div className="flex-none w-40 relative group">
                                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border-light shadow-sm">
                                    <img className="w-full h-full object-cover" data-alt="Elena" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA468WvtiiKwxHiUb02NIJP16g1hGUF5OxaqpPWuuunqRNlHX_030uxsuiHHw32gOlMzWrTZJb_Y1e0d6yMmwRQE94YEtSiNpA4m7xcwihu2nrOX7On_eT-BkP5kRRWJxfZ2t9S1FRHoo-y7baqYCCjRbc0u9Mw9ngWrn4g95862R4wyw6N0IMTJQpRqTfT9HxK8WfzlahViX-IY9g7i62UOiMi_S2kLYI-1V3dN3A6el5iXlou9lJwmGwl_kIRMIvZpOiJAKT9ui4" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-white font-bold text-sm">Elena, 24</p>
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 right-2 size-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                </button>
                            </div>
                            <div className="flex-none w-40 relative group">
                                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border-light shadow-sm">
                                    <img className="w-full h-full object-cover" data-alt="Marcus" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCP7ogR0spP2Dljz-VkZl4GjI7hhqMRz6fKEdYlPKu8ETTvtEJlBGzMDazGxiZL2A1AAA0rr9R72t6Yr2y34ANuiY5TbYVLybkcuYw2KHnSoCI9E3WeLRH9n1-RKNrnZ2EQFAEvnZKn1TN_wbkb9Mp0l1J0nFuc06kdfac6n_miAuu55JfRRbFdqbUUdUEVCbIeHnq711Eo1H5HM0JltrYTQUDpLNZ8APWR4__xCV4-WCpySXHq9mtQ5sG25gfkAx7s8art6j4ZRSw" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-white font-bold text-sm">Marcus, 27</p>
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 right-2 size-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                </button>
                            </div>
                            <div className="flex-none w-40 relative group">
                                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-border-light shadow-sm">
                                    <img className="w-full h-full object-cover" data-alt="Sophia" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC65ncS2FNEbXeezlaO_3nLM-9rtYmJ9Qb-q4nuSXdiLX0cfxgCrG2R6C546nyEc4YKskkFyin331LlCpV-AF-zKdXxQlBkofxYtFlqVEuryp91Gh525PC-KkVafYO2L6VU0AcYdutOJ1ef_6NyGpqzXGfAnGjxsoLWwZL7FN5rhkt0NKoQ0way_91l9yqFIxQKqkn27_iNfO4toVH6O7jQhn0JCJcg6RIwm7aHeosPcslrpUuQt9SXveqDUstMK4k0AYqpW47FJ9I" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-white font-bold text-sm">Sophia, 26</p>
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 right-2 size-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                </button>
                            </div>
                            <div className="flex-none w-20 flex items-center justify-center">
                                <div className="size-14 rounded-full bg-white border border-border-light flex items-center justify-center text-primary shadow-sm">
                                    <span className="material-symbols-outlined">add</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed bottom-[88px] left-0 w-full p-4 bg-gradient-to-t from-background-light via-background-light/90 to-transparent z-20 flex justify-center">
                    <button className="w-full max-w-[430px] h-14 bg-primary hover:bg-primary/90 text-white text-lg font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">confirmation_number</span>
                        Join Event
                    </button>
                </div>
                <nav className="fixed bottom-0 left-0 w-full h-[88px] bg-white/90 backdrop-blur-xl border-t border-border-light px-6 pb-6 pt-3 flex justify-center z-50">
                    <div className="w-full max-w-[430px] flex justify-between items-center">
                        <button className="flex flex-col items-center gap-1 text-primary">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                            <span className="text-[10px] font-bold">Events</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="material-symbols-outlined">style</span>
                            <span className="text-[10px] font-medium">Matches</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="material-symbols-outlined">chat_bubble</span>
                            <span className="text-[10px] font-medium">Chat</span>
                        </button>
                        <button onClick={() => navigate('/edit-profile')} className="flex flex-col items-center gap-1 text-text-muted">
                            <span className="material-symbols-outlined">person</span>
                            <span className="text-[10px] font-medium">Profile</span>
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default EventDetails;
