const avatarGlob = import.meta.glob('../assets/avatars/*.jpg', { eager: true });
const avatarMap = {};
const avatarIds = [];

// Populate map and ID list
Object.keys(avatarGlob).forEach(path => {
    // Extract filename as ID (e.g., 'uifaces-human-avatar (1).jpg')
    const id = path.split('/').pop();
    avatarMap[id] = avatarGlob[path].default;
    avatarIds.push(id);
});

console.log('Loaded Avatar IDs:', avatarIds);

/**
 * Returns the resolved URL for a given avatar ID.
 * @param {string} id - The avatar ID (filename).
 * @returns {string} - The URL of the avatar image.
 */
export const getAvatarUrl = (id) => {
    return avatarMap[id] || '';
};

/**
 * Returns a deterministic avatar ID based on the provided seed (usually UID).
 * @param {string} seed - The unique identifier to select the avatar.
 * @returns {string} - The avatar ID.
 */
export const getAvatarId = (seed) => {
    if (!avatarIds.length) return '';

    let hash = 0;
    if (seed) {
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
    }

    // Ensure positive index
    const index = Math.abs(hash) % avatarIds.length;
    return avatarIds[index];
};

/**
 * Returns a random avatar ID from the collection.
 * @returns {string} - The avatar ID.
 */
export const getRandomAvatarId = () => {
    if (!avatarIds.length) return '';
    const index = Math.floor(Math.random() * avatarIds.length);
    return avatarIds[index];
};

// Deprecated: Kept for backward compatibility during migration, but should assume input is seed
export const getAvatar = (seed) => {
    const id = getAvatarId(seed);
    return getAvatarUrl(id);
};

export const getRandomAvatar = () => {
    const id = getRandomAvatarId();
    return getAvatarUrl(id);
};
