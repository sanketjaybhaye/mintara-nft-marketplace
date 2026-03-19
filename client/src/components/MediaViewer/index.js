import React from "react";
import { resolveIpfs } from "../../utils/ipfs";

const getFileTypeFromMime = (mimeType) => {
    if (!mimeType) return null;
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "document";
    if (mimeType.startsWith("image/")) return "image";
    return null;
};

const getFileTypeFromUrl = (url) => {
    if (!url) return null;
    // Get extension from URL
    const extensionMatch = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : "";

    if (["mp4", "webm"].includes(extension)) return "video";
    if (["mp3", "wav", "aac", "flac", "m4a"].includes(extension)) return "audio";
    if (["pdf"].includes(extension)) return "document";
    // Default to image if we can't tell
    return "image";
};

const MediaViewer = ({ src, alt, style, className, type, mimeType }) => {
    const resolvedSrc = resolveIpfs(src);
    // Priority: explicit type prop > mimeType prop > URL extension detection
    const fileType = type || getFileTypeFromMime(mimeType) || getFileTypeFromUrl(resolvedSrc);

    if (!resolvedSrc) return null;

    if (fileType === "video") {
        return (
            <video
                src={resolvedSrc}
                className={className}
                style={{ ...style, maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
                autoPlay
                loop
                muted
                playsInline
            />
        );
    }

    if (fileType === "audio") {
        return (
            <div
                className={className}
                style={{
                    ...style,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--glass-bg)",
                    padding: "1rem",
                    gap: "0.75rem",
                }}
            >
                {/* Music note icon */}
                <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(123,97,255,0.25), rgba(123,97,255,0.1))",
                    border: "2px solid rgba(123,97,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.8rem",
                }}>
                    🎵
                </div>
                <audio controls src={resolvedSrc} style={{ width: "100%", maxWidth: 280 }} />
            </div>
        );
    }

    if (fileType === "document") {
        return (
            <div
                className={className}
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    borderRadius: style?.borderRadius ?? "inherit",
                    overflow: "hidden",
                    background: "#1e1e24",
                    ...style,
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", color: "#fff", opacity: 0.8 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>PDF Document</span>
                </div>
            </div>
        );
    }

    // Default to image fallback
    return <img src={resolvedSrc} alt={alt || "Media"} className={className} style={{ ...style, objectFit: "cover" }} />;
};

export default MediaViewer;
