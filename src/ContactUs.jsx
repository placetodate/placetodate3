import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';

const ContactUs = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Construct mailto link
        const mailtoLink = `mailto:support@placetodate.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-dark dark:text-white font-display min-h-screen flex justify-center transition-colors duration-300">
            <div className="relative flex h-full min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl pb-24 transition-colors duration-300">
                {/* Top App Bar */}
                <header className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between transition-colors duration-300">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
                    </button>
                    <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Contact Us</h2>
                </header>

                <main className="flex flex-col flex-1">
                    {/* HeadlineText */}
                    <section className="px-4 pt-6">
                        <h3 className="text-text-dark dark:text-white tracking-tight text-3xl font-bold leading-tight">We're here to help!</h3>
                    </section>

                    {/* BodyText */}
                    <section className="px-4 pt-2 pb-6">
                        <p className="text-text-dark/70 dark:text-white/70 text-base font-normal leading-relaxed">
                            Whether you have a question about an event or just want to say hi, drop us a message below and we'll get back to you as soon as possible.
                        </p>
                    </section>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                        {/* Dropdown Field */}
                        <div className="px-4 py-3">
                            <label className="flex flex-col gap-2">
                                <p className="text-text-dark dark:text-white text-base font-semibold leading-normal ml-1">Subject</p>
                                <div className="relative">
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="appearance-none form-input flex w-full rounded-2xl text-text-dark dark:text-white border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 h-14 px-4 pr-12 text-base font-normal leading-normal focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    >
                                        <option disabled value="" className="text-gray-500 bg-white dark:bg-background-dark">What can we help with?</option>
                                        <option value="Event Issue" className="bg-white dark:bg-background-dark">Event Issue</option>
                                        <option value="Account Support" className="bg-white dark:bg-background-dark">Account Support</option>
                                        <option value="General Feedback" className="bg-white dark:bg-background-dark">General Feedback</option>
                                        <option value="Safety Concern" className="bg-white dark:bg-background-dark">Safety Concern</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Text Area */}
                        <div className="px-4 py-3">
                            <label className="flex flex-col gap-2">
                                <p className="text-text-dark dark:text-white text-base font-semibold leading-normal ml-1">Your Message</p>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="form-input flex w-full min-w-0 flex-1 resize-none rounded-2xl text-text-dark dark:text-white border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 min-h-40 p-4 text-base font-normal leading-normal placeholder:text-primary/50 dark:placeholder:text-primary/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                                    placeholder="Tell us more about your inquiry..."
                                ></textarea>
                            </label>
                        </div>

                        {/* Send Button */}
                        <div className="px-4 py-4">
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>

                    {/* Alternative Contact Methods */}
                    <section className="mt-8 px-4 pb-12">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-full h-px bg-gray-200 dark:bg-white/10"></div>
                            <p className="text-text-dark/50 dark:text-white/50 text-sm font-medium uppercase tracking-widest">Or reach us via</p>
                            <div className="flex gap-8">
                                <a className="flex flex-col items-center gap-2 group" href="mailto:support@placetodate.com">
                                    <div className="size-14 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white group-hover:bg-primary group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-2xl">mail</span>
                                    </div>
                                    <span className="text-xs font-semibold text-text-dark dark:text-white">Email</span>
                                </a>
                                <a className="flex flex-col items-center gap-2 group" href="#">
                                    <div className="size-14 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white group-hover:bg-primary group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                                    </div>
                                    <span className="text-xs font-semibold text-text-dark dark:text-white">Instagram</span>
                                </a>
                                <a className="flex flex-col items-center gap-2 group" href="#">
                                    <div className="size-14 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white group-hover:bg-primary group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-2xl">share</span>
                                    </div>
                                    <span className="text-xs font-semibold text-text-dark dark:text-white">Twitter</span>
                                </a>
                            </div>
                            <p className="text-sm font-medium text-primary cursor-pointer hover:underline pt-2">support@placetodate.com</p>
                        </div>
                    </section>
                </main>

                <BottomNav />
            </div>
        </div>
    );
};

export default ContactUs;
