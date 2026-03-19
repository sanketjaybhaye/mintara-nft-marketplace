import React from "react";
import { useSelector } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";

import Card from "../../components/Card";
import { useFavorites } from "../../hooks/useFavorites";

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2rem",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "2rem",
        padding: "1.2rem 1.8rem",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-bg-hover)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
    },
    title: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: "1.8rem",
    },
    count: {
        marginLeft: "auto",
        opacity: 0.55,
        fontSize: "0.95rem",
    },
    empty: {
        textAlign: "center",
        marginTop: "5rem",
        opacity: 0.45,
    },
    emptyIcon: {
        fontSize: "4rem",
        color: "#FF4D4D",
        display: "block",
        margin: "0 auto 1rem",
    },
}));

const Favorites = () => {
    const classes = useStyles();
    const { favorites, isFavorite, toggleFavorite } = useFavorites();
    const allNfts = useSelector((state) => state.allNft.nft) || [];
    const account = useSelector((state) => state.allNft.account);

    const favoriteNfts = allNfts.filter((nft) =>
        favorites.includes(String(nft.tokenId))
    );

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <FavoriteIcon style={{ color: "#FF4D4D", fontSize: "1.6rem" }} />
                <Typography className={classes.title}>My Favorites</Typography>
                <Typography className={classes.count}>
                    {favoriteNfts.length} NFT{favoriteNfts.length !== 1 ? "s" : ""}
                </Typography>
            </div>

            {favoriteNfts.length === 0 ? (
                <div className={classes.empty}>
                    <FavoriteIcon className={classes.emptyIcon} />
                    <Typography variant="h6">No favorites yet</Typography>
                    <Typography variant="body2" style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                        Click the ♥ on any NFT card to save it here.
                    </Typography>
                    <Button variant="contained" color="primary" component={Link} to="/">
                        Browse Marketplace
                    </Button>
                </div>
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    {favoriteNfts.map((nft) => (
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
        </div>
    );
};

export default Favorites;
