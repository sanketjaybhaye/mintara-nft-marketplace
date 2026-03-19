import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

import Card from "../../components/Card";
import { useFavorites } from "../../hooks/useFavorites";

const useStyles = makeStyles(() => ({
    root: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem",
    },
    profileCard: {
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.5rem 2rem",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        marginBottom: "2rem",
        flexWrap: "wrap",
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7B61FF 0%, #4D33E6 50%, #FF4D4D 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.8rem",
        fontWeight: 700,
        color: "white",
        fontFamily: "'Outfit', sans-serif",
        flexShrink: 0,
        boxShadow: "0 0 24px rgba(123,97,255,0.4)",
    },
    address: {
        fontFamily: "monospace",
        fontSize: "0.85rem",
        opacity: 0.6,
        marginTop: "0.2rem",
        wordBreak: "break-all",
    },
    statRow: {
        display: "flex",
        gap: "1rem",
        flexWrap: "wrap",
        marginTop: "0.75rem",
    },
    stat: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0.5rem 1rem",
        background: "var(--glass-bg)",
        borderRadius: 12,
        border: "1px solid var(--glass-bg-hover)",
        minWidth: 80,
    },
    statValue: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: "1.4rem",
    },
    statLabel: {
        fontSize: "0.7rem",
        opacity: 0.5,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    sectionTitle: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 600,
        fontSize: "1.2rem",
        marginBottom: "1rem",
        opacity: 0.8,
    },
    empty: {
        textAlign: "center",
        marginTop: "3rem",
        opacity: 0.4,
    },
}));

/** Generate a stable 2-char monogram from an address */
function monogram(address) {
    if (!address) return "??";
    return address.slice(2, 4).toUpperCase();
}

/** Derive a stable hue from address for personalised avatar tint */
function addressHue(address) {
    if (!address) return 240;
    const num = parseInt(address.slice(2, 8), 16);
    return num % 360;
}

const Creator = () => {
    const classes = useStyles();
    const { address } = useParams();
    const allNfts = useSelector((state) => state.allNft.nft) || [];
    const account = useSelector((state) => state.allNft.account);
    const { isFavorite, toggleFavorite } = useFavorites();

    const createdNfts = useMemo(
        () => allNfts.filter((n) => n.creator?.toLowerCase() === address?.toLowerCase()),
        [allNfts, address]
    );

    const stats = useMemo(() => {
        const minted = createdNfts.length;
        const forSale = createdNfts.filter((n) => n.isForSale).length;
        const sold = createdNfts.filter((n) => n.isSold).length;
        const isYou = account && address && account.toLowerCase() === address.toLowerCase();
        return { minted, forSale, sold, isYou };
    }, [createdNfts, account, address]);

    // NFTs owned by this address but NOT created by them
    const alsoOwnsNfts = useMemo(
        () => allNfts.filter(
            (n) =>
                n.owner?.toLowerCase() === address?.toLowerCase() &&
                n.creator?.toLowerCase() !== address?.toLowerCase()
        ),
        [allNfts, address]
    );

    const hue = addressHue(address);

    return (
        <div className={classes.root}>
            {/* Profile card */}
            <div className={classes.profileCard}>
                <div
                    className={classes.avatar}
                    style={{
                        background: `linear-gradient(135deg, hsl(${hue},70%,55%) 0%, hsl(${(hue + 60) % 360},70%,45%) 100%)`,
                    }}
                >
                    {monogram(address)}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                        <Typography variant="h5" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                            Creator
                        </Typography>
                        {stats.isYou && (
                            <Chip
                                label="You"
                                size="small"
                                style={{ background: "#7B61FF22", color: "#7B61FF", border: "1px solid #7B61FF55", fontWeight: 700 }}
                            />
                        )}
                    </div>
                    <div className={classes.address}>{address}</div>
                    <div className={classes.statRow}>
                        <div className={classes.stat}>
                            <span className={classes.statValue} style={{ color: "#7B61FF" }}>{stats.minted}</span>
                            <span className={classes.statLabel}>Minted</span>
                        </div>
                        <div className={classes.stat}>
                            <span className={classes.statValue} style={{ color: "#00BE7A" }}>{stats.forSale}</span>
                            <span className={classes.statLabel}>For Sale</span>
                        </div>
                        <div className={classes.stat}>
                            <span className={classes.statValue} style={{ color: "#FFB547" }}>{stats.sold}</span>
                            <span className={classes.statLabel}>Sold</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NFTs section */}
            <Typography className={classes.sectionTitle}>
                NFTs by this creator ({createdNfts.length})
            </Typography>

            {createdNfts.length === 0 ? (
                <div className={classes.empty}>
                    <Typography variant="h6">No NFTs found for this creator</Typography>
                    <Typography variant="body2" style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                        They haven't minted anything yet.
                    </Typography>
                    <Button variant="outlined" color="primary" component={Link} to="/">
                        Back to Marketplace
                    </Button>
                </div>
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    {createdNfts.map((nft) => (
                        <Grid item key={nft.tokenId}>
                            <Card
                                {...nft}
                                account={account}
                                isFavorite={isFavorite(nft.tokenId)}
                                onToggleFavorite={toggleFavorite}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Also Owns section */}
            {alsoOwnsNfts.length > 0 && (
                <>
                    <Typography className={classes.sectionTitle} style={{ marginTop: "2rem" }}>
                        Also owns ({alsoOwnsNfts.length})
                    </Typography>
                    <Grid container spacing={2} justifyContent="center">
                        {alsoOwnsNfts.map((nft) => (
                            <Grid item key={nft.tokenId}>
                                <Card
                                    {...nft}
                                    account={account}
                                    isFavorite={isFavorite(nft.tokenId)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </div>
    );
};

export default Creator;
