import React from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex justify-center bg-soft-white font-display">
            <div className="relative flex w-full max-w-[430px] flex-col min-h-screen bg-soft-white shadow-xl border-x border-light-gray">
                <header className="sticky top-0 z-50 bg-soft-white/80 backdrop-blur-md border-b border-light-gray px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-accent-blue/50 transition-colors">
                        <span className="material-symbols-outlined text-dark-gray">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-lg font-bold tracking-tight text-dark-gray">Edit My Profile</h1>
                    <div className="size-10"></div>
                </header>
                <main className="flex-1 pb-32">
                    <section className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold tracking-tight text-dark-gray">Your Photos</h3>
                            <span className="text-sm text-primary font-semibold">1/6 Slots</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative aspect-[3/4] bg-accent-pink rounded-2xl border-2 border-primary/20 overflow-hidden bg-cover bg-center shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOAWz3QqICokgzVV6A1I__VCvCvsLImOBIG2H4RZXIOQ8kQ6Hxlr_K0D6KiMXfOjCZGsOyQ2b1ARyrhjetlThYIwj09-aal9qn2kpKfZXyr6zdiIMlLF-fMKtYbpjab49ZToO3W_kilr_OZcNbr18t4lRPm6KolVyatVvn2cHmdoOk7QFNBcWQL10kPDmXQTH1ZwkmExUu6CS2BHV07SScCd2T2HL63vaHC9b17stDs9pKIpdVRvpWyJdcNSOvIaW2iCfLKbsJUFo')" }}>
                                <button className="absolute bottom-2 right-2 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-white rounded-2xl border-2 border-dashed border-light-gray flex items-center justify-center group cursor-pointer hover:border-primary/40 hover:bg-accent-pink/30 transition-all">
                                    <span className="material-symbols-outlined text-light-gray group-hover:text-primary transition-colors">add_circle</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 bg-accent-blue/30 rounded-2xl p-4 border border-blue-100">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex-1 pr-4">
                                    <p className="text-sm font-semibold text-dark-gray mb-0.5">Hide my photos</p>
                                    <p className="text-xs text-medium-gray">Only show photos during active chats or events</p>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input className="sr-only peer" type="checkbox" />
                                    <div className="w-11 h-6 bg-light-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                            </label>
                        </div>
                    </section>
                    <section className="px-6 pb-6 space-y-8">
                        <h3 className="text-lg font-bold tracking-tight text-dark-gray border-l-4 border-primary pl-3">Personal Information</h3>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Gender</label>
                                <div className="relative">
                                    <select className="w-full bg-white border border-light-gray rounded-2xl h-14 px-4 text-base text-dark-gray appearance-none focus:ring-2 focus:ring-primary/20">
                                        <option value="female">Woman</option>
                                        <option value="male">Man</option>
                                        <option value="non-binary">Non-binary</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-primary pointer-events-none font-bold">keyboard_arrow_down</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Interested In</label>
                                <div className="relative">
                                    <select className="w-full bg-white border border-light-gray rounded-2xl h-14 px-4 text-base text-dark-gray appearance-none focus:ring-2 focus:ring-primary/20">
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option defaultValue="everyone" value="everyone">Everyone</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-primary pointer-events-none font-bold">keyboard_arrow_down</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Living In</label>
                                <div className="relative">
                                    <select className="w-full bg-white border border-light-gray rounded-2xl h-14 px-4 text-base text-dark-gray appearance-none focus:ring-2 focus:ring-primary/20" defaultValue="">
                                        <option disabled value="">Select city</option>
                                        <option value="london">London</option>
                                        <option value="paris">Paris</option>
                                        <option value="new-york">New York</option>
                                        <option value="berlin">Berlin</option>
                                        <option value="tokyo">Tokyo</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-primary pointer-events-none font-bold">keyboard_arrow_down</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Date of Birth</label>
                                <div className="relative">
                                    <input className="w-full bg-white border border-light-gray rounded-2xl h-14 px-4 text-base text-dark-gray focus:ring-2 focus:ring-primary/20" type="date" defaultValue="1995-06-15" />
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-medium-gray pointer-events-none">calendar_today</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight text-dark-gray">Interests</h3>
                                <span className="text-xs font-medium text-medium-gray bg-light-gray/50 px-2 py-1 rounded-md">3 selected</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-sm cursor-pointer">Live Music</div>
                                <div className="px-5 py-2.5 rounded-full border border-light-gray bg-white text-medium-gray text-sm font-medium cursor-pointer hover:bg-accent-blue/40 transition-colors">Tech Events</div>
                                <div className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-sm cursor-pointer">Art Galleries</div>
                                <div className="px-5 py-2.5 rounded-full border border-light-gray bg-white text-medium-gray text-sm font-medium cursor-pointer hover:bg-accent-blue/40 transition-colors">Wine Tasting</div>
                                <div className="px-5 py-2.5 rounded-full border border-light-gray bg-white text-medium-gray text-sm font-medium cursor-pointer hover:bg-accent-blue/40 transition-colors">Outdoor Movies</div>
                                <div className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-sm cursor-pointer">Coffee Roasting</div>
                                <div className="px-5 py-2.5 rounded-full border border-light-gray bg-white text-medium-gray text-sm font-medium cursor-pointer hover:bg-accent-blue/40 transition-colors">Jazz Nights</div>
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">About myself</label>
                            <textarea className="w-full bg-white border border-light-gray rounded-3xl p-4 text-base text-dark-gray focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-medium-gray/50" placeholder="Describe your ideal date or event vibe..." rows="4"></textarea>
                            <p className="text-right text-[10px] text-medium-gray font-medium uppercase tracking-widest px-2">0 / 250</p>
                        </div>
                    </section>
                </main>
                <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-6 bg-gradient-to-t from-soft-white via-soft-white/95 to-transparent z-10">
                    <button onClick={() => navigate('/events')} className="w-full bg-primary hover:brightness-105 active:scale-[0.98] text-white font-bold h-14 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
