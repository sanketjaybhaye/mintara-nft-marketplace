import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import CloseIcon from "@material-ui/icons/Close";
import ShareIcon from "@material-ui/icons/Share";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import LockOpenOutlinedIcon from "@material-ui/icons/LockOpenOutlined";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import Web3 from "web3";

import { useFavorites } from "../../hooks/useFavorites";

import { selectedNft, removeSelectedNft, setNft, setAccount, setTokenContract, setMarketContract } from "../../redux/actions/nftActions";
import { logActivity } from "../Activity/index";
import { useStyles } from "./styles.js";
import getWeb3 from "../../utils/getWeb3";
import { api } from "../../services/api";
import ArtMarketplace from "../../contracts/ArtMarketplace.json";
import ArtToken from "../../contracts/ArtToken.json";
import { loadNftMeta, getCategoryLabel } from "../../utils/nftMeta";
import MediaViewer from "../../components/MediaViewer";
import { resolveIpfs } from "../../utils/ipfs";

const EDITION_COLORS = { "1-of-1": "#7B61FF", "Limited": "#00BE7A", "Open": "#FFB547" };

// Price history helpers
const PRICE_HISTORY_KEY = (tokenId) => `nft_price_history_${tokenId}`;
function logPriceHistory(tokenId, priceEth, action) {
  try {
    const existing = JSON.parse(localStorage.getItem(PRICE_HISTORY_KEY(tokenId)) || "[]");
    const updated = [{ priceEth: Number(priceEth), action, timestamp: new Date().toISOString() }, ...existing].slice(0, 20);
    localStorage.setItem(PRICE_HISTORY_KEY(tokenId), JSON.stringify(updated));
  } catch (_) { }
}
function loadPriceHistory(tokenId) {
  try { return JSON.parse(localStorage.getItem(PRICE_HISTORY_KEY(tokenId)) || "[]"); } catch (_) { return []; }
}

// Minimal SVG Sparkline
function Sparkline({ data }) {
  if (!data || data.length < 2) return null;
  const prices = data.map((d) => d.priceEth);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 200, H = 40, pad = 4;
  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (W - 2 * pad);
    const y = pad + (1 - (p - min) / range) * (H - 2 * pad);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke="#7B61FF" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {prices.map((p, i) => {
        const x = pad + (i / (prices.length - 1)) * (W - 2 * pad);
        const y = pad + (1 - (p - min) / range) * (H - 2 * pad);
        return <circle key={i} cx={x} cy={y} r={3} fill="#7B61FF" />;
      })}
    </svg>
  );
}

const SEVERITY_COLORS = {
  success: "#00BE7A",
  error: "#FF4D4D",
  warning: "#FFB547",
  info: "#4DB6FF",
};

function ToastAlert({ open, message, severity, onClose }) {
  if (!open) return null;
  const color = SEVERITY_COLORS[severity] || SEVERITY_COLORS.success;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: `${color}22`, border: `1px solid ${color}99`,
      backdropFilter: "blur(16px)", borderRadius: 12,
      padding: "12px 20px", display: "flex", alignItems: "center",
      gap: "0.75rem", zIndex: 1400, minWidth: 280, boxShadow: `0 8px 32px ${color}33`,
    }}>
      <span style={{ color, fontSize: "0.95rem", flex: 1 }}>{message}</span>
      <IconButton size="small" onClick={onClose} style={{ color, opacity: 0.7 }}>
        <CloseIcon style={{ fontSize: "1rem" }} />
      </IconButton>
    </div>
  );
}

