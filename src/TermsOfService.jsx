import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div className="bg-background-light text-[#1c0d16] min-h-screen p-8 font-display">
            <div className="max-w-2xl mx-auto">
                <Link to="/" className="text-primary font-bold mb-6 inline-block hover:underline">← Back to Home</Link>
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <p className="mb-4">Welcome to Place to Date. By using our application, you agree to these terms.</p>

                <h2 className="text-xl font-bold mb-2 mt-6">1. Acceptance of Terms</h2>
                <p className="mb-4">By accessing or using our service, you agree to be bound by these Terms of Service.</p>

                <h2 className="text-xl font-bold mb-2 mt-6">2. User Conduct</h2>
                <p className="mb-4">You agree to use the service only for lawful purposes and in accordance with these Terms.</p>

                <h2 className="text-xl font-bold mb-2 mt-6">3. Accounts</h2>
                <p className="mb-4">You are responsible for maintaining the confidentiality of your account and password.</p>

                <p className="mt-8 text-text-muted text-sm">Last updated: January 2026</p>
            </div>
        </div>
    );
};

export default TermsOfService;
