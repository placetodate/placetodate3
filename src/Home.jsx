import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.png';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const Home = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/events');
        } catch (err) {
            console.error("Google sign in failed", err);
        }
    };

    return (
        <div className="bg-background-light text-[#1c0d16] flex flex-col items-center justify-between min-h-screen font-display">
            <main className="flex-grow flex flex-col items-center justify-between px-8 py-12 max-w-[430px] w-full min-h-screen">
                <div className="flex flex-col items-center justify-center w-full">
                    <div className="w-72 h-72">
                        <img
                            alt="placeToDate Logo"
                            className="w-full h-full object-contain"
                            src={logo}
                        />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[#9c497a] text-lg font-medium">Your next date is one event away.</p>
                    </div>
                </div>

                <div className="flex flex-col w-full gap-4 mt-2 mb-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center h-[58px] rounded-full bg-primary text-white text-base font-bold tracking-wide w-full shadow-[0_4px_20px_-4px_rgba(244,37,157,0.15)] active:scale-95 transition-all duration-200"
                    >
                        Log In
                    </button>

                    <button
                        onClick={() => navigate('/signup')}
                        className="flex items-center justify-center h-[58px] rounded-full bg-transparent text-primary border-2 border-primary text-base font-bold tracking-wide w-full active:scale-95 transition-all duration-200"
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={handleGoogleLogin}
                        className="flex items-center justify-center h-[58px] rounded-full bg-white border border-gray-200 text-[#1c0d16] text-base font-bold tracking-wide w-full active:scale-95 transition-all duration-200 gap-3 shadow-sm"
                    >
                        <svg height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        Connect with Google
                    </button>
                </div>

                <footer className="w-full text-center px-4 mb-4">
                    <p className="text-[#9c497a]/80 text-[13px] leading-relaxed font-medium">
                        By continuing you agree to our{' '}
                        <a className="text-primary font-bold hover:underline decoration-2 underline-offset-4" href="/terms">Terms of Service</a>
                        {' '}and{' '}
                        <a className="text-primary font-bold hover:underline decoration-2 underline-offset-4" href="/privacy">Privacy Policy</a>
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Home;
