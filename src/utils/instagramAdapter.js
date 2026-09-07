/**
 * Normalizes Instagram API post objects into Krishna Musicals product shape.
 */
export const transformInstagramPostToProduct = (post) => {
    const rawCaption = post.caption || "Showroom Instrument Demo";

    // Extract a clean title from the first sentence or first 50 chars of caption
    const firstLine = rawCaption.split("\n")[0].replace(/[#@][\w.-]+/g, "").trim();
    const title = firstLine.length > 5 ? firstLine.slice(0, 60) : "Showroom Collection Instrument";

    // Pick high-res media (image, album cover, or video thumbnail)
    const imageUrl = post.mediaUrl || post.thumbnailUrl || "/images/placeholder-instrument.jpg";

    return {
        _id: `ig-${post.id}`,
        name: title,
        category: "Other Instruments",
        brand: "Krishna Musicals Showroom",
        description: rawCaption,
        price: 0, // Triggers "Price on Request" or "Enquire on WhatsApp"
        stock: 1,
        status: "active",
        isInstagram: true,
        instagramUrl: post.permalink || "https://www.instagram.com",
        images: [
            {
                url: imageUrl,
                alt: title,
                isPrimary: true,
            },
        ],
        averageRating: 5,
        numReviews: 1,
        createdAt: post.timestamp || new Date().toISOString(),
    };
};