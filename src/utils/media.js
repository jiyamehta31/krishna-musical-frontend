export const getOptimizedImageUrl = (url, { width = 800, quality = "auto" } = {}) => {
    if (!url) return "/images/placeholder-instrument.png";

    // If it's already a full HTTP/HTTPS URL (Cloudinary, external CDN, etc.)
    if (url.startsWith("http://") || url.startsWith("https://")) {
        if (url.includes("res.cloudinary.com")) {
            const uploadIndex = url.indexOf("/upload/");
            if (uploadIndex !== -1) {
                const prefix = url.substring(0, uploadIndex + 8);
                const suffix = url.substring(uploadIndex + 8);
                return `${prefix}f_auto,q_${quality},w_${width},c_limit/${suffix}`;
            }
        }
        return url;
    }

    // Handle local legacy uploads or relative paths
    const backendHost = import.meta.env.VITE_SERVER_URL || "https://krishna-musical-backend-1.onrender.com";
    const cleanHost = backendHost.endsWith("/") ? backendHost.slice(0, -1) : backendHost;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;

    return `${cleanHost}${cleanPath}`;
};

export const getPrimaryImage = (images = []) => {
    if (!images || images.length === 0) return null;
    const primary = images.find((img) => img.isPrimary);
    return primary || images[0];
};