import React, { useMemo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, CircularProgress, Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Web3 from "web3";
import { useStyles } from "./styles";
import { api } from "../../services/api";
import { ReactComponent as EthereumLogo } from "../../assets/ethereum_logo.svg";

/**
 * Computes live collection stats from real Redux NFT data.
 * @param {string} collectionId - the collection's ID string key
 * @param {Array}  nfts         - all loaded NFTs from Redux state
 */
function computeCollectionStats(collectionId, nfts) {
    const items = nfts.filter((n) => n.collectionId === collectionId);
    const forSaleItems = items.filter((n) => n.isForSale && n.price && n.price !== "0");

    const owners = new Set(items.map((n) => n.owner?.toLowerCase()).filter(Boolean)).size;

    const prices = forSaleItems.map((n) =>
        parseFloat(Web3.utils.fromWei(String(n.price), "ether"))
    );
    const floorPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // Volume = sum of all sold items' prices in this collection
    const soldItems = items.filter((n) => n.isSold && n.price && n.price !== "0");
    const volume24h = soldItems.reduce((sum, n) => {
        return sum + parseFloat(Web3.utils.fromWei(String(n.price), "ether"));
    }, 0);

    return { items: items.length, owners, floorPrice, volume24h };
}

const Stats = () => {
    const classes = useStyles();
    const history = useHistory();
    const nfts = useSelector((state) => state.allNft.nft) || [];

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const account = useSelector((state) => state.allNft.account);

    // Fetch collections list from backend
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await api.get("/collections");
                setCollections(res.data);
            } catch (e) {
                console.error("Failed to fetch collections:", e);
                setError("Could not load collections from the server.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Compute live stats for each collection and sort by volume
    const ranked = useMemo(() => {
        return collections
            .map((col) => ({
                ...col,
                ...computeCollectionStats(col.id, nfts),
            }))
            .sort((a, b) => b.volume24h - a.volume24h);
    }, [collections, nfts]);

    // Your collections
    const myCollections = useMemo(() => {
        if (!account) return [];
        return ranked.filter(c => c.owner && c.owner.toLowerCase() === account.toLowerCase());
    }, [ranked, account]);

    return (
        <div className={classes.root}>
            <div className={classes.headerWrapper} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <Typography variant="h1" className={classes.pageTitle}>
                        Top Collections
                    </Typography>
                    <Typography className={classes.pageSubtitle}>
                        The top NFT collections on Galerie, ranked by trading volume and floor price.
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => history.push("/create-collection")}
                    style={{ borderRadius: 10, fontWeight: 700, padding: "10px 20px", flexShrink: 0, marginTop: "0.25rem" }}
                >
                    New Collection
                </Button>
            </div>

            {loading && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
                    <CircularProgress color="primary" />
                </div>
            )}

            {error && (
                <Typography align="center" color="error" style={{ marginTop: "2rem" }}>
                    {error}
                </Typography>
            )}

            {!loading && !error && nfts.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--glass-bg)", borderRadius: 16, border: "1px solid var(--glass-bg)" }}>
                    <Typography variant="h5" style={{ marginBottom: "1rem" }}>📡 Connection Required</Typography>
                    <Typography style={{ opacity: 0.6, marginBottom: "2rem" }}>
                        It looks like the blockchain data wasn't loaded (usually happens if you refresh this page directly).
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => history.push("/")}>
                        Go to Home to Connect Web3
                    </Button>
                </div>
            )}

            {!loading && !error && nfts.length > 0 && (
                <>
                    <TableContainer component={Paper} className={classes.tableContainer} elevation={0}>
                        <Table className={classes.table} aria-label="top collections leaderboard">
                            <TableHead className={classes.tableHead}>
                                <TableRow>
                                    <TableCell className={classes.headCell} style={{ width: "5%" }}>#</TableCell>
                                    <TableCell className={classes.headCell} style={{ width: "40%" }}>Collection</TableCell>
                                    <TableCell className={classes.headCell} align="right">Volume</TableCell>
                                    <TableCell className={classes.headCell} align="right">Floor Price</TableCell>
                                    <TableCell className={classes.headCell} align="right">Items</TableCell>
                                    <TableCell className={classes.headCell} align="right">Owners</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ranked.map((col, index) => (
                                    <TableRow
                                        key={col.id}
                                        className={classes.tableRow}
                                        onClick={() => history.push(`/collection/${col.id}`)}
                                    >
                                        <TableCell className={`${classes.bodyCell} ${classes.rankCell}`}>
                                            {index + 1}
                                        </TableCell>

                                        <TableCell className={classes.bodyCell}>
                                            <div className={classes.collectionInfo}>
                                                <Avatar
                                                    src={col.logoImage}
                                                    alt={col.name}
                                                    className={classes.avatar}
                                                    variant="square"
                                                />
                                                <span className={classes.collectionName}>{col.name}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className={classes.bodyCell} align="right">
                                            <div className={classes.ethPrice} style={{ justifyContent: "flex-end" }}>
                                                {col.volume24h > 0 && <EthereumLogo style={{ width: 12, height: 12 }} />}
                                                {col.volume24h > 0 ? col.volume24h.toFixed(4) : "—"}
                                            </div>
                                        </TableCell>

                                        <TableCell className={classes.bodyCell} align="right">
                                            <div className={classes.ethPrice} style={{ justifyContent: "flex-end" }}>
                                                {col.floorPrice > 0 ? (
                                                    <>
                                                        <EthereumLogo style={{ width: 12, height: 12 }} />
                                                        {col.floorPrice.toFixed(4)}
                                                    </>
                                                ) : "—"}
                                            </div>
                                        </TableCell>

                                        <TableCell className={classes.bodyCell} align="right">
                                            {col.items || "—"}
                                        </TableCell>

                                        <TableCell className={classes.bodyCell} align="right">
                                            {col.owners || "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {ranked.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" style={{ padding: "3rem", opacity: 0.5 }}>
                                            No collections found. Mint an NFT and assign it to a collection to see stats here!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Your Collections Section */}
                    {myCollections.length > 0 && (
                        <div style={{ marginTop: "4rem" }}>
                            <Typography variant="h2" className={classes.pageTitle} style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
                                Your Collections
                            </Typography>
                            <TableContainer component={Paper} className={classes.tableContainer} elevation={0}>
                                <Table className={classes.table} aria-label="your collections">
                                    <TableHead className={classes.tableHead}>
                                        <TableRow>
                                            <TableCell className={classes.headCell} style={{ width: "45%" }}>Collection</TableCell>
                                            <TableCell className={classes.headCell} align="right">Items</TableCell>
                                            <TableCell className={classes.headCell} align="right">Volume</TableCell>
                                            <TableCell className={classes.headCell} align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {myCollections.map((col) => (
                                            <TableRow
                                                key={col.id}
                                                className={classes.tableRow}
                                                style={{ cursor: "default" }}
                                            >
                                                <TableCell className={classes.bodyCell}>
                                                    <div className={classes.collectionInfo} style={{ cursor: "pointer" }} onClick={() => history.push(`/collection/${col.id}`)}>
                                                        <Avatar src={col.logoImage} variant="square" className={classes.avatar} />
                                                        <span className={classes.collectionName}>{col.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className={classes.bodyCell} align="right">
                                                    {col.items}
                                                </TableCell>
                                                <TableCell className={classes.bodyCell} align="right">
                                                    <div className={classes.ethPrice} style={{ justifyContent: "flex-end" }}>
                                                        {col.volume24h > 0 && <EthereumLogo style={{ width: 12, height: 12 }} />}
                                                        {col.volume24h > 0 ? col.volume24h.toFixed(4) : "—"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className={classes.bodyCell} align="right">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        style={{ borderRadius: 8, textTransform: "none", marginRight: 8 }}
                                                        onClick={() => history.push(`/collection/${col.id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        style={{ borderRadius: 8, textTransform: "none" }}
                                                        onClick={() => history.push(`/edit-collection/${col.id}`)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Stats;
