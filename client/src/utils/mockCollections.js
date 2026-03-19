// Mock Data Service for "Real World" Collection Stats
// This simulates statistical aggregations normally handled by a backend indexer (like The Graph)

export const mockCollections = [
    {
        id: "galerie-originals",
        name: "Galerie Originals",
        description: "The premier founding collection of abstract and digital masterful representations minted exclusively on Galerie.",
        bannerImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop",
        logoImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
        volume24h: 14.5,
        volumeTotal: 345.2,
        percentChange24h: 12.4,
        floorPrice: 0.15,
        owners: 124,
        items: 500,
        categoryName: "Art", // Maps to existing NFT category for filtering
    },
    {
        id: "moba-legends",
        name: "MOBA Legends",
        description: "Official avatars, items, and legendary gear from the hit MOBA. True ownership of your in-game assets.",
        bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        logoImage: "https://images.unsplash.com/photo-1546561892-65bf811416b9?q=80&w=2070&auto=format&fit=crop",
        volume24h: 42.1,
        volumeTotal: 1205.8,
        percentChange24h: 45.2,
        floorPrice: 0.05,
        owners: 840,
        items: 2500,
        categoryName: "Gaming",
    },
    {
        id: "cyber-punks",
        name: "Cyber Punks 2077",
        description: "10,000 uniquely generated cyberpunk avatars roaming the neon-drenched streets of the meta-city.",
        bannerImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2070&auto=format&fit=crop",
        logoImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop",
        volume24h: 5.2,
        volumeTotal: 880.1,
        percentChange24h: -4.3,
        floorPrice: 0.8,
        owners: 4200,
        items: 10000,
        categoryName: "Collectibles",
    },
    {
        id: "lens-of-nature",
        name: "Lens of Nature",
        description: "Award-winning photography capturing the raw, unfiltered beauty of planet Earth. 1-of-1 editions.",
        bannerImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop",
        logoImage: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=2574&auto=format&fit=crop",
        volume24h: 2.1,
        volumeTotal: 45.5,
        percentChange24h: 0.5,
        floorPrice: 1.5,
        owners: 32,
        items: 100,
        categoryName: "Photography",
    },
    {
        id: "galerie-sports",
        name: "Galerie Sports Moments",
        description: "Legendary moments in sports history forever immortalized on the blockchain as exclusive video and photo NFTs.",
        bannerImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
        logoImage: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop",
        volume24h: 8.9,
        volumeTotal: 210.4,
        percentChange24h: 21.8,
        floorPrice: 0.3,
        owners: 512,
        items: 1200,
        categoryName: "Sports",
    }
];

export const getCollectionById = (id) => {
    return mockCollections.find((c) => c.id === id);
};

export const getSortedCollectionsByVolume = () => {
    // Returns a new sorted array from highest 24h volume to lowest
    return [...mockCollections].sort((a, b) => b.volume24h - a.volume24h);
};
