// Utility: Persist and retrieve per-NFT metadata (category, edition, royalty)
// Stored in localStorage under "nft_meta_<tokenId>"

export const NFT_META_KEY = (tokenId) => `nft_meta_${tokenId}`;

/**
 * Save category, editionType, royalty, unlockableContent, mimeType for a minted tokenId.
 */
export function saveNftMeta(tokenId, { category, editionType, royalty, unlockableContent, mimeType }) {
    try {
        const entry = { category: category || "", editionType: editionType || "1-of-1", royalty: royalty ?? 10, unlockableContent: unlockableContent || "", mimeType: mimeType || "" };
        localStorage.setItem(NFT_META_KEY(tokenId), JSON.stringify(entry));
    } catch (_) { }
}

/**
 * Load metadata for a tokenId. Returns null if not found.
 */
export function loadNftMeta(tokenId) {
    try {
        const raw = localStorage.getItem(NFT_META_KEY(tokenId));
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
}

// Canonical categories list (used in CreateNFT and display components)
export const CATEGORIES = [
    { label: "🎨 Art", value: "art" },
    { label: "📷 Photography", value: "photography" },
    { label: "🎵 Music", value: "music" },
    { label: "🎮 Gaming", value: "gaming" },
    { label: "🌐 Virtual Worlds", value: "virtual-worlds" },
    { label: "⚽ Sports", value: "sports" },
    { label: "🃏 Collectibles", value: "collectibles" },
    { label: "🤖 AI Generated", value: "ai" },
    { label: "📜 Certificates", value: "certificates" },
];

export function getCategoryLabel(value) {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
}
