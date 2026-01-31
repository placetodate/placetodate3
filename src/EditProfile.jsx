import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAvatar, getRandomAvatar, getAvatarId, getRandomAvatarId, getAvatarUrl } from './utils/avatarUtils';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, storage } from "./firebase";
import { Link } from 'react-router-dom';
import { resizeImage } from './utils/imageUtils';

const EditProfile = () => {

    const AVAILABLE_INTERESTS = [
        "Live Music", "Tech Events", "Art Galleries", "Wine Tasting", "Outdoor Movies",
        "Coffee Roasting", "Jazz Nights", "Hiking", "Cooking Classes", "Foodie Tours",
        "Yoga", "Board Games", "Photography", "Surfing", "Gaming", "Theater",
        "Museums", "Nightlife", "Volunteering", "Travel", "Reading", "Pets"
    ];

    const navigate = useNavigate();
    const location = useLocation();
    const hideBackButton = location.state?.hideBackButton;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState(Array(6).fill(null));
    const [imagePositions, setImagePositions] = useState(Array(6).fill({ x: 50, y: 50 }));
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isAvatarMode, setIsAvatarMode] = useState(false);
    const [avatarId, setAvatarId] = useState('');
    const [initialData, setInitialData] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [uploadingSlot, setUploadingSlot] = useState(null);

    // Image Adjustment State
    const [croppingFile, setCroppingFile] = useState(null);
    const [croppingSlot, setCroppingSlot] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [tempPosition, setTempPosition] = useState({ x: 50, y: 50 });

    // Form State
    const [name, setName] = useState('');
    const [gender, setGender] = useState('female');
    const [interestedIn, setInterestedIn] = useState('men');
    const [livingIn, setLivingIn] = useState('');
    const [birthDate, setBirthDate] = useState('1995-06-15');
    const [bio, setBio] = useState('');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [legalAgreed, setLegalAgreed] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fileInputRef = useRef(null);
    const [currentImageSlot, setCurrentImageSlot] = useState(null);
    const [draggingSlot, setDraggingSlot] = useState(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    // Ref for drag within the modal
    const modalDragStartRef = useRef({ x: 0, y: 0 });
    const [isDraggingModal, setIsDraggingModal] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserProfile(currentUser.uid);
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchUserProfile = async (uid) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setName(data.name || '');
                setGender(data.gender || 'female');
                setInterestedIn(data.interestedIn || 'men');
                setLivingIn(data.livingIn || '');
                setBirthDate(data.birthDate || '1995-06-15');
                setBio(data.bio || '');
                setSelectedInterests(data.interests || []);
                setImages(data.images || Array(6).fill(null));
                setImagePositions(data.imagePositions || Array(6).fill({ x: 50, y: 50 }));
                setIsProfileComplete(!!data.isProfileComplete);
                setIsAvatarMode(!!data.isAvatarMode);
                setAvatarId(data.avatarId || getAvatarId(uid));

                setInitialData({
                    name: data.name || '',
                    gender: data.gender || 'female',
                    interestedIn: data.interestedIn || 'men',
                    livingIn: data.livingIn || '',
                    birthDate: data.birthDate || '1995-06-15',
                    bio: data.bio || '',
                    interests: data.interests || [],
                    images: data.images || Array(6).fill(null),
                    imagePositions: data.imagePositions || Array(6).fill({ x: 50, y: 50 }),
                    isAvatarMode: !!data.isAvatarMode,
                    avatarId: data.avatarId || getAvatarId(uid)
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleImageClick = (index) => {
        setCurrentImageSlot(index);
        fileInputRef.current.click();
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file || currentImageSlot === null || !user) return;

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setCroppingFile(file);
        setCroppingSlot(currentImageSlot);
        setTempPosition({ x: 50, y: 50 });

        // Clear input so same file can be selected again if cancelled
        e.target.value = null;
    };

    const handleConfirmUpload = async () => {
        if (!croppingFile || croppingSlot === null || !user) return;

        setUploadingSlot(croppingSlot);
        // Clean up preview
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        // Clear modal state so we see the spinner on the slot
        setCroppingFile(null);
        setPreviewUrl(null);

        try {
            const resizedDataUrl = await resizeImage(croppingFile);
            const blob = await (await fetch(resizedDataUrl)).blob();

            const storageRef = ref(storage, `profile_images/${user.uid}/${Date.now()}_${croppingFile.name}`);
            const snapshot = await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(snapshot.ref);

            const newImages = [...images];
            newImages[croppingSlot] = downloadURL;
            setImages(newImages);

            const newPositions = [...imagePositions];
            newPositions[croppingSlot] = tempPosition;
            setImagePositions(newPositions);

        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploadingSlot(null);
            setCroppingSlot(null);
        }
    };

    const handleCancelUpload = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setCroppingFile(null);
        setCroppingSlot(null);
        setPreviewUrl(null);
        setTempPosition({ x: 50, y: 50 });
    };

    // Modal Drag Handlers
    const handleModalMouseDown = (e) => {
        e.preventDefault();
        setIsDraggingModal(true);
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        modalDragStartRef.current = { x: clientX, y: clientY };
    };

    const handleModalMouseMove = (e) => {
        if (!isDraggingModal) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - modalDragStartRef.current.x;
        const deltaY = clientY - modalDragStartRef.current.y;

        const sensitivity = 0.2;

        const newX = tempPosition.x - (deltaX * sensitivity);
        const newY = tempPosition.y - (deltaY * sensitivity);

        setTempPosition({
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY))
        });

        modalDragStartRef.current = { x: clientX, y: clientY };
    };

    const handleModalMouseUp = () => {
        setIsDraggingModal(false);
    };

    const handleShuffleAvatar = () => {
        setAvatarId(getRandomAvatarId());
    };

    useEffect(() => {
        if (!initialData) return;

        const checkDirty = () => {
            if (name !== initialData.name) return true;
            if (gender !== initialData.gender) return true;
            if (interestedIn !== initialData.interestedIn) return true;
            if (livingIn !== initialData.livingIn) return true;
            if (birthDate !== initialData.birthDate) return true;
            if (bio !== initialData.bio) return true;
            if (isAvatarMode !== initialData.isAvatarMode) return true;
            if (avatarId !== initialData.avatarId) return true;

            // Arrays comparison
            if (JSON.stringify(selectedInterests.sort()) !== JSON.stringify(initialData.interests.sort())) return true;
            if (JSON.stringify(images) !== JSON.stringify(initialData.images)) return true;
            if (JSON.stringify(imagePositions) !== JSON.stringify(initialData.imagePositions)) return true;

            return false;
        };

        setIsDirty(checkDirty());
    }, [name, gender, interestedIn, livingIn, birthDate, bio, selectedInterests, images, imagePositions, isAvatarMode, avatarId, initialData]);

    const validateImages = (currentImages, avatarMode) => {
        if (!avatarMode && !currentImages.some(img => img !== null)) {
            setFormErrors(prev => ({ ...prev, images: "At least 1 photo is required" }));
        } else {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.images;
                return newErrors;
            });
        }
    };

    useEffect(() => {
        validateImages(images, isAvatarMode);
    }, [images, isAvatarMode]);

    const handleRemoveImage = (index, e) => {
        e.stopPropagation();

        const newImages = [...images];
        const newPositions = [...imagePositions];

        // Remove the image and its position at the specific index
        newImages.splice(index, 1);
        newPositions.splice(index, 1);

        // Pad arrays back to length 6
        while (newImages.length < 6) {
            newImages.push(null);
            newPositions.push({ x: 50, y: 50 });
        }

        setImages(newImages);
        setImagePositions(newPositions);
    };

    const moveImage = (index, direction, e) => {
        e.stopPropagation();
        const targetIndex = index + direction;

        // Check bounds
        if (targetIndex < 0 || targetIndex >= images.length) return;

        const newImages = [...images];
        const newPositions = [...imagePositions];

        // Swap images
        const tempImage = newImages[index];
        newImages[index] = newImages[targetIndex];
        newImages[targetIndex] = tempImage;

        // Swap positions
        const tempPos = newPositions[index];
        newPositions[index] = newPositions[targetIndex];
        newPositions[targetIndex] = tempPos;

        setImages(newImages);
        setImagePositions(newPositions);
    };

    // Add global event listeners for modal drag handling
    useEffect(() => {
        if (isDraggingModal) {
            window.addEventListener('mousemove', handleModalMouseMove, { passive: false });
            window.addEventListener('mouseup', handleModalMouseUp);
            window.addEventListener('touchmove', handleModalMouseMove, { passive: false });
            window.addEventListener('touchend', handleModalMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleModalMouseMove);
            window.removeEventListener('mouseup', handleModalMouseUp);
            window.removeEventListener('touchmove', handleModalMouseMove);
            window.removeEventListener('touchend', handleModalMouseUp);
        };
    }, [isDraggingModal]);

    const validateForm = () => {
        const errors = {};
        if (!name.trim()) errors.name = "Name is required";
        if (!birthDate) errors.birthDate = "Date of Birth is required";
        if (!isAvatarMode && !images.some(img => img !== null)) errors.images = "At least 1 photo is required";

        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        if (age < 18) errors.birthDate = "You must be at least 18 years old";

        if (selectedInterests.length === 0) errors.interests = "Select at least 1 interest";

        if (!isProfileComplete && !legalAgreed) errors.legal = "You must agree to the Terms & Privacy Policy";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !user) return;

        setSaving(true);
        try {
            const userData = {
                name,
                gender,
                interestedIn,
                livingIn,
                birthDate,
                bio,
                interests: selectedInterests,
                images,
                imagePositions,
                isProfileComplete: true,
                updatedAt: new Date(),
                email: user.email,
                isAvatarMode,
                avatarId: avatarId || getAvatarId(user.uid)
            };

            await setDoc(doc(db, "users", user.uid), userData, { merge: true });
            navigate('/events');
        } catch (error) {
            console.error("Error saving profile:", error);
            setError("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light">
                <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex justify-center bg-soft-white font-display h-screen overflow-hidden">
            <div className="relative flex w-full max-w-[430px] flex-col h-full bg-soft-white shadow-xl border-x border-light-gray">
                {/* Header - Fixed Height */}
                {/* Header - Sticky */}
                <div className="shrink-0 z-40 w-full flex items-center bg-white/80 backdrop-blur-md p-4 justify-between border-b border-border-light">
                    {!hideBackButton ? (
                        <button onClick={() => navigate(-1)} className="text-text-dark flex size-10 shrink-0 items-center justify-center bg-gray-100 rounded-full">
                            <span className="material-symbols-outlined">arrow_back_ios_new</span>
                        </button>
                    ) : (
                        <div className="size-10"></div>
                    )}
                    <h2 className="text-text-dark text-lg font-bold leading-tight tracking-tight flex-1 text-center">Edit My Profile</h2>
                    <div className="flex w-10 items-center justify-end">
                        <div className="size-10"></div>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <main className="flex-1 overflow-y-auto px-6 pt-6 pb-6 scroll-smooth">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 animate-pulse">
                            <span className="material-symbols-outlined text-xl">error</span>
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}
                    <section className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold tracking-tight text-dark-gray">Your Photos {!isAvatarMode && <span className="text-red-600">*</span>}</h3>
                            <span className="text-sm text-primary font-semibold">{images.filter(Boolean).length}/6 Slots</span>
                        </div>
                        {formErrors.images && <p className="text-red-600 text-sm mb-2 font-medium">{formErrors.images}</p>}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                        />

                        <div className={`transition-all rounded-xl ${formErrors.images ? 'border-2 border-red-600 p-2' : ''}`}>
                            <div className="grid grid-cols-3 gap-3">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            if (uploadingSlot === i) return;
                                            !images[i] && handleImageClick(i);
                                        }}
                                        className={`relative aspect-[3/4] rounded-2xl border-2 bg-cover bg-no-repeat shadow-sm transition-all overflow-hidden ${img
                                            ? 'border-primary/20'
                                            : 'border-dashed border-light-gray bg-white hover:border-primary/40 hover:bg-accent-pink/30 flex items-center justify-center group cursor-pointer'
                                            }`}
                                        style={img ? {
                                            backgroundImage: `url('${img}')`,
                                            backgroundPosition: `${imagePositions[i]?.x || 50}% ${imagePositions[i]?.y || 50}%`
                                        } : {}}
                                    >
                                        {uploadingSlot === i ? (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
                                                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : img ? (
                                            <>
                                                <button
                                                    onClick={(e) => handleRemoveImage(i, e)}
                                                    className="absolute top-1 right-1 size-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-10"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>

                                                {/* Reorder Arrows */}
                                                <div className="absolute bottom-0 inset-x-0 h-8 bg-black/40 backdrop-blur-sm flex items-center justify-between px-2">
                                                    {(i > 0) && (
                                                        <button
                                                            onClick={(e) => moveImage(i, -1, e)}
                                                            className="text-white hover:text-primary transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                                                        </button>
                                                    )}

                                                    {/* Spacer if first item to keep edit centered if we wanted, or just flex-between implies separation */}
                                                    {i === 0 && <div className="w-5"></div>}

                                                    <div
                                                        onClick={() => {
                                                            setCurrentImageSlot(i);
                                                            fileInputRef.current.click();
                                                        }}
                                                        className="size-6 bg-primary text-white rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-primary-dark"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">edit</span>
                                                    </div>

                                                    {(i < 5 && images[i + 1]) && (
                                                        <button
                                                            onClick={(e) => moveImage(i, 1, e)}
                                                            className="text-white hover:text-primary transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                                        </button>
                                                    )}
                                                    {/* Spacer if last item */}
                                                    {!(i < 5 && images[i + 1]) && <div className="w-5"></div>}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="material-symbols-outlined text-light-gray group-hover:text-primary transition-colors">add_circle</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Avatar Mode Checkbox */}
                        <div className="mt-4 bg-purple-50 rounded-2xl p-4 border border-purple-100">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={isAvatarMode}
                                        onChange={(e) => {
                                            setIsAvatarMode(e.target.checked);
                                            if (e.target.checked) {
                                                // Always pick a random one on toggle to be fresh
                                                setAvatarId(getRandomAvatarId());
                                            }
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-purple-600">face</span>
                                        <p className="font-bold text-dark-gray">Show Face Avatar</p>
                                    </div>
                                    <p className="text-sm text-medium-gray">
                                        Instead of your photos, users will see a generated avatar. This helps maintain privacy while keeping your profile fun!
                                    </p>
                                </div>
                            </label>
                            {isAvatarMode && (
                                <div className="mt-4 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <img
                                        src={getAvatarUrl(avatarId || (user ? getAvatarId(user.uid) : ''))}
                                        alt="My Avatar"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleShuffleAvatar();
                                        }}
                                        className="size-40 rounded-full border-4 border-white shadow-md bg-white cursor-pointer hover:scale-105 transition-transform"
                                        title="Click to shuffle"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleShuffleAvatar();
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-200 text-purple-600 rounded-full text-xs font-bold shadow-sm hover:bg-purple-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                        Shuffle Look
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-8 mb-6">
                        <h3 className="text-lg font-bold tracking-tight text-dark-gray border-l-4 border-primary pl-3">Personal Information</h3>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Name <span className="text-red-600">*</span></label>
                                <input
                                    className={`w-full bg-white border rounded-2xl h-14 px-4 text-base text-dark-gray focus:outline-none focus:ring-2 ${formErrors.name ? 'border-2 border-red-600 focus:ring-red-600/20' : 'border-border-light focus:ring-primary/20'}`}
                                    type="text"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setFormErrors(prev => ({ ...prev, name: "Name is required" }));
                                        } else {
                                            setFormErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.name;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                />
                                {formErrors.name && <p className="text-red-600 text-xs pl-1">{formErrors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Gender</label>
                                <div className="relative">
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-white border border-border-light rounded-2xl h-14 px-4 text-base text-dark-gray appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
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
                                    <select
                                        value={interestedIn}
                                        onChange={(e) => setInterestedIn(e.target.value)}
                                        className="w-full bg-white border border-border-light rounded-2xl h-14 px-4 text-base text-dark-gray appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="men">Men</option>
                                        <option value="women">Women</option>
                                        <option value="everyone">Everyone</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-primary pointer-events-none font-bold">keyboard_arrow_down</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Living In</label>
                                <div className="relative">
                                    <select
                                        value={livingIn}
                                        onChange={(e) => setLivingIn(e.target.value)}
                                        className="w-full bg-white border border-border-light rounded-2xl h-14 px-4 text-base text-dark-gray appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option disabled value="">Select city</option>
                                        <option value="london">London</option>
                                        <option value="paris">Paris</option>
                                        <option value="new-york">New York</option>
                                        <option value="berlin">Berlin</option>
                                        <option value="tokyo">Tokyo</option>
                                        <option value="tel-aviv">Tel Aviv</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-primary pointer-events-none font-bold">keyboard_arrow_down</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">Date of Birth <span className="text-red-600">*</span></label>
                                <div className="relative">
                                    <input
                                        value={birthDate}
                                        onChange={(e) => {
                                            setBirthDate(e.target.value);
                                            if (!e.target.value) {
                                                setFormErrors(prev => ({ ...prev, birthDate: "Date of Birth is required" }));
                                            } else {
                                                const age = new Date().getFullYear() - new Date(e.target.value).getFullYear();
                                                if (age < 18) {
                                                    setFormErrors(prev => ({ ...prev, birthDate: "You must be at least 18 years old" }));
                                                } else {
                                                    setFormErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.birthDate;
                                                        return newErrors;
                                                    });
                                                }
                                            }
                                        }}
                                        className={`w-full bg-white border rounded-2xl h-14 px-4 text-base text-dark-gray focus:outline-none focus:ring-2 ${formErrors.birthDate ? 'border-2 border-red-600 focus:ring-red-600/20' : 'border-light-gray focus:ring-primary/20'}`}
                                        type="date"
                                    />
                                    <span className="material-symbols-outlined absolute right-4 top-4 text-medium-gray pointer-events-none">calendar_today</span>
                                </div>
                                {formErrors.birthDate && <p className="text-red-600 text-xs pl-1">{formErrors.birthDate}</p>}
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold tracking-tight text-dark-gray">Interests <span className="text-red-600">*</span></h3>
                                <span className="text-xs font-medium text-medium-gray bg-light-gray/50 px-2 py-1 rounded-md">{selectedInterests.length} selected</span>
                            </div>
                            {formErrors.interests && <p className="text-red-600 text-xs pl-1">{formErrors.interests}</p>}
                            <div className={`flex flex-wrap gap-2 transition-all rounded-xl ${formErrors.interests ? 'border-2 border-red-600 p-2' : ''}`}>
                                {AVAILABLE_INTERESTS.map((interest) => {
                                    const isSelected = selectedInterests.includes(interest);
                                    return (
                                        <div
                                            key={interest}
                                            onClick={() => {
                                                if (isSelected) {
                                                    const newInterests = selectedInterests.filter(i => i !== interest);
                                                    setSelectedInterests(newInterests);
                                                    if (newInterests.length === 0) {
                                                        setFormErrors(prev => ({ ...prev, interests: "Select at least 1 interest" }));
                                                    }
                                                } else {
                                                    setSelectedInterests(prev => {
                                                        const newInterests = [...prev, interest];
                                                        setFormErrors(errs => {
                                                            const newErrs = { ...errs };
                                                            delete newErrs.interests;
                                                            return newErrs;
                                                        });
                                                        return newInterests;
                                                    });
                                                }
                                            }}
                                            className={`px-5 py-2.5 rounded-full text-sm font-semibold border shadow-sm cursor-pointer transition-all ${isSelected
                                                ? 'bg-primary border-primary text-white shadow-primary/20'
                                                : 'border-light-gray bg-white text-medium-gray hover:bg-accent-blue/40'
                                                }`}
                                        >
                                            {interest}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-2 pt-4">
                            <label className="text-xs font-bold text-medium-gray uppercase tracking-wider pl-1">About myself</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-white border border-border-light rounded-3xl p-4 text-base text-dark-gray focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-medium-gray/50"
                                placeholder="Describe your ideal date or event vibe..."
                                rows="4"
                            ></textarea>
                            <p className="text-right text-[10px] text-medium-gray font-medium uppercase tracking-widest px-2">{bio.length} / 250</p>
                        </div>

                        {!isProfileComplete && (
                            <div className={`bg-gray-50 rounded-2xl p-4 border mt-4 ${formErrors.legal ? 'border-2 border-red-600' : 'border-border-light'}`}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <div className="relative flex items-center mt-1">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={legalAgreed}
                                            onChange={(e) => {
                                                setLegalAgreed(e.target.checked);
                                                if (!e.target.checked) {
                                                    setFormErrors(prev => ({ ...prev, legal: "You must agree to the Terms & Privacy Policy" }));
                                                } else {
                                                    setFormErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.legal;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                        />
                                        <div className="w-5 h-5 border-2 border-medium-gray rounded peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                                            <span className="material-symbols-outlined text-white text-[16px] opacity-0 peer-checked:opacity-100">check</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${formErrors.legal ? 'text-red-600' : 'text-text-main'}`}>
                                            I agree to the <Link to="/terms" target="_blank" className="text-primary underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>. <span className="text-red-600">*</span>
                                        </p>
                                    </div>
                                </label>
                                {formErrors.legal && <p className="text-red-600 text-xs mt-1 pl-8">{formErrors.legal}</p>}
                            </div>
                        )}
                    </section>
                </main>

                {/* Footer - Sticky/Static at Bottom */}
                <div className="shrink-0 max-w-[430px] mx-auto w-full px-6 py-4 bg-white border-t border-border-light z-10">
                    <button
                        onClick={handleSave}
                        disabled={saving || Object.keys(formErrors).length > 0 || !isDirty}
                        className="w-full bg-primary hover:brightness-105 active:scale-[0.98] text-white font-bold h-14 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none bg-gray-400"
                    >
                        {saving ? (
                            <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <><span className="material-symbols-outlined">check_circle</span> Save Profile</>
                        )}
                    </button>
                </div>

                {/* Image Adjustment Modal */}
                {croppingFile && previewUrl && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in duration-200">
                            <h3 className="text-xl font-bold text-text-dark mb-4">Adjust Photo</h3>
                            <p className="text-sm text-medium-gray mb-6 text-center">Drag the image to adjust position</p>

                            <div
                                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-move border-2 border-primary/20 shadow-inner mb-6"
                                onMouseDown={handleModalMouseDown}
                                onTouchStart={handleModalMouseDown}
                                onMouseMove={handleModalMouseMove}
                                onTouchMove={handleModalMouseMove}
                                onMouseUp={handleModalMouseUp}
                                onMouseLeave={handleModalMouseUp}
                                onTouchEnd={handleModalMouseUp}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-no-repeat"
                                    style={{
                                        backgroundImage: `url('${previewUrl}')`,
                                        backgroundPosition: `${tempPosition.x}% ${tempPosition.y}%`
                                    }}
                                ></div>
                                {/* Grid/Guides Overlay */}
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
                                    <div className="border-r-2 border-b-2 border-white/80"></div>
                                    <div className="border-r-2 border-b-2 border-white/80"></div>
                                    <div className="border-b-2 border-white/80"></div>
                                    <div className="border-r-2 border-b-2 border-white/80"></div>
                                    <div className="border-r-2 border-b-2 border-white/80"></div>
                                    <div className="border-b-2 border-white/80"></div>
                                    <div className="border-r-2 border-white/80"></div>
                                    <div className="border-r-2 border-white/80"></div>
                                    <div></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={handleCancelUpload}
                                    className="w-full py-3 bg-gray-100 text-text-dark font-bold rounded-2xl active:scale-[0.98] transition-all hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmUpload}
                                    className="w-full py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary-dark"
                                >
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditProfile;
