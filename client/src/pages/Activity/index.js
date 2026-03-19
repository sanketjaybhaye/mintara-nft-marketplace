import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import { makeStyles } from "@material-ui/core/styles";

import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import CancelIcon from "@material-ui/icons/Cancel";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import SwapHorizIcon from "@material-ui/icons/SwapHoriz";
import FilterListIcon from "@material-ui/icons/FilterList";

export const ACTIVITY_KEY = "nft_activity";

/** Call this from buy/sell/cancel/mint handlers to log an event */
export function logActivity(type, details) {
    try {
        const existing = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
        const entry = {
            id: Date.now(),
            type,        // "mint" | "list" | "buy" | "cancel" | "price_update"
            timestamp: new Date().toISOString(),
            ...details,  // { name, tokenId, price, from, to }
        };
        const updated = [entry, ...existing].slice(0, 100); // keep last 100
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
    } catch (_) { }
}

const ACTION_CONFIG = {
    mint: { label: "Minted", color: "#7B61FF", Icon: AddCircleIcon },
    list: { label: "Listed", color: "#00BE7A", Icon: LocalOfferIcon },
    buy: { label: "Sold", color: "#FFB547", Icon: ShoppingCartIcon },
    cancel: { label: "Cancelled", color: "#FF4D4D", Icon: CancelIcon },
    price_update: { label: "Price Updated", color: "#4DB6FF", Icon: SwapHorizIcon },
};

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "mint", label: "Minted" },
    { key: "list", label: "Listed" },
    { key: "buy", label: "Sold" },
    { key: "cancel", label: "Cancelled" },
    { key: "price_update", label: "Price Updated" },
];

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 820,
        margin: "0 auto",
        padding: "2rem",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1rem",
    },
    title: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: "1.8rem",
    },
    clearBtn: {
        background: "none",
        border: "1px solid var(--glass-border-hover)",
        color: "inherit",
        borderRadius: 8,
        padding: "6px 16px",
        cursor: "pointer",
        fontSize: "0.85rem",
        opacity: 0.7,
        "&:hover": { opacity: 1 },
    },
    filterBar: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
        padding: "0.75rem 1rem",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-bg-hover)",
        borderRadius: 12,
        alignItems: "center",
    },
    filterIcon: {
        opacity: 0.4,
        fontSize: "1rem",
        marginRight: "0.25rem",
    },
    filterChip: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontWeight: 600,
        fontSize: "0.78rem",
    },
    timeline: {
        position: "relative",
        paddingLeft: "2rem",
        "&::before": {
            content: '""',
            position: "absolute",
            left: "0.6rem",
            top: 0,
            bottom: 0,
            width: 2,
            background: "var(--glass-bg-hover)",
        },
    },
    entry: {
        position: "relative",
        marginBottom: "1.2rem",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-bg-hover)",
        backdropFilter: "blur(12px)",
        borderRadius: 12,
        padding: "1rem 1.2rem",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateX(4px)" },
    },
    dot: {
        position: "absolute",
        left: "-2.05rem",
        top: "1.25rem",
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: "2px solid currentColor",
        background: "#0a0a0a",
    },
    entryRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        flexWrap: "wrap",
    },
    time: {
        fontSize: "0.75rem",
        opacity: 0.5,
        marginTop: "0.3rem",
    },
    empty: {
        textAlign: "center",
        opacity: 0.4,
        marginTop: "5rem",
    },
}));

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const Activity = () => {
    const classes = useStyles();
    const [events, setEvents] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");

    const load = () => {
        try {
            setEvents(JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]"));
        } catch (_) { setEvents([]); }
    };

    useEffect(() => {
        load();
        // refresh every 5 seconds in case another tab triggers an action
        const id = setInterval(load, 5000);
        return () => clearInterval(id);
    }, []);

    const clearAll = () => {
        localStorage.removeItem(ACTIVITY_KEY);
        setEvents([]);
    };

    const filteredEvents = activeFilter === "all"
        ? events
        : events.filter((ev) => ev.type === activeFilter);

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <Typography className={classes.title}>Activity Feed</Typography>
                {events.length > 0 && (
                    <button className={classes.clearBtn} onClick={clearAll}>Clear all</button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className={classes.filterBar}>
                <FilterListIcon className={classes.filterIcon} />
                {FILTER_TABS.map((tab) => {
                    const count = tab.key === "all" ? events.length : events.filter((e) => e.type === tab.key).length;
                    const cfg = tab.key === "all" ? null : ACTION_CONFIG[tab.key];
                    const isActive = activeFilter === tab.key;
                    return (
                        <Chip
                            key={tab.key}
                            label={`${tab.label}${count > 0 ? ` (${count})` : ""}`}
                            size="small"
                            className={classes.filterChip}
                            onClick={() => setActiveFilter(tab.key)}
                            style={{
                                background: isActive
                                    ? `${cfg ? cfg.color : "#7B61FF"}33`
                                    : "var(--glass-bg)",
                                color: isActive ? (cfg ? cfg.color : "#7B61FF") : "inherit",
                                border: isActive
                                    ? `1px solid ${cfg ? cfg.color : "#7B61FF"}66`
                                    : "1px solid var(--glass-border)",
                            }}
                        />
                    );
                })}
            </div>

            {filteredEvents.length === 0 ? (
                <div className={classes.empty}>
                    <Typography variant="h6">
                        {events.length === 0 ? "No activity yet" : `No "${FILTER_TABS.find(t => t.key === activeFilter)?.label}" events`}
                    </Typography>
                    <Typography variant="body2" style={{ marginTop: "0.5rem" }}>
                        {events.length === 0 ? "Mint, buy, sell, or cancel an NFT to see events here." : "Try selecting a different filter."}
                    </Typography>
                </div>
            ) : (
                <div className={classes.timeline}>
                    {filteredEvents.map((ev) => {
                        const cfg = ACTION_CONFIG[ev.type] || ACTION_CONFIG.mint;
                        const { label, color, Icon } = cfg;
                        return (
                            <div key={ev.id} className={classes.entry}>
                                <div
                                    className={classes.dot}
                                    style={{ borderColor: color }}
                                />
                                <div className={classes.entryRow}>
                                    <Icon style={{ color, fontSize: "1.1rem" }} />
                                    <Chip
                                        label={label}
                                        size="small"
                                        style={{
                                            background: `${color}22`,
                                            color,
                                            border: `1px solid ${color}55`,
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                        }}
                                    />
                                    {ev.tokenId ? (
                                        <Link to={`/nft/${ev.tokenId}`} style={{ color: "#7B61FF", fontWeight: 600 }}>
                                            {ev.name || `NFT #${ev.tokenId}`}
                                        </Link>
                                    ) : (
                                        <strong>{ev.name || "Unknown NFT"}</strong>
                                    )}
                                    {ev.price && (
                                        <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                                            — {ev.price} ETH
                                        </span>
                                    )}
                                    {ev.to && (
                                        <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>
                                            → {ev.to.slice(0, 7)}...{ev.to.slice(-4)}
                                        </span>
                                    )}
                                </div>
                                <div className={classes.time}>{timeAgo(ev.timestamp)}</div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Activity;
