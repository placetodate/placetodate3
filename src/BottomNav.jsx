import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    const isActive = (route) => {
        if (route === '/events') {
            return path === '/events' || path === '/' || path.startsWith('/event-details') || path.startsWith('/edit-event');
        }
        if (route === '/matches') {
            return path === '/matches';
        }
        if (route === '/chat') {
            return path.startsWith('/chat') || path === '/messages';
        }
        if (route === '/profile') {
            return path === '/edit-profile' || path.startsWith('/profile');
        }
        return false;
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white dark:bg-background-dark border-t border-border-light dark:border-white/10 px-6 pb-4 pt-4 flex items-center justify-between z-50 transition-colors duration-300">
            <button
                onClick={() => navigate('/events')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/events') ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
            >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: isActive('/events') ? "'FILL' 1" : "'FILL' 0" }}>calendar_today</span>
                <span className={`text-[10px] ${isActive('/events') ? 'font-bold' : 'font-medium'}`}>Events</span>
            </button>
            <button
                onClick={() => navigate('/matches')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/matches') ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
            >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: isActive('/matches') ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                <span className={`text-[10px] ${isActive('/matches') ? 'font-bold' : 'font-medium'}`}>Matches</span>
            </button>
            <button
                onClick={() => navigate('/messages')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/chat') ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
            >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: isActive('/chat') ? "'FILL' 1" : "'FILL' 0" }}>chat_bubble</span>
                <span className={`text-[10px] ${isActive('/chat') ? 'font-bold' : 'font-medium'}`}>Chat</span>
            </button>
            <button
                onClick={() => navigate('/edit-profile')}
                className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-primary' : 'text-text-muted hover:text-text-main'}`}
            >
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "'FILL' 0" }}>person</span>
                <span className={`text-[10px] ${isActive('/profile') ? 'font-bold' : 'font-medium'}`}>Profile</span>
            </button>
        </nav>
    );
};

export default BottomNav;
