import React from "react";
import { Link } from "react-router-dom";
import Web3 from "web3";

import { Card as MuiCard } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import SvgIcon from "@material-ui/core/SvgIcon";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/actions/cartActions";

import { useStyles } from "./styles.js";
import { ReactComponent as EthereumLogo } from "../../assets/ethereum_logo.svg";
import { loadNftMeta, getCategoryLabel } from "../../utils/nftMeta";
import MediaViewer from "../MediaViewer";

const EDITION_COLORS = { "1-of-1": "#7B61FF", "Limited": "#00BE7A", "Open": "#FFB547" };

const Card = ({
  tokenId,
  name,
  image,
  price,
  owner,
  saleId,
  isForSale,
  isFavorite,
  onToggleFavorite,
  account,
  isTrending,
  mimeType: mimeTypeProp,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart?.cartItems || []);
  const inCart = cartItems.some(item => item.tokenId === tokenId);

  const handleCartChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      dispatch(removeFromCart(tokenId));
    } else {
      dispatch(addToCart({ tokenId, saleId, name, image, price, owner }));
    }
  };

  const displayPrice = Web3.utils.fromWei(String(price || 0), "ether");
  const ownerLabel =
    owner && owner.length > 10 ? `${owner.slice(0, 7)}...${owner.slice(-4)}` : owner || "Unknown";

  const isOwner =
    account && owner && account.toLowerCase() === owner.toLowerCase();

  const nftMeta = loadNftMeta(tokenId);
  // Use mimeType from localStorage (set at mint time) OR from the API response (for existing NFTs)
  const resolvedMimeType = nftMeta?.mimeType || mimeTypeProp || "";

  return (
    <Link to={`/nft/${tokenId}`} style={{ textDecoration: 'none' }}>
      <MuiCard className={classes.root} elevation={0}>

        {/* ── Image Area – fixed 220px height, objectFit:cover ── */}
        <div className={classes.mediaContainer}>
          {/* Certificate lock for non-owners */}
          {nftMeta?.category === "certificates" && !isOwner ? (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              gap: "0.5rem", color: "var(--text-muted)",
              minHeight: 160,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "rgba(123,97,255,0.15)",
                border: "1px solid rgba(123,97,255,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LockOutlinedIcon style={{ fontSize: "1.5rem", color: "#7B61FF" }} />
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.65, textAlign: "center", padding: "0 0.5rem" }}>
                📜 Certificate — Owner Only
              </div>
            </div>
          ) : (
          <MediaViewer src={image} alt={name} mimeType={resolvedMimeType} />
          )}
          <div className={classes.mediaOverlay} />

          {isTrending && (
            <div style={{
              position: "absolute", top: 10, left: 10, zIndex: 3,
              background: "linear-gradient(135deg, #FF6B35 0%, #FF4D4D 100%)",
              color: "white", borderRadius: 20, padding: "3px 10px",
              fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.04em",
              boxShadow: "0 4px 16px rgba(255,77,77,0.45)",
              display: "flex", alignItems: "center", gap: "4px",
              backdropFilter: "blur(4px)", border: "1px solid var(--glass-border-hover)",
            }}>
              🔥 Hot
            </div>
          )}

          {nftMeta?.category && (
            <div style={{
              position: "absolute", top: 10, right: 10, zIndex: 3,
              background: "rgba(0,0,0,0.65)", color: "white",
              borderRadius: 8, padding: "3px 8px", fontSize: "0.68rem",
              fontWeight: 600, backdropFilter: "blur(4px)",
              border: "1px solid var(--glass-bg-active)", fontFamily: "'Inter', sans-serif",
              maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {getCategoryLabel(nftMeta.category)}
            </div>
          )}

          {nftMeta?.editionType && nftMeta.editionType !== "1-of-1" && (
            <div style={{
              position: "absolute", bottom: 10, left: 10, zIndex: 3,
              background: `${EDITION_COLORS[nftMeta.editionType] || "#7B61FF"}dd`,
              color: "white", borderRadius: 8, padding: "3px 8px",
              fontSize: "0.68rem", fontWeight: 700, backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border-hover)", fontFamily: "'Inter', sans-serif",
            }}>
              {nftMeta.editionType}
            </div>
          )}
        </div>

        {/* ── Content Area – fills remaining height via flex ── */}
        <div className={classes.content}>
          {/* Top: title + badges */}
          <div>
            <div className={classes.titleWrapper}>
              <Typography className={classes.title} title={name}>
                {name}
              </Typography>
              <div className={classes.badgesContainer}>
                {isOwner && (
                  <Tooltip title="You own this NFT">
                    <Chip
                      size="small"
                      icon={<VerifiedUserIcon style={{ fontSize: "0.8rem", color: "inherit" }} />}
                      label="Yours"
                      className={classes.yoursBadge}
                    />
                  </Tooltip>
                )}
                <Chip
                  size="small"
                  label={isForSale ? "For sale" : "Not for sale"}
                  className={isForSale ? classes.badge : classes.notForSaleBadge}
                />
                {onToggleFavorite && (
                  <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                    <IconButton
                      size="small"
                      className={classes.favoriteButton}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(tokenId); }}
                    >
                      {isFavorite
                        ? <FavoriteIcon style={{ color: "#FF4D4D", fontSize: "1rem" }} />
                        : <FavoriteBorderIcon style={{ fontSize: "1rem", opacity: 0.6 }} />
                      }
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className={classes.priceContainer} style={{ marginTop: "0.5rem" }}>
              <SvgIcon component={EthereumLogo} viewBox="0 0 400 426.6" style={{ fontSize: "1rem" }} />
              <span className={classes.priceValue}>{isForSale ? displayPrice : "—"}</span>
            </div>
          </div>

          {/* Bottom: owner + cart button */}
          <div>
            <Divider className={classes.divider} light />
            <div className={classes.sellerContainer}>
              <div>
                <div className={classes.sellerLabel}>Owned By</div>
                <div className={classes.sellerAddress}>{ownerLabel}</div>
              </div>
              {isForSale && !isOwner && (
                <Button
                  className={inCart ? classes.actionButtonOutlined : classes.actionButton}
                  onClick={handleCartChange}
                  size="small"
                >
                  {inCart ? "In Cart" : "Add to Cart"}
                </Button>
              )}
            </div>
          </div>
        </div>

      </MuiCard>
    </Link>
  );
};

export default Card;
