import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // In a real app we might want to update the profile with displayName here
            // await updateProfile(auth.currentUser, { displayName: fullName });
            navigate('/edit-profile', { state: { hideBackButton: true } });
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    return (
        <div className="max-w-[480px] mx-auto min-h-screen flex flex-col relative overflow-hidden bg-white shadow-sm">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-pink blur-[80px] rounded-full pointer-events-none opacity-60"></div>
            <div className="absolute top-1/4 -right-32 w-80 h-80 bg-accent-blue blur-[100px] rounded-full pointer-events-none opacity-50"></div>
            <div className="flex items-center p-4 pb-2 justify-between z-10">
                <div className="text-text-main flex size-12 shrink-0 items-center cursor-pointer">
                    <Link to="/">
                        <span className="material-symbols-outlined font-semibold">arrow_back_ios_new</span>
                    </Link>
                </div>
                <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12 font-display">
                    Create Account
                </h2>
            </div>
            <div className="flex flex-col items-center px-6 pt-6 pb-2 z-10">

                <h1 className="text-text-main tracking-tight text-[30px] font-bold leading-tight text-center pb-2 font-display">
                    Start your journey
                </h1>
                <p className="text-text-muted text-base font-normal leading-relaxed text-center px-6">
                    Join the community and find your next date at an event you'll love.
                </p>
                {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
            </div>
            <form onSubmit={handleSignUp} className="flex flex-col gap-1 px-5 py-4 z-10">
                <div className="flex flex-col gap-2 py-2">
                    <p className="text-text-main text-sm font-semibold leading-normal px-2">Full Name</p>
                    <input
                        className="form-input flex w-full rounded-full text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/20 border-border-light bg-white focus:border-primary h-14 px-6 text-base font-normal transition-all placeholder:text-gray-400"
                        placeholder="John Doe"
                        type="text"
                    />
                </div>
                <div className="flex flex-col gap-2 py-2">
                    <p className="text-text-main text-sm font-semibold leading-normal px-2">Email</p>
                    <input
                        className="form-input flex w-full rounded-full text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/20 border-border-light bg-white focus:border-primary h-14 px-6 text-base font-normal transition-all placeholder:text-gray-400"
                        placeholder="email@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="flex flex-col gap-2 py-2">
                    <p className="text-text-main text-sm font-semibold leading-normal px-2">Password</p>
                    <div className="relative">
                        <input
                            className="form-input flex w-full rounded-full text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/20 border-border-light bg-white focus:border-primary h-14 px-6 text-base font-normal transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-xl">
                            visibility
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 py-2">
                    <p className="text-text-main text-sm font-semibold leading-normal px-2">Confirm Password</p>
                    <div className="relative">
                        <input
                            className="form-input flex w-full rounded-full text-text-main focus:outline-0 focus:ring-2 focus:ring-primary/20 border-border-light bg-white focus:border-primary h-14 px-6 text-base font-normal transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-xl">
                            visibility
                        </span>
                    </div>
                </div>
                <div className="flex flex-col px-5 pt-4 pb-4 gap-4 mt-auto z-10">
                    <button className="bg-primary text-white text-base font-bold h-14 rounded-full w-full shadow-lg shadow-primary/25 active:scale-[0.98] transition-all">
                        Create Account
                    </button>
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <span className="text-text-muted text-sm">Already have an account?</span>
                        <Link to="/login" className="text-primary text-sm font-bold">
                            Log In
                        </Link>
                    </div>

                </div>
            </form>
            <div className="h-8 w-full flex justify-center items-center">
                <div className="w-32 h-1 bg-gray-200 rounded-full"></div>
            </div>
        </div>
    );
};

export default SignUp;
