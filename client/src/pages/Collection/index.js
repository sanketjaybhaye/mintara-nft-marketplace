import React, { useMemo, useEffect, useState, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Typography, Grid, Button, CircularProgress, Tooltip, IconButton, FormControl, Select, MenuItem
} from "@material-ui/core";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import EditIcon from "@material-ui/icons/Edit";
import ShareIcon from "@material-ui/icons/Share";
import AddIcon from "@material-ui/icons/Add";
import LanguageIcon from "@material-ui/icons/Language";
import TwitterIcon from "@material-ui/icons/Twitter";
import FilterListIcon from "@material-ui/icons/FilterList";
import Web3 from "web3";
import { ReactComponent as EthereumLogo } from "../../assets/ethereum_logo.svg";

import Card from "../../components/Card";
import { useFavorites } from "../../hooks/useFavorites";
import { api } from "../../services/api";
import { useStyles } from "./styles";
import { resolveIpfs } from "../../utils/ipfs";

// ── Discord icon (no MUI icon for this) ──────────────────────────────────────
const DiscordIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

// ── Category colour map ───────────────────────────────────────────────────────
const CATEGORY_COLORS = {
    Art: "#FF6B6B",
    Gaming: "#7B61FF",
    Photography: "#00BE7A",
    Music: "#FFB547",
    Sports: "#4DC8FF",
    Collectibles: "#FF88D0",
    Utility: "#A0A0A0",
    Other: "#7B61FF",
};

