import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/events');
        } catch (err) {
            setError("Invalid email or password");
            console.error(err);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/events');
        } catch (err) {
            setError("Google sign in failed");
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative flex h-full min-h-screen w-full max-w-[430px] flex-col bg-background-soft overflow-x-hidden shadow-xl border-x border-border-light">
                <div className="flex items-center bg-transparent p-4 pb-2 justify-between">
                    <button className="p-2 text-primary" onClick={() => navigate(-1)}>
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
                        Login
                    </h2>
                </div>
                <div className="px-6 pt-10 pb-6 flex flex-col items-center">
                    <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-6xl" data-icon="favorite">
                            favorite
                        </span>
                    </div>
                </div>
                <div className="px-6 text-center">
                    <h1 className="text-text-main tracking-tight text-[32px] font-bold leading-tight">
                        placeToDate
                    </h1>
                    <p className="text-text-muted text-base font-normal leading-normal pb-8 pt-2">
                        Your next date is one event away.
                    </p>
                    {error && <p className="text-red-500 text-sm pb-2">{error}</p>}
                </div>
                <form onSubmit={handleLogin} className="flex flex-col gap-5 px-6">
                    <label className="flex flex-col w-full">
                        <p className="text-text-main text-sm font-semibold leading-normal pb-2 px-1">Email</p>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                                mail
                            </span>
                            <input
                                className="flex w-full rounded-2xl text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/30 border border-border-light bg-white h-14 pl-12 pr-4 text-base font-normal transition-all"
                                placeholder="hello@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </label>
                    <label className="flex flex-col w-full">
                        <p className="text-text-main text-sm font-semibold leading-normal pb-2 px-1">Password</p>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/50">
                                lock
                            </span>
                            <input
                                className="flex w-full rounded-2xl text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/30 border border-border-light bg-white h-14 pl-12 pr-12 text-base font-normal transition-all"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/50"
                            >
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </button>
                        </div>
                    </label>
                    <div className="flex justify-end px-1">
                        <a className="text-primary text-sm font-semibold hover:opacity-80" href="#">
                            Forgot Password?
                        </a>
                    </div>
                    <button className="mt-2 w-full h-14 bg-primary text-white font-bold rounded-2xl text-lg shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all">
                        Login
                    </button>
                </form>
                <div className="flex items-center gap-4 px-10 py-8">
                    <div className="h-[1px] flex-1 bg-border-light"></div>
                    <span className="text-text-muted/60 text-sm font-medium">or</span>
                    <div className="h-[1px] flex-1 bg-border-light"></div>
                </div>
                <div className="px-6 flex flex-col gap-3">
                    <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-3 w-full h-14 bg-white text-text-main font-bold rounded-2xl border border-border-light shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            ></path>
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            ></path>
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            ></path>
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            ></path>
                        </svg>
                        Continue with Google
                    </button>
                </div>
                <div className="mt-auto pb-10 pt-10 px-6 text-center">
                    <p className="text-text-muted font-medium">
                        Don't have an account?{' '}
                        <Link className="text-primary font-bold hover:underline" to="/signup">
                            Sign Up
                        </Link>
                    </p>
                </div>
                <div className="fixed top-[5%] left-[-15%] w-72 h-72 bg-primary-light/40 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="fixed bottom-[10%] right-[-15%] w-80 h-80 bg-accent-blue/50 rounded-full blur-[80px] pointer-events-none"></div>
            </div>
        </div>
    );
};

export default Login;
