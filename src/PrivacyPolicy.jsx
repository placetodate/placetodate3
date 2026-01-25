import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
    return (
        <div className="bg-background-light text-[#1c0d16] min-h-screen p-8 font-display">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="text-primary font-bold mb-6 inline-block hover:underline">← Back to Home</Link>
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <p className="mb-4">Your privacy is important to us. This policy explains how we collect and use your data.</p>

                <h2 className="text-xl font-bold mb-2 mt-6">1. Information We Collect</h2>
                <p className="mb-4">We collect information you provide directly to us, such as when you create an account.</p>

                <h2 className="text-xl font-bold mb-2 mt-6">2. How We Use Information</h2>
                <p className="mb-4">We use the information we collect to provide, maintain, and improve our services.</p>

                <h2 className="text-xl font-bold mb-2 mt-6">3. Data Security</h2>
                <p className="mb-4">We implement reasonable measures to help protect your personal information.</p>

                <p className="mt-8 text-text-muted text-sm">Last updated: January 2026</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
