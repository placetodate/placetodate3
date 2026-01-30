import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase'; // Adjust paths as needed
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import BottomNav from './BottomNav';

const Settings = () => {
    const navigate = useNavigate();
    const [isFrozen, setIsFrozen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        // Initialize state based on current class
        if (document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = (e) => {
        const isDark = e.target.checked;
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setIsFrozen(docSnap.data().isFrozen || false);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleFreezeAccount = async (e) => {
        const newValue = e.target.checked;
        setIsFrozen(newValue);
        if (user) {
            try {
                const docRef = doc(db, 'users', user.uid);
                await updateDoc(docRef, { isFrozen: newValue });
            } catch (error) {
                console.error("Error updating freeze status:", error);
                // Revert if error
                setIsFrozen(!newValue);
            }
        }
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            if (user) {
                // Logic to delete user data from Firestore
                await deleteDoc(doc(db, 'users', user.uid));
                // Logic to delete user from Auth (requires re-authentication usually, but we'll try direct delete)
                await user.delete();
                navigate('/login');
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete account. You may need to re-login first.");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleContactUs = () => {
        navigate('/contact');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-dark dark:text-white font-display min-h-screen flex justify-center transition-colors duration-300">
            <div className="relative flex h-full min-h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark overflow-x-hidden shadow-2xl transition-colors duration-300">
                {/* Top App Bar */}
                <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 sticky top-0 z-10 transition-colors duration-300">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                    </button>
                    <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Settings</h2>
                </div>

                <div className="flex flex-col flex-1 pb-24">
                    {/* Account Management Section */}
                    <h3 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-6">Account Management</h3>

                    {/* Contact Us ListItem */}
                    <button
                        onClick={handleContactUs}
                        className="flex items-center gap-4 bg-white dark:bg-white/5 mx-4 mt-2 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-all active:scale-95 w-[92%]"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-pink-100 dark:bg-primary/20 shrink-0 size-10">
                                <span className="material-symbols-outlined">chat</span>
                            </div>
                            <p className="text-text-dark dark:text-white text-base font-medium leading-normal flex-1 text-left truncate">Contact Us</p>
                        </div>
                        <div className="shrink-0 text-gray-400 dark:text-white/40">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </div>
                    </button>

                    {/* Freeze Account ListItem (with Toggle) */}
                    <div className="flex items-center gap-4 bg-white dark:bg-white/5 mx-4 mt-2 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-pink-100 dark:bg-primary/20 shrink-0 size-12">
                                <span className="material-symbols-outlined">ac_unit</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-text-dark dark:text-white text-base font-medium leading-normal">Freeze Account</p>
                                <p className="text-primary text-sm font-normal leading-tight">Temporarily hide your profile</p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-gray-200 dark:bg-white/20 p-0.5 transition-colors duration-200 has-[:checked]:bg-primary">
                                <div className={`h-[27px] w-[27px] rounded-full bg-white shadow-md transform transition-transform duration-200 ${isFrozen ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                                <input
                                    className="hidden"
                                    type="checkbox"
                                    checked={isFrozen}
                                    onChange={handleFreezeAccount}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center gap-4 bg-white dark:bg-white/5 mx-4 mt-2 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="text-primary flex items-center justify-center rounded-lg bg-pink-100 dark:bg-primary/20 shrink-0 size-12">
                                <span className="material-symbols-outlined">dark_mode</span>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-text-dark dark:text-white text-base font-medium leading-normal">Dark Mode</p>
                                <p className="text-primary text-sm font-normal leading-tight">Switch app theme</p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-gray-200 dark:bg-white/20 p-0.5 transition-colors duration-200 has-[:checked]:bg-primary">
                                <div className={`h-[27px] w-[27px] rounded-full bg-white shadow-md transform transition-transform duration-200 ${isDarkMode ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                                <input
                                    className="hidden"
                                    type="checkbox"
                                    checked={isDarkMode}
                                    onChange={toggleTheme}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Account Actions Section */}
                    <h3 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-8">Account Actions</h3>

                    {/* Delete Account ListItem */}
                    <button
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-4 bg-white dark:bg-white/5 mx-4 mt-2 p-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm cursor-pointer active:bg-gray-50 dark:active:bg-white/10 transition-colors w-[92%]"
                    >
                        <div className="flex items-center gap-4 flex-1">
                            <div className="text-red-500 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/20 shrink-0 size-10">
                                <span className="material-symbols-outlined">delete</span>
                            </div>
                            <p className="text-red-500 text-base font-medium leading-normal">Delete Account</p>
                        </div>
                    </button>

                    {/* Log Out Button */}
                    <div className="px-4 mt-auto pt-12 mb-6">
                        <button
                            onClick={handleLogout}
                            className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary/90"
                        >
                            Log Out
                        </button>
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 font-medium uppercase tracking-widest">Version 2.4.1 (Build 109)</p>
                    </div>
                </div>

                <BottomNav />
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
                    <div className="relative bg-white dark:bg-[#1e1e1e] rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 transition-transform">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="size-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-dark dark:text-white">Delete Account?</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                Are you sure you want to delete your account? All your data will be permanently removed.
                            </p>
                            <div className="grid grid-cols-2 gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="py-3 rounded-2xl font-bold text-text-dark dark:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={loading}
                                    className="py-3 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