const SORT_OPTIONS = [
    { value: "default", label: "Default" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
    { value: "newest", label: "Newest First" },
];

const CollectionDetail = () => {
    const classes = useStyles();
    const { id } = useParams();
    const history = useHistory();

    const account = useSelector((state) => state.allNft.account);
    const nftItem = useSelector((state) => state.allNft.nft) || [];
    const { isFavorite, toggleFavorite } = useFavorites();

    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("items"); // "items" | "activity"
    const [sort, setSort] = useState("default");
    const [forSaleOnly, setForSaleOnly] = useState(false);
    const [snackbar, setSnackbar] = useState(false);

    // Fetch collection metadata
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await api.get(`/collections/${id}`);
                setCollection(res.data);
            } catch (e) {
                console.error("Failed to fetch collection:", e);
                setError("Collection not found.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    // All NFTs belonging to this collection
    const collectionNfts = useMemo(() =>
        nftItem.filter((n) => n.collectionId === id),
        [nftItem, id]
    );

    // Sorted + filtered NFTs for the Items tab
    const displayNfts = useMemo(() => {
        let list = forSaleOnly
            ? collectionNfts.filter((n) => n.isForSale && n.price && n.price !== "0")
            : [...collectionNfts];

        if (sort === "price_asc") {
            list.sort((a, b) => {
                const pa = a.price ? parseFloat(Web3.utils.fromWei(String(a.price), "ether")) : Infinity;
                const pb = b.price ? parseFloat(Web3.utils.fromWei(String(b.price), "ether")) : Infinity;
                return pa - pb;
            });
        } else if (sort === "price_desc") {
            list.sort((a, b) => {
                const pa = a.price ? parseFloat(Web3.utils.fromWei(String(a.price), "ether")) : -Infinity;
                const pb = b.price ? parseFloat(Web3.utils.fromWei(String(b.price), "ether")) : -Infinity;
                return pb - pa;
            });
        } else if (sort === "newest") {
            list.sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
        }
        return list;
    }, [collectionNfts, sort, forSaleOnly]);

    // Sold NFTs for the Activity tab
    const activityItems = useMemo(() =>
        collectionNfts
            .filter((n) => n.isSold && n.price && n.price !== "0")
            .sort((a, b) => Number(b.tokenId) - Number(a.tokenId)),
        [collectionNfts]
    );

    // Live stats
    const stats = useMemo(() => {
        const owners = new Set(
            collectionNfts.map((n) => n.owner?.toLowerCase()).filter(Boolean)
        ).size;
        const forSale = collectionNfts.filter((n) => n.isForSale && n.price && n.price !== "0");
        const prices = forSale.map((n) => parseFloat(Web3.utils.fromWei(String(n.price), "ether")));
        const floorPrice = prices.length > 0 ? Math.min(...prices) : null;
        const soldItems = collectionNfts.filter((n) => n.isSold && n.price && n.price !== "0");
        const totalVolume = soldItems.reduce((sum, n) =>
            sum + parseFloat(Web3.utils.fromWei(String(n.price), "ether")), 0);
        return { owners, floorPrice, totalVolume, items: collectionNfts.length, forSale: forSale.length };
    }, [collectionNfts]);

    // Check if current account is the collection owner
    const isOwner = useMemo(() =>
        account && collection?.owner &&
        account.toLowerCase() === collection.owner.toLowerCase(),
        [account, collection]
    );

    // Determines if the current user can mint into this collection
    const canMint = useMemo(() => {
        if (!collection) return false;
        if (collection.isCore) return true; // anyone can mint to core
        return isOwner; // only owner can mint to non-core
    }, [collection, isOwner]);

    // Follower system (localStorage based)
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        const followed = JSON.parse(localStorage.getItem(`follow_${id}`) || "{}");
        if (followed[account]) setIsFollowing(true);

        const counts = JSON.parse(localStorage.getItem("followerCounts") || "{}");
        // Random base follower count + actual followers
        const baseFollowers = parseInt(id.replace(/\D/g, '').slice(0, 3) || '142', 10);
        setFollowerCount(baseFollowers + (counts[id] || 0));
    }, [id, account]);

    const handleFollow = () => {
        if (!account) return alert("Please connect wallet to follow collections.");
        const followed = JSON.parse(localStorage.getItem(`follow_${id}`) || "{}");
        const counts = JSON.parse(localStorage.getItem("followerCounts") || "{}");

        let newCount = counts[id] || 0;
        if (isFollowing) {
            delete followed[account];
            newCount = Math.max(0, newCount - 1);
            setIsFollowing(false);
        } else {
            followed[account] = true;
            newCount += 1;
            setIsFollowing(true);
        }

        localStorage.setItem(`follow_${id}`, JSON.stringify(followed));
        counts[id] = newCount;
        localStorage.setItem("followerCounts", JSON.stringify(counts));

        const baseFollowers = parseInt(id.replace(/\D/g, '').slice(0, 3) || '142', 10);
        setFollowerCount(baseFollowers + newCount);
    };

    // Share handler
    const handleShare = useCallback(() => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setSnackbar(true);
            setTimeout(() => setSnackbar(false), 3000);
        });
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (error || !collection) {
        return (
            <div style={{ textAlign: "center", padding: "5rem" }}>
                <Typography variant="h4">{error || "Collection Not Found"}</Typography>
                <Button
                    variant="contained" color="primary"
                    style={{ marginTop: "2rem" }}
                    onClick={() => history.push("/stats")}
                >
                    Back to Collections
                </Button>
            </div>
        );
    }

    const catColor = CATEGORY_COLORS[collection.category] || "#7B61FF";

    return (
        <div className={classes.root}>
            {/* Hero Banner */}
            <div
                className={classes.banner}
                style={{ backgroundImage: `url(${resolveIpfs(collection.bannerImage)})` }}
            />

            {/* Profile Header */}
            <div className={classes.headerContainer}>
                <img src={resolveIpfs(collection.logoImage)} alt={collection.name} className={classes.logo} />

                {/* Category Badge */}
                {collection.category && (
                    <span className={classes.categoryChip} style={{ color: catColor, borderColor: `${catColor}55`, background: `${catColor}18` }}>
                        {collection.category}
                    </span>
                )}

                {/* Title row */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                    <Typography variant="h1" className={classes.title}>
                        {collection.name}
                        {collection.isVerified && (
                            <Tooltip title="Verified Collection">
                                <VerifiedUserIcon className={classes.verifiedIcon} />
                            </Tooltip>
                        )}
                    </Typography>
                </div>

                {/* Owner address */}
                {collection.owner && (
                    <Typography style={{ fontSize: "0.85rem", fontFamily: "monospace", opacity: 0.5, marginBottom: "0.75rem" }}>
                        By {collection.owner.slice(0, 6)}...{collection.owner.slice(-4)}
                    </Typography>
                )}

                {/* Description */}
                <Typography className={classes.description}>
                    {collection.description}
                </Typography>

                {/* Social links */}
                {(collection.websiteUrl || collection.twitterUrl || collection.discordUrl) && (
                    <div className={classes.socialRow}>
                        {collection.websiteUrl && (
                            <a href={collection.websiteUrl} target="_blank" rel="noopener noreferrer" className={classes.socialLink}>
                                <LanguageIcon style={{ fontSize: "1rem" }} />
                                Website
                            </a>
                        )}
                        {collection.twitterUrl && (
                            <a href={collection.twitterUrl} target="_blank" rel="noopener noreferrer" className={classes.socialLink}>
                                <TwitterIcon style={{ fontSize: "1rem" }} />
                                Twitter
                            </a>
                        )}
                        {collection.discordUrl && (
                            <a href={collection.discordUrl} target="_blank" rel="noopener noreferrer" className={classes.socialLink}>
                                <DiscordIcon />
                                Discord
                            </a>
                        )}
                    </div>
                )}

                {/* Action buttons row (share always visible; edit+mint for owner only) */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
                    <Tooltip title={isFollowing ? "Unfollow" : "Follow Collection"}>
                        <Button
                            variant={isFollowing ? "outlined" : "contained"}
                            size="small"
                            onClick={handleFollow}
                            style={{
                                background: isFollowing ? "transparent" : "rgba(255,255,255,1)",
                                color: isFollowing ? "#fff" : "#000",
                                borderColor: isFollowing ? "var(--glass-border-hover)" : "transparent",
                                borderRadius: 8, textTransform: "none", fontSize: "0.82rem", fontWeight: 700
                            }}
                        >
                            {isFollowing ? "Following" : "Follow"} • {followerCount}
                        </Button>
                    </Tooltip>

                    <Tooltip title="Copy link to clipboard">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ShareIcon style={{ fontSize: "0.95rem" }} />}
                            onClick={handleShare}
                            style={{ borderRadius: 8, textTransform: "none", fontSize: "0.82rem" }}
                        >
                            Share
                        </Button>
                    </Tooltip>

                    {isOwner && (
                        <>
                            <Tooltip title="Edit this collection">
                                <IconButton
                                    size="small"
                                    onClick={() => history.push(`/edit-collection/${id}`)}
                                    style={{
                                        background: "rgba(123,97,255,0.12)",
                                        border: "1px solid rgba(123,97,255,0.3)",
                                        color: "#7B61FF",
                                    }}
                                >
                                    <EditIcon style={{ fontSize: "1.1rem" }} />
                                </IconButton>
                            </Tooltip>

                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => history.push(`/create-nft?collectionId=${id}`)}
                                style={{ borderRadius: 8, textTransform: "none", padding: "5px 14px", fontSize: "0.82rem" }}
                            >
                                Mint NFT
                            </Button>
                        </>
                    )}
                </div>

                {/* Live Statistics Bar */}
                <div className={classes.statsContainer}>
                    <div className={classes.statBox}>
                        <span className={classes.statValue}>{stats.items}</span>
                        <span className={classes.statLabel}>Items</span>
                    </div>
                    <div className={classes.statBox}>
                        <span className={classes.statValue}>{stats.forSale}</span>
                        <span className={classes.statLabel}>For Sale</span>
                    </div>
                    <div className={classes.statBox}>
                        <span className={classes.statValue}>{stats.owners}</span>
                        <span className={classes.statLabel}>Owners</span>
                    </div>
                    <div className={classes.statBox}>
                        <span className={classes.statValue}>
                            {stats.floorPrice != null ? (
                                <>
                                    <EthereumLogo className={classes.ethIcon} />
                                    {stats.floorPrice.toFixed(4)}
                                </>
                            ) : "—"}
                        </span>
                        <span className={classes.statLabel}>Floor Price</span>
                    </div>
                    <div className={classes.statBox}>
                        <span className={classes.statValue}>
                            {stats.totalVolume > 0 ? (
                                <>
                                    <EthereumLogo className={classes.ethIcon} />
                                    {stats.totalVolume.toFixed(4)}
                                </>
                            ) : "—"}
                        </span>
                        <span className={classes.statLabel}>Total Volume</span>
                    </div>
                </div>
            </div>

            {/* ── Content Grid ── */}
            <div className={classes.gridContainer}>

                {/* Tabs */}
                <div className={classes.tabsRow}>
                    <button
                        className={`${classes.tabBtn} ${activeTab === "items" ? classes.tabBtnActive : ""}`}
                        onClick={() => setActiveTab("items")}
                    >
                        Items ({collectionNfts.length})
                    </button>
                    <button
                        className={`${classes.tabBtn} ${activeTab === "activity" ? classes.tabBtnActive : ""}`}
                        onClick={() => setActiveTab("activity")}
                    >
                        Activity ({activityItems.length})
                    </button>
                </div>

                {/* Items tab */}
                {activeTab === "items" && (
                    <>
                        {/* Filter / sort bar */}
                        <div className={classes.filterBar}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--glass-bg)", padding: "4px 12px", borderRadius: "12px", border: "1px solid var(--glass-bg-hover)" }}>
                                <FilterListIcon style={{ opacity: 0.5, fontSize: "1.1rem" }} />
                                <FormControl size="small" variant="outlined" style={{ minWidth: 150 }}>
                                    <Select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        displayEmpty
                                        className={classes.filterSelect}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    backgroundColor: "rgba(20, 20, 30, 0.95)",
                                                    backdropFilter: "blur(10px)",
                                                    border: "1px solid var(--glass-border)",
                                                    color: "#fff"
                                                }
                                            }
                                        }}
                                        disableUnderline
                                        IconComponent={() => null}
                                    >
                                        {SORT_OPTIONS.map((o) => (
                                            <MenuItem key={o.value} value={o.value} style={{ fontSize: "0.85rem", fontFamily: "'Inter', sans-serif" }}>
                                                {o.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>

                            <button
                                className={`${classes.filterChip} ${forSaleOnly ? classes.filterChipActive : ""}`}
                                onClick={() => setForSaleOnly((v) => !v)}
                            >
                                🏷️ For Sale Only
                            </button>

                            <Typography variant="body2" style={{ opacity: 0.5, marginLeft: "auto", fontWeight: 600 }}>
                                {displayNfts.length} item{displayNfts.length !== 1 ? "s" : ""}
                            </Typography>
                        </div>

                        {displayNfts.length > 0 ? (
                            <Grid container spacing={3}>
                                {displayNfts.map((nft) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={nft.tokenId}>
                                        <Card
                                            {...nft}
                                            account={account}
                                            isFavorite={isFavorite(nft.tokenId)}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                                <Typography style={{ opacity: 0.45, marginBottom: "1rem" }}>
                                    {forSaleOnly
                                        ? "No NFTs are currently listed for sale in this collection."
                                        : "No NFTs have been assigned to this collection yet."}
                                </Typography>
                                {isOwner && !forSaleOnly && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => history.push(`/create-nft?collectionId=${id}`)}
                                    >
                                        Mint an NFT to this Collection
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Activity tab */}
                {activeTab === "activity" && (
                    activityItems.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                            <table className={classes.activityTable}>
                                <thead>
                                    <tr>
                                        <th className={classes.activityTh}>Token ID</th>
                                        <th className={classes.activityTh}>Name</th>
                                        <th className={classes.activityTh}>Price (ETH)</th>
                                        <th className={classes.activityTh}>Owner</th>
                                        <th className={classes.activityTh}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityItems.map((nft) => (
                                        <tr
                                            key={nft.tokenId}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => history.push(`/nft/${nft.tokenId}`)}
                                        >
                                            <td className={classes.activityTd}>
                                                <span style={{ fontFamily: "monospace", fontSize: "0.82rem", opacity: 0.7 }}>
                                                    #{nft.tokenId}
                                                </span>
                                            </td>
                                            <td className={classes.activityTd}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                    {nft.image && (
                                                        <img
                                                            src={resolveIpfs(nft.image)}
                                                            alt={nft.name}
                                                            style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
                                                        />
                                                    )}
                                                    {nft.name || `NFT #${nft.tokenId}`}
                                                </div>
                                            </td>
                                            <td className={classes.activityTd}>
                                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                                                    <EthereumLogo className={classes.ethIcon} style={{ height: 20, width: 14 }} />
                                                    {parseFloat(Web3.utils.fromWei(String(nft.price), "ether")).toFixed(4)}
                                                </span>
                                            </td>
                                            <td className={classes.activityTd}>
                                                <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                                    {nft.owner
                                                        ? `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`
                                                        : "—"}
                                                </span>
                                            </td>
                                            <td className={classes.activityTd}>
                                                <span style={{
                                                    padding: "2px 10px", borderRadius: 20, fontSize: "0.76rem", fontWeight: 700,
                                                    background: "rgba(255,75,75,0.12)", color: "#FF4D4D", border: "1px solid rgba(255,75,75,0.25)"
                                                }}>
                                                    Sold
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                            <Typography style={{ opacity: 0.45 }}>
                                No sales recorded for this collection yet.
                            </Typography>
                        </div>
                    )
                )}
            </div>

            {/* Share snackbar */}
            {snackbar && (
                <div className={classes.snackbar}>
                    ✓ Link copied to clipboard!
                </div>
            )}
        </div>
    );
};

export default CollectionDetail;