function CopyAddress({ label, address }) {
  const [copied, setCopied] = useState(false);
  const short = address ? `${address.slice(0, 10)}...${address.slice(-6)}` : "—";

  const copy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <Typography variant="caption" style={{ opacity: 0.55, display: "block", marginBottom: 2 }}>
        {label}
      </Typography>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <Typography variant="body2" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
          {short}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy address"}>
          <IconButton size="small" onClick={copy}>
            <FileCopyIcon style={{ fontSize: "0.9rem", opacity: copied ? 1 : 0.5 }} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

const Item = () => {
  const classes = useStyles();
  const { nftId } = useParams();
  const marketplaceContract = useSelector((state) => state.allNft.marketplaceContract);
  const artTokenContract = useSelector((state) => state.allNft.artTokenContract);
  const account = useSelector((state) => state.allNft.account);
  let nft = useSelector((state) => state.nft);
  let nftItem = useSelector((state) =>
    state.allNft.nft.filter((nft) => nft.tokenId === nftId)
  );

  const { image, name, price, owner, creator, description, tokenId, saleId, isForSale, isSold, mimeType: nftMimeType } = nft;
  const resolvedImage = resolveIpfs(image);
  const dispatch = useDispatch();
  const [newPrice, setNewPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [highestOffer, setHighestOffer] = useState(null);
  const [showSecret, setShowSecret] = useState(false);
  const history = useHistory();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(tokenId);

  // Snackbar state
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // ETH → INR conversion
  const [ethToInr, setEthToInr] = useState(null);
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr")
      .then((r) => r.json())
      .then((d) => { if (d?.ethereum?.inr) setEthToInr(d.ethereum.inr); })
      .catch(() => { });
  }, []);

  // Price history
  const [priceHistory, setPriceHistory] = useState([]);
  useEffect(() => {
    if (tokenId) setPriceHistory(loadPriceHistory(tokenId));
  }, [tokenId]);

  // On-chain royalty info (fetched via getRoyaltyInfo view function)
  const [royaltyInfo, setRoyaltyInfo] = useState(null);
  useEffect(() => {
    if (!marketplaceContract || !tokenId || !isForSale || !price || price === "0") return;
    let cancelled = false;
    marketplaceContract.methods.getRoyaltyInfo(tokenId, price).call()
      .then((info) => {
        if (!cancelled) {
          setRoyaltyInfo({
            creator: info.creator,
            bps: Number(info.bps),
            royaltyEth: Web3.utils.fromWei(info.royaltyAmount, "ether"),
            sellerEth: Web3.utils.fromWei(info.sellerAmount, "ether"),
            royaltyPct: (Number(info.bps) / 100).toFixed(0),
          });
        }
      })
      .catch(() => { }); // contract not yet redeployed — silently skip
    return () => { cancelled = true; };
  }, [marketplaceContract, tokenId, isForSale, price]);

  // Fetch highest offer
  useEffect(() => {
    if (!marketplaceContract || !tokenId) return;
    let cancelled = false;
    marketplaceContract.methods.highestOffers(tokenId).call()
      .then((offer) => {
        if (!cancelled && offer && offer.active) {
          setHighestOffer({
            bidder: offer.bidder,
            priceWei: offer.price,
            priceEth: Web3.utils.fromWei(offer.price, "ether"),
          });
        }
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [marketplaceContract, tokenId]);

  // Fetch collection for this NFT
  const [collection, setCollection] = useState(null);
  useEffect(() => {
    const meta = loadNftMeta(tokenId);
    if (meta && meta.collectionId) {
      api.get(`/collections/${meta.collectionId}`)
        .then(res => setCollection(res.data))
        .catch(err => console.error("Failed to fetch NFT collection", err));
    }
  }, [tokenId]);

  const allNftItems = useSelector((state) => state.allNft.nft);

  // Self-initialize when opened directly via URL (Redux store is empty)
  useEffect(() => {
    if (allNftItems && allNftItems.length > 0) return; // already loaded by Home page
    let cancelled = false;
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const artTokenContract = new web3.eth.Contract(ArtToken.abi, ArtToken.networks[networkId].address);
        const marketplaceContract = new web3.eth.Contract(ArtMarketplace.abi, ArtMarketplace.networks[networkId].address);

        const totalSupply = await artTokenContract.methods.totalSupply().call();
        const totalItemsForSale = await marketplaceContract.methods.totalItemsForSale().call();
        let itemsList = [];

        for (let tid = 1; tid <= totalSupply; tid++) {
          const item = await artTokenContract.methods.Items(tid).call();
          const owner = await artTokenContract.methods.ownerOf(tid).call();
          const response = await api.get(`/tokens/${tid}`).catch(() => ({ data: {} }));
          itemsList.push({
            name: response.data.name,
            description: response.data.description,
            image: response.data.image,
            mimeType: response.data.mimeType || "",
            tokenId: item.id,
            creator: item.creator,
            owner,
            uri: item.uri,
            isForSale: false,
            saleId: null,
            price: 0,
            isSold: null,
          });
        }
        if (totalItemsForSale > 0) {
          for (let sid = 0; sid < totalItemsForSale; sid++) {
            const item = await marketplaceContract.methods.itemsForSale(sid).call();
            const active = await marketplaceContract.methods.activeItems(item.tokenId).call();
            const idx = itemsList.findIndex((i) => i.tokenId === item.tokenId);
            if (idx >= 0) itemsList[idx] = { ...itemsList[idx], isForSale: active, saleId: item.id, price: item.price, isSold: item.isSold };
          }
        }
        if (!cancelled) {
          dispatch(setAccount(accounts[0]));
          dispatch(setTokenContract(artTokenContract));
          dispatch(setMarketContract(marketplaceContract));
          dispatch(setNft(itemsList));
        }
      } catch (err) {
        console.error("Item page init error:", err);
      }
    };
    init();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (nftId && nftId !== "" && nftItem && nftItem.length > 0) dispatch(selectedNft(nftItem[0]));
    return () => { dispatch(removeSelectedNft()); };
  }, [nftId, nftItem.length]); // re-run when store fills up

  const isOwner = account && owner && account.toLowerCase() === owner.toLowerCase();
  const priceEth = price ? Web3.utils.fromWei(String(price), "ether") : "0";
  const priceInr = ethToInr && price && price !== "0"
    ? (Number(priceEth) * ethToInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : null;

  async function putForSale(id, priceWei) {
    try {
      // ERC-721 clears approval on every transfer, so we must re-approve the
      // marketplace before listing — this is the root cause of the "2nd listing" error.
      const marketplaceAddress = marketplaceContract.options.address;
      showSnack("Please approve the marketplace in MetaMask…", "info");
      await artTokenContract.methods.approve(marketplaceAddress, id).send({ from: account });

      await marketplaceContract.methods.putItemForSale(id, priceWei).send({ gas: 210000, from: account });
      const ethVal = Web3.utils.fromWei(priceWei, "ether");
      logActivity("list", { name, tokenId, price: ethVal });
      logPriceHistory(tokenId, ethVal, "listed");
      setPriceHistory(loadPriceHistory(tokenId));
      showSnack("NFT listed for sale! 🎉");
      setTimeout(() => history.push("/"), 1500);
    } catch (error) {
      console.error("Error putting for sale:", error);
      showSnack("Failed to list NFT for sale.", "error");
    }
  }

  async function cancelSale(saleId) {
    try {
      await marketplaceContract.methods.cancelItemSale(saleId).send({ gas: 210000, from: account });
      logActivity("cancel", { name, tokenId });
      showSnack("Sale cancelled.");
      setTimeout(() => history.push("/"), 1500);
    } catch (error) {
      console.error("Error canceling sale:", error);
      showSnack("Failed to cancel sale.", "error");
    }
  }

  async function updatePrice(saleId, priceStr) {
    if (!priceStr || isNaN(priceStr)) { showSnack("Please enter a valid price.", "warning"); return; }
    try {
      const priceWei = Web3.utils.toWei(priceStr, "ether");
      await marketplaceContract.methods.updateItemPrice(saleId, priceWei).send({ gas: 210000, from: account });
      logActivity("price_update", { name, tokenId, price: priceStr });
      logPriceHistory(tokenId, priceStr, "price updated");
      setPriceHistory(loadPriceHistory(tokenId));
      showSnack("Price updated! ✅");
      setTimeout(() => history.push("/"), 1500);
    } catch (error) {
      console.error("Error updating price:", error);
      showSnack("Failed to update price.", "error");
    }
  }

  async function buy(saleId, price) {
    try {
      await marketplaceContract.methods.buyItem(saleId).send({ gas: 210000, value: price, from: account });
      logActivity("buy", { name, tokenId, price: priceEth, to: account });
      logPriceHistory(tokenId, priceEth, "sold");
      setPriceHistory(loadPriceHistory(tokenId));
      showSnack("Purchase successful! 🎊 You now own this NFT.");
      setTimeout(() => history.push("/"), 2000);
    } catch (error) {
      console.error("Error buying:", error);
      showSnack("Failed to buy NFT.", "error");
    }
  }

  async function makeOffer(priceStr) {
    if (!priceStr || isNaN(priceStr) || Number(priceStr) <= 0) {
      showSnack("Please enter a valid offer price.", "warning"); return;
    }
    try {
      const priceWei = Web3.utils.toWei(priceStr, "ether");
      await marketplaceContract.methods.makeOffer(tokenId).send({ gas: 300000, value: priceWei, from: account });
      logActivity("offer_made", { name, tokenId, price: priceStr });
      logPriceHistory(tokenId, priceStr, "offer placed");
      setPriceHistory(loadPriceHistory(tokenId));
      showSnack("Offer placed successfully! 🎉");
      const offer = await marketplaceContract.methods.highestOffers(tokenId).call();
      if (offer && offer.active) {
        setHighestOffer({ bidder: offer.bidder, priceWei: offer.price, priceEth: Web3.utils.fromWei(offer.price, "ether") });
      }
      setOfferPrice("");
    } catch (error) {
      console.error("Error making offer:", error);
      showSnack("Failed to place offer.", "error");
    }
  }

  async function cancelOffer() {
    try {
      await marketplaceContract.methods.cancelOffer(tokenId).send({ gas: 300000, from: account });
      logActivity("offer_canceled", { name, tokenId });
      showSnack("Offer cancelled and ETH refunded! 💸");
      setHighestOffer(null);
    } catch (error) {
      console.error("Error canceling offer:", error);
      showSnack("Failed to cancel offer.", "error");
    }
  }

  async function acceptOffer() {
    try {
      showSnack("Please approve marketplace transfer...", "info");
      await artTokenContract.methods.approve(marketplaceContract.options.address, tokenId).send({ from: account });
      await marketplaceContract.methods.acceptOffer(tokenId).send({ gas: 350000, from: account });
      logActivity("offer_accepted", { name, tokenId, to: highestOffer.bidder });
      logPriceHistory(tokenId, highestOffer.priceEth, "sold via offer");
      setPriceHistory(loadPriceHistory(tokenId));
      showSnack("Offer accepted! You sold this NFT. 🎉");
      setTimeout(() => history.push("/"), 2000);
    } catch (error) {
      console.error("Error accepting offer:", error);
      showSnack("Failed to accept offer.", "error");
    }
  }

  return (
    <div className={classes.pageItem} style={{
      background: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(123,97,255,0.12) 0%, transparent 70%)",
      minHeight: "100vh",
    }}>
      {Object.keys(nft).length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5 }}>Loading…</div>
      ) : (
        <Paper component="main" elevation={0}>
          <header className={classes.pageHeader}>
            <Link to="/">
              <KeyboardBackspaceIcon fontSize="large" color="action" />
            </Link>
            <div style={{ marginLeft: "auto", marginRight: "1rem", display: "flex", gap: "0.5rem" }}>
              {/* Favorite button */}
              <Tooltip title={favorite ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                  size="small"
                  onClick={() => {
                    toggleFavorite(tokenId);
                    if (!favorite) showSnack("Added to Favorites! 💖");
                  }}
                >
                  {favorite ? (
                    <FavoriteIcon style={{ color: "#FF4D4D" }} />
                  ) : (
                    <FavoriteBorderIcon style={{ opacity: 0.7 }} />
                  )}
                </IconButton>
              </Tooltip>

              {/* Share button */}
              <Tooltip title="Share NFT">
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      showSnack("Link copied to clipboard! 🔗");
                    });
                  }}
                >
                  <ShareIcon style={{ opacity: 0.7 }} />
                </IconButton>
              </Tooltip>
            </div>
          </header>

          <section>
            <Grid container spacing={6} alignItems="flex-start" justify="center">
              {/* Left — image */}
              <Grid item md={6} sm={12} xs={12}>
                <figure style={{ margin: 0, position: "relative" }}>
                  {(() => {
                    const meta = loadNftMeta(tokenId);
                    const isCertificate = meta?.category === "certificates";

                    // Non-owner viewing a certificate: show blurred/locked preview
                    if (isCertificate && !isOwner) {
                      return (
                        <div style={{
                          position: "relative",
                          width: "100%",
                          minHeight: 340,
                          borderRadius: 12,
                          overflow: "hidden",
                          background: "#1e1e24",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {/* Lock overlay */}
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            color: "#fff",
                          }}>
                            <LockOutlinedIcon style={{ fontSize: "3rem", opacity: 0.9 }} />
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Certificate — Owner Only</div>
                              <div style={{ opacity: 0.65, fontSize: "0.85rem", marginTop: "0.3rem" }}>Only the NFT owner can view and download this certificate.</div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Owner viewing a certificate: clean PDF + custom action buttons
                    if (isCertificate && isOwner) {
                      return (
                        <div style={{ position: "relative", width: "100%" }}>
                          {/* PDF Placeholder */}
                          <div style={{
                            width: "100%", minHeight: 380, borderRadius: 12,
                            overflow: "hidden", background: "#1e1e24",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            color: "#fff", border: "1px solid rgba(255,255,255,0.1)"
                          }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 15, opacity: 0.8 }}>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span style={{ fontSize: "1.2rem", fontWeight: 600, opacity: 0.9 }}>PDF Certificate Document</span>
                            <span style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "0.5rem" }}>Click download or print to view</span>
                          </div>
                          {/* Owner actions */}
                          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <button
                              onClick={() => {
                                const win = window.open(resolvedImage);
                                if (win) setTimeout(() => win.print(), 800);
                              }}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                padding: "6px 14px",
                                background: "var(--glass-bg-hover)",
                                color: "var(--text-muted)",
                                border: "1px solid var(--glass-border-hover)",
                                borderRadius: 8, fontWeight: 600, fontSize: "0.82rem",
                                cursor: "pointer", fontFamily: "inherit",
                              }}
                            >
                              🖨 Print
                            </button>
                            <a
                              href={resolvedImage}
                              download={`${name || "certificate"}.pdf`}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                padding: "6px 16px",
                                background: "rgba(123,97,255,0.15)",
                                color: "#7B61FF",
                                border: "1px solid rgba(123,97,255,0.4)",
                                borderRadius: 8, textDecoration: "none",
                                fontWeight: 600, fontSize: "0.82rem",
                              }}
                            >
                              ⬇ Download
                            </a>
                          </div>
                        </div>
                      );
                    }

                    // Regular (non-certificate) NFT: default viewer
                    const resolvedMime = meta?.mimeType || nftMimeType || "";
                    return <MediaViewer src={resolvedImage} alt={name} mimeType={resolvedMime} className="ui fluid image" style={{ borderRadius: 12, width: "100%", objectFit: "contain", minHeight: 300 }} />;
                  })()}
                </figure>
              </Grid>

              {/* Right — details */}
              <Grid item md={6} sm={12} xs={12}>
                <div style={{ paddingTop: "0.5rem" }}>
                  {/* Title + ownership badge */}
                  {collection && (
                    <Typography
                      variant="caption"
                      component={Link}
                      to={`/collection/${collection.id}`}
                      style={{
                        color: "#7B61FF",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginBottom: "0.5rem",
                        textDecoration: "none"
                      }}
                    >
                      {collection.name}
                      {collection.isVerified && <VerifiedUserIcon style={{ fontSize: "1rem" }} />}
                    </Typography>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <Typography variant="h4" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                      {name}
                    </Typography>
                    {isOwner && (
                      <Chip
                        icon={<VerifiedUserIcon style={{ fontSize: "0.9rem" }} />}
                        label="You own this"
                        size="small"
                        style={{ background: "#7B61FF22", color: "#7B61FF", border: "1px solid #7B61FF55", fontWeight: 600 }}
                      />
                    )}
                    {isSold && !isForSale && (
                      <Chip label="Sold" size="small" style={{ background: "#FF4D4D22", color: "#FF4D4D", border: "1px solid #FF4D4D55" }} />
                    )}
                    {isForSale && (
                      <Chip label="For sale" size="small" style={{ background: "#00BE7A22", color: "#00BE7A", border: "1px solid #00BE7A55" }} />
                    )}
                  </div>

                  {/* Description */}
                  <Typography variant="body1" style={{ opacity: 0.75, marginBottom: "1.5rem", lineHeight: 1.6 }}>
                    {description}
                  </Typography>

                  {/* Price */}
                  {isForSale && (
                    <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "rgba(123,97,255,0.08)", borderRadius: 12, border: "1px solid rgba(123,97,255,0.2)" }}>
                      <Typography variant="caption" style={{ opacity: 0.6, display: "block" }}>Current Price</Typography>
                      <Typography variant="h5" style={{ fontWeight: 700, color: "#7B61FF" }}>
                        {priceEth} ETH
                      </Typography>
                      {priceInr && (
                        <Typography variant="caption" style={{ opacity: 0.55 }}>≈ ₹{priceInr} INR</Typography>
                      )}
                    </div>
                  )}

                  {/* Creator & Owner */}
                  <div style={{ padding: "1rem", background: "var(--glass-bg)", borderRadius: 12, border: "1px solid var(--glass-bg-hover)", marginBottom: "1.5rem" }}>
                    {/* Creator row with profile link */}
                    <div style={{ marginBottom: "0.6rem" }}>
                      <Typography variant="caption" style={{ opacity: 0.55, display: "block", marginBottom: 2 }}>Creator</Typography>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Link to={`/creator/${creator}`} style={{ color: "#7B61FF", fontFamily: "monospace", fontSize: "0.85rem", textDecoration: "none" }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        >
                          {creator ? `${creator.slice(0, 10)}...${creator.slice(-6)}` : "—"}
                        </Link>
                        <Tooltip title="Copy creator address">
                          <IconButton size="small" onClick={() => navigator.clipboard.writeText(creator)}>
                            <FileCopyIcon style={{ fontSize: "0.9rem", opacity: 0.5 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                    <CopyAddress label="Owner" address={owner} />
                    <div style={{ marginTop: "0.4rem" }}>
                      <Typography variant="caption" style={{ opacity: 0.55 }}>Token ID: </Typography>
                      <Typography variant="caption" style={{ fontFamily: "monospace" }}>#{tokenId}</Typography>
                    </div>
                    {/* Category / Edition / Royalty from localStorage */}
                    {(() => {
                      const meta = loadNftMeta(tokenId);
                      if (!meta) return null;
                      return (
                        <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {meta.category && (
                            <span style={{
                              fontSize: "0.72rem", padding: "2px 10px", borderRadius: 8,
                              background: "rgba(123,97,255,0.12)", color: "#7B61FF",
                              border: "1px solid rgba(123,97,255,0.3)", fontWeight: 600,
                            }}>
                              {getCategoryLabel(meta.category)}
                            </span>
                          )}
                          {meta.editionType && (
                            <span style={{
                              fontSize: "0.72rem", padding: "2px 10px", borderRadius: 8,
                              background: `${EDITION_COLORS[meta.editionType] || "#7B61FF"}18`,
                              color: EDITION_COLORS[meta.editionType] || "#7B61FF",
                              border: `1px solid ${EDITION_COLORS[meta.editionType] || "#7B61FF"}44`,
                              fontWeight: 600,
                            }}>
                              {meta.editionType} Edition
                            </span>
                          )}
                          {meta.royalty > 0 && (
                            <span style={{
                              fontSize: "0.72rem", padding: "2px 10px", borderRadius: 8,
                              background: "rgba(255,181,71,0.12)", color: "#FFB547",
                              border: "1px solid rgba(255,181,71,0.3)", fontWeight: 600,
                            }}>
                              {meta.royalty}% Royalty
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Unlockable Content (Owner Only) */}
                  {(() => {
                    const meta = loadNftMeta(tokenId);
                    if (!meta || !meta.unlockableContent) return null;
                    return (
                      <div style={{
                        padding: "1rem",
                        background: showSecret ? "rgba(123,97,255,0.08)" : "var(--glass-bg)",
                        border: showSecret ? "1px solid rgba(123,97,255,0.3)" : "1px solid var(--glass-bg-hover)",
                        borderRadius: 12,
                        marginBottom: "1.5rem",
                        transition: "all 0.3s ease"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography style={{ fontWeight: 700, fontSize: "0.9rem", color: showSecret ? "#7B61FF" : "inherit", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {showSecret ? <LockOpenOutlinedIcon fontSize="small" /> : <LockOutlinedIcon fontSize="small" />}
                            Unlockable Content
                          </Typography>
                          {isOwner && (
                            <Button
                              size="small"
                              variant={showSecret ? "text" : "outlined"}
                              color="primary"
                              onClick={() => setShowSecret(!showSecret)}
                              style={{ padding: "2px 10px", fontSize: "0.75rem", textTransform: "none" }}
                            >
                              {showSecret ? "Hide" : "Reveal Secret"}
                            </Button>
                          )}
                        </div>

                        {!isOwner ? (
                          <Typography variant="body2" style={{ opacity: 0.5, marginTop: "0.5rem", fontStyle: "italic" }}>
                            Owner exclusive content.
                          </Typography>
                        ) : showSecret ? (
                          <div style={{
                            marginTop: "1rem",
                            padding: "0.85rem",
                            background: "rgba(0,0,0,0.2)",
                            borderRadius: 8,
                            borderLeft: "3px solid #7B61FF",
                            wordBreak: "break-word",
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            color: "#E2E8F0"
                          }}>
                            {meta.unlockableContent.split('\n').map((line, i) => (
                              <React.Fragment key={i}>
                                {line}
                                {i < meta.unlockableContent.split('\n').length - 1 && <br />}
                              </React.Fragment>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {/* Owner: list for sale */}
                    {isOwner && !isForSale && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <TextField
                          label="Sale Price (ETH)"
                          variant="outlined"
                          size="small"
                          fullWidth
                          type="number"
                          value={sellPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            // Allow empty, or any string that looks like a positive decimal number (including intermediate like "0.")
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              setSellPrice(val);
                            }
                          }}
                          inputProps={{ min: 0, step: "any" }}
                        />
                        {/* Live INR conversion for sell price */}
                        {ethToInr && sellPrice && !isNaN(Number(sellPrice)) && Number(sellPrice) > 0 && (
                          <Typography variant="caption" style={{ opacity: 0.6, textAlign: "center" }}>
                            ≈ ₹{(Number(sellPrice) * ethToInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })} INR
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => putForSale(tokenId, Web3.utils.toWei(sellPrice || "0", "ether"))}
                          disabled={!sellPrice || isNaN(Number(sellPrice)) || Number(sellPrice) <= 0}
                        >
                          List for Sale
                        </Button>
                      </div>
                    )}

                    {/* Owner: update price or cancel */}
                    {isOwner && isForSale && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <TextField
                          label="New Price (ETH)"
                          variant="outlined"
                          size="small"
                          fullWidth
                          type="number"
                          value={newPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              setNewPrice(val);
                            }
                          }}
                          inputProps={{ min: 0, step: "any" }}
                        />
                        {/* Live INR conversion for new price */}
                        {ethToInr && newPrice && !isNaN(Number(newPrice)) && Number(newPrice) > 0 && (
                          <Typography variant="caption" style={{ opacity: 0.6, textAlign: "center" }}>
                            ≈ ₹{(Number(newPrice) * ethToInr).toLocaleString("en-IN", { maximumFractionDigits: 0 })} INR
                          </Typography>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => updatePrice(saleId, newPrice)}
                            disabled={!newPrice}
                          >
                            Update Price
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            onClick={() => cancelSale(saleId)}
                          >
                            Cancel Sale
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Buyer: buy */}
                    {!isOwner && isForSale && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {/* Royalty split breakdown */}
                        {royaltyInfo && royaltyInfo.bps > 0 && royaltyInfo.creator !== nft.owner && (
                          <div style={{
                            padding: "0.75rem 1rem",
                            background: "rgba(123,97,255,0.07)",
                            border: "1px solid rgba(123,97,255,0.2)",
                            borderRadius: 10,
                            fontSize: "0.8rem",
                          }}>
                            <Typography style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.4rem", opacity: 0.8 }}>
                              💸 Sale Split
                            </Typography>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ opacity: 0.55 }}>Seller receives</span>
                              <span style={{ fontWeight: 600 }}>{Number(royaltyInfo.sellerEth).toFixed(4)} ETH</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem" }}>
                              <span style={{ color: "#7B61FF", opacity: 0.9 }}>Creator royalty ({royaltyInfo.royaltyPct}%)</span>
                              <span style={{ color: "#7B61FF", fontWeight: 600 }}>{Number(royaltyInfo.royaltyEth).toFixed(4)} ETH</span>
                            </div>
                          </div>
                        )}
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                          onClick={() => buy(saleId, price)}
                          style={{ padding: "12px 0", fontSize: "1rem" }}
                        >
                          Buy for {priceEth} ETH
                          {priceInr ? ` (≈ ₹${priceInr})` : ""}
                        </Button>
                      </div>
                    )}

                    {/* Offers Section */}
                    {account && (
                      <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "rgba(0,190,122,0.06)", borderRadius: 12, border: "1px solid rgba(0,190,122,0.15)" }}>
                        <Typography variant="h6" style={{ fontWeight: 700, opacity: 0.9, fontSize: "1rem", marginBottom: "0.75rem", color: "#00BE7A" }}>
                          🤝 Bidding & Offers
                        </Typography>

                        {highestOffer ? (
                          <div style={{ marginBottom: "1rem" }}>
                            <Typography variant="body2" style={{ opacity: 0.7 }}>Current Highest Offer</Typography>
                            <Typography variant="h5" style={{ fontWeight: 700 }}>
                              {highestOffer.priceEth} ETH
                            </Typography>
                            <Typography variant="caption" style={{ fontFamily: "monospace", opacity: 0.55 }}>
                              by {highestOffer.bidder.slice(0, 8)}...{highestOffer.bidder.slice(-6)}
                            </Typography>
                          </div>
                        ) : (
                          <Typography variant="body2" style={{ opacity: 0.6, marginBottom: "1rem" }}>
                            No active offers. Be the first!
                          </Typography>
                        )}

                        {/* Owner: Accept Offer */}
                        {isOwner && highestOffer && (
                          <Button
                            variant="contained"
                            style={{ background: "#00BE7A", color: "#fff", fontWeight: 600 }}
                            fullWidth
                            onClick={acceptOffer}
                          >
                            Accept Offer {highestOffer.priceEth} ETH
                          </Button>
                        )}

                        {/* Non-owner: Make Offer / Cancel Offer */}
                        {!isOwner && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {highestOffer && highestOffer.bidder.toLowerCase() === account.toLowerCase() ? (
                              <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                onClick={cancelOffer}
                              >
                                Cancel Your Offer
                              </Button>
                            ) : (
                              <>
                                <TextField
                                  label="Offer Amount (ETH)"
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  type="number"
                                  value={offerPrice}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d*\.?\d*$/.test(val)) setOfferPrice(val);
                                  }}
                                  inputProps={{ min: 0, step: "any" }}
                                />
                                <Button
                                  variant="contained"
                                  style={{ background: "#00BE7A", color: "#fff" }}
                                  fullWidth
                                  onClick={() => makeOffer(offerPrice)}
                                  disabled={!offerPrice || (highestOffer && Number(offerPrice) <= Number(highestOffer.priceEth))}
                                >
                                  Submit Offer
                                </Button>
                                {highestOffer && offerPrice && Number(offerPrice) <= Number(highestOffer.priceEth) && (
                                  <Typography variant="caption" style={{ color: "#FF4D4D", textAlign: "center" }}>
                                    Must be higher than current offer
                                  </Typography>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Grid>
            </Grid>
          </section>

          {/* Price History Panel */}
          {priceHistory.length > 0 && (
            <section style={{ padding: "1.5rem" }}>
              <div style={{
                padding: "1.25rem",
                background: "rgba(123,97,255,0.06)",
                border: "1px solid rgba(123,97,255,0.18)",
                borderRadius: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <Typography variant="h6" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1rem" }}>
                    📈 Price History
                  </Typography>
                  <Sparkline data={[...priceHistory].reverse()} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: 180, overflowY: "auto" }}>
                  {priceHistory.map((entry, idx) => (
                    <div key={idx} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.4rem 0.75rem",
                      background: idx === 0 ? "rgba(123,97,255,0.12)" : "var(--glass-bg)",
                      borderRadius: 8,
                      border: `1px solid ${idx === 0 ? "rgba(123,97,255,0.3)" : "var(--glass-bg)"}`,
                    }}>
                      <span style={{ fontSize: "0.78rem", opacity: 0.55 }}>
                        {new Date(entry.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span style={{ fontSize: "0.78rem", background: "var(--glass-bg-hover)", borderRadius: 6, padding: "1px 6px", opacity: 0.65 }}>{entry.action}</span>
                      <span style={{ fontWeight: 700, color: "#7B61FF", fontSize: "0.9rem" }}>{entry.priceEth} ETH</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </Paper>
      )}

      {/* Toast notification */}
      <ToastAlert
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={closeSnack}
      />
    </div>
  );
};

export default Item;
