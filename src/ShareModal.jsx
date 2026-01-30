import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

// logo import removed as we draw it
// import logo from './assets/logo_no_text.png';

const ShareModal = ({ isOpen, onClose, eventLink, eventName }) => {
    const [view, setView] = useState('menu'); // 'menu', 'qr'
    const [copyFeedback, setCopyFeedback] = useState(false);
    const canvasRef = useRef(null);

    if (!isOpen) return null;

    const handleShareLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventName,
                    text: `Check out ${eventName} on PlaceToDate!`,
                    url: eventLink,
                });
            } catch (err) {
                console.log("Error sharing:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(eventLink);
                setCopyFeedback(true);
                setTimeout(() => setCopyFeedback(false), 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById('event-qr-code');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${eventName.replace(/\s+/g, '_')}_QR.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const handleDownloadAd = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const qrCanvas = document.getElementById('event-qr-code');

        // Settings
        const width = 1080;
        const height = 1080;
        canvas.width = width;
        canvas.height = height;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#FFF5F7'); // Very light pink
        gradient.addColorStop(1, '#FFF0F5'); // Lavender blush
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Circular Border / Frame
        const borderPadding = 40;
        ctx.strokeStyle = '#f4259d'; // Primary Pink
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.roundRect(
            borderPadding,
            borderPadding,
            width - (borderPadding * 2),
            height - (borderPadding * 2),
            60
        );
        ctx.stroke();

        // Decorative Circle 1 (Subtle)
        ctx.beginPath();
        ctx.fillStyle = '#fce7f3'; // pink-100
        ctx.arc(width, 0, 400, 0, Math.PI * 2);
        ctx.fill();

        // Decorative Circle 2 (Subtle)
        ctx.beginPath();
        ctx.fillStyle = '#fce7f3';
        ctx.arc(0, height, 300, 0, Math.PI * 2);
        ctx.fill();

        // Text Setup
        ctx.textAlign = 'left';

        // Vertical start position
        // Moved up significantly to 115 to avoid overlap with "The best" text below
        let y = 115;

        // Measure Title text
        ctx.fillStyle = '#f4259d'; // primary
        ctx.font = 'bold 80px "Plus Jakarta Sans", sans-serif';
        ctx.textBaseline = 'middle';
        const titleText = 'Place to Date';
        const titleMetrics = ctx.measureText(titleText);
        const titleWidth = titleMetrics.width;

        // Icon Calculation (Drawing instead of Image)
        const iconSize = 100; // Reduced from 130
        const gap = 30;

        // Calculate total width to center the group
        const totalHeaderWidth = iconSize + gap + titleWidth;
        const startX = (width - totalHeaderWidth) / 2;

        // --- DRAW ICON (Calendar + Heart) ---
        // Reference: Outline calendar, horizontal line, heart in middle.
        const iconX = startX;
        const iconY = y - (iconSize / 2); // Top-left of icon square area

        const calPadding = 10;
        const calWidth = iconSize;
        const calHeight = iconSize;
        const lineThickness = 7; // Slightly thinner for smaller icon

        // 1. Calendar Body (Rounded Rect)
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineThickness;
        ctx.strokeStyle = '#000000'; // Pure Black as per ref
        ctx.fillStyle = 'transparent';

        const bodyTopY = iconY + 18; // Adjusted shift
        const bodyHeight = calHeight - 18;

        ctx.beginPath();
        ctx.roundRect(iconX, bodyTopY, calWidth, bodyHeight, 22);
        ctx.stroke();

        // 2. Horizontal Line inside
        // Approx 1/4 down from body top
        const lineY = bodyTopY + (bodyHeight * 0.28);
        ctx.beginPath();
        ctx.moveTo(iconX, lineY);
        ctx.lineTo(iconX + calWidth, lineY);
        ctx.stroke();

        // 3. Rings / Binders (Pill shapes)
        // They sit on top of the border, crossing it. 
        // We draw them as filled rounded rects or stroked lines with rounded caps.
        // Ref shows black pill shapes.
        const ringWidth = 10; // Scaled down
        const ringHeight = 30; // Scaled down
        const ringXoffset = calWidth * 0.25;

        ctx.fillStyle = '#000000';

        // Left Ring
        const ring1X = iconX + ringXoffset - (ringWidth / 2);
        const ringYcoord = iconY + 4; // Start near top

        ctx.beginPath();
        ctx.roundRect(ring1X, ringYcoord, ringWidth, ringHeight, 10);
        ctx.fill();

        // Right Ring
        const ring2X = iconX + (calWidth - ringXoffset) - (ringWidth / 2);
        ctx.beginPath();
        ctx.roundRect(ring2X, ringYcoord, ringWidth, ringHeight, 10);
        ctx.fill();

        // 4. Heart inside (Centered in the area BELOW the line)
        const contentTop = lineY;
        const contentHeight = (bodyTopY + bodyHeight) - lineY;

        const heartCenterX = iconX + (calWidth / 2);
        // Reduced size more (0.50 -> 0.45) 
        // Moved UP (centered - 15px) to be fully inside
        const heartCenterY = contentTop + (contentHeight / 2) - 10;
        const heartSize = calWidth * 0.35;

        drawHeart(ctx, heartCenterX, heartCenterY, heartSize, '#f4259d');

        // --- END ICON ---

        // Draw Title (Right of Icon)
        ctx.fillStyle = '#f4259d'; // primary
        ctx.fillText(titleText, startX + iconSize + gap, y);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        // Tagline
        y += 130;
        ctx.fillStyle = '#1c0d16';
        ctx.font = 'bold 60px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('The best way to meet', width / 2, y);

        y += 75;
        ctx.fillStyle = '#f4259d';
        ctx.font = 'bold italic 70px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('is in person.', width / 2, y);

        // CTA Box and QR
        y += 55;
        const qrSize = 420;
        const qrPadding = 25;
        const boxWidth = qrSize + (qrPadding * 2);
        const boxHeight = qrSize + (qrPadding * 2);
        const boxX = (width - boxWidth) / 2;
        const boxY = y;

        // Box Body
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 50);
        ctx.fill();

        // QR Code
        if (qrCanvas) {
            ctx.drawImage(qrCanvas, boxX + qrPadding, boxY + qrPadding, qrSize, qrSize);
        }

        // Subtext below QR
        const subtextY = boxY + boxHeight + 60;
        ctx.fillStyle = '#6b7280';
        ctx.font = '600 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Scan to find your match', width / 2, subtextY);
        ctx.fillText('at this event right now!', width / 2, subtextY + 50);

        // Export
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${eventName.replace(/\s+/g, '_')}_Ad.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Helper for Heart
    const drawHeart = (ctx, x, y, size, color) => {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        const w = size;
        const h = size;

        // Reset path
        ctx.beginPath();
        ctx.translate(x, y);

        // Scale to size
        const s = size / 2;

        ctx.moveTo(0, -s * 0.3);
        ctx.bezierCurveTo(-s, -s, -s * 2.2, s * 0.5, 0, s * 1.8); // Left side
        ctx.bezierCurveTo(s * 2.2, s * 0.5, s, -s, 0, -s * 0.3); // Right side

        ctx.fill();
        ctx.restore();
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100 transition-transform flex flex-col items-center animate-in zoom-in duration-200">

                <h3 className="text-xl font-bold text-text-dark mb-6">Share Event</h3>

                {view === 'menu' ? (
                    <div className="w-full space-y-3">
                        <button
                            onClick={handleShareLink}
                            className="w-full py-4 px-6 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-primary">share</span>
                                </div>
                                <span className="font-bold text-text-dark">Share Event Link</span>
                            </div>
                            {copyFeedback ? (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full animate-in fade-in">Copied!</span>
                            ) : (
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                            )}
                        </button>

                        <button
                            onClick={() => setView('qr')}
                            className="w-full py-4 px-6 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-text-dark">qr_code_2</span>
                                </div>
                                <span className="font-bold text-text-dark">Show QR Code</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">chevron_right</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full animate-in slide-in-from-right duration-200">
                        <div className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm mb-6">
                            <QRCodeCanvas
                                id="event-qr-code"
                                value={eventLink}
                                size={200}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full mb-3">
                            <button
                                onClick={handleDownloadQR}
                                className="w-full py-3 bg-white text-text-dark border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">download</span>
                                Save QR
                            </button>
                            {navigator.share && (
                                <button
                                    onClick={async () => {
                                        const canvas = document.getElementById('event-qr-code');
                                        if (canvas) {
                                            canvas.toBlob(async (blob) => {
                                                const file = new File([blob], "qr.png", { type: "image/png" });
                                                try {
                                                    await navigator.share({
                                                        files: [file],
                                                        title: 'Event QR',
                                                        text: 'Scan to join!'
                                                    });
                                                } catch (e) { console.log(e); }
                                            });
                                        }
                                    }}
                                    className="w-full py-3 bg-white text-text-dark border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined">ios_share</span>
                                    Share QR
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleDownloadAd}
                            className="w-full py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3"
                        >
                            <span className="material-symbols-outlined">campaign</span>
                            Download "Place to Date" Ad
                        </button>

                        <button
                            onClick={() => setView('menu')}
                            className="text-text-muted font-bold hover:text-text-dark transition-colors py-2"
                        >
                            Back
                        </button>
                    </div>
                )}

                {/* Close Button absolute */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full bg-gray-100 text-text-muted hover:bg-gray-200 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    );
};

export default ShareModal;
