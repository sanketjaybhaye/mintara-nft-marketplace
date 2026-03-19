import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Tooltip from "@material-ui/core/Tooltip";
import Drawer from "@material-ui/core/Drawer";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import FavoriteIcon from "@material-ui/icons/Favorite";
import NotificationsIcon from "@material-ui/icons/Notifications";
import CloseIcon from "@material-ui/icons/Close";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import InfoIcon from "@material-ui/icons/Info";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import SearchIcon from "@material-ui/icons/Search";

import { useStyles } from "./styles.js";
import CartDrawer from "../CartDrawer";
import { useFavorites } from "../../hooks/useFavorites";
import logo from "../../assets/Logo.svg";
import { ACTIVITY_KEY } from "../../pages/Activity/index";
import { resolveIpfs } from "../../utils/ipfs";

const NOTIF_LAST_READ_KEY = "nft_notif_last_read";

const ACTION_COLORS = {
  mint: "#7B61FF",
  list: "#00BE7A",
  buy: "#FFB547",
  cancel: "#FF4D4D",
  price_update: "#4DB6FF",
};
const ACTION_LABELS = {
  mint: "Minted",
  list: "Listed",
  buy: "Sold",
  cancel: "Cancelled",
  price_update: "Price Updated",
};

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

const Header = ({ darkMode, setDarkMode }) => {
  const classes = useStyles();
  const history = useHistory();
  const account = useSelector((state) => state.allNft.account);
  const nftList = useSelector((state) => state.allNft.nft || []);
  const { favorites } = useFavorites();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const [cartOpen, setCartOpen] = useState(false);

  // Search logic
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { nfts: [], collections: [] };
    const q = searchQuery.toLowerCase().trim();
    
    const matchedNfts = nftList.filter(n => (n.name || "").toLowerCase().includes(q) || (n.description || "").toLowerCase().includes(q)).slice(0, 5);
    
    // Naively extract unique collections present in the loaded NFTs cache matching the query
    const colMap = new Map();
    nftList.forEach(n => {
      if (n.collectionId && n.collectionId.toLowerCase().includes(q)) {
        colMap.set(n.collectionId, n.collectionId);
      }
    });
    const matchedCols = Array.from(colMap.values()).map(id => ({ id, name: id })).slice(0, 3);
    
    return { nfts: matchedNfts, collections: matchedCols };
  }, [searchQuery, nftList]);

  // Live ETH balance
  const [balance, setBalance] = useState(null);
  useEffect(() => {
    if (!account || !window.ethereum) return;
    let cancelled = false;

    const fetchBal = async () => {
      try {
        const hexBal = await window.ethereum.request({
          method: "eth_getBalance",
          params: [account, "latest"],
        });
        if (!cancelled) {
          const wei = parseInt(hexBal, 16);
          const eth = (wei / 1e18).toFixed(4);
          setBalance(eth);
        }
      } catch (_) { }
    };

    fetchBal();
    const id = setInterval(fetchBal, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [account]);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [lastRead, setLastRead] = useState(() => Number(localStorage.getItem(NOTIF_LAST_READ_KEY) || 0));

  useEffect(() => {
    const load = () => {
      try { setEvents(JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]")); } catch (_) { }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const unreadCount = events.filter((e) => new Date(e.timestamp).getTime() > lastRead).length;

  const markAllRead = () => {
    const now = Date.now();
    localStorage.setItem(NOTIF_LAST_READ_KEY, String(now));
    setLastRead(now);
  };

  const clearSearchAndNavigate = (path) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    history.push(path);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar className={classes.header} elevation={0} color="transparent">
        <Toolbar style={{ gap: "0.25rem" }}>
          <Link to="/">
            <img src={logo} alt="Mintara" className={classes.logo} />
          </Link>
          
          {/* Global Search Bar */}
          <div className={classes.searchContainer} ref={searchRef}>
            <SearchIcon style={{ color: "var(--text-muted)", fontSize: "1.2rem", marginRight: "6px" }} />
            <input 
              type="text" 
              className={classes.searchInput} 
              placeholder="Search NFTs, collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {isSearchFocused && searchQuery && (searchResults.nfts.length > 0 || searchResults.collections.length > 0) && (
              <div className={classes.searchDropdown}>
                {searchResults.collections.length > 0 && (
                  <div>
                    <div className={classes.searchGroupHeader}>Collections</div>
                    {searchResults.collections.map(col => (
                      <div 
                        key={col.id} 
                        className={classes.searchItem} 
                        onClick={() => clearSearchAndNavigate(`/collection/${col.id}`)}
                      >
                        <Typography style={{ fontWeight: 600, fontSize: "0.85rem" }}>{col.name}</Typography>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.nfts.length > 0 && (
                  <div>
                    <div className={classes.searchGroupHeader}>NFTs</div>
                    {searchResults.nfts.map(nft => (
                      <div 
                        key={nft.tokenId} 
                        className={classes.searchItem} 
                        onClick={() => clearSearchAndNavigate(`/nft/${nft.tokenId}`)}
                      >
                        <img 
                          src={resolveIpfs(nft.image)} 
                          alt="" 
                          style={{ width: 28, height: 28, borderRadius: 6, marginRight: 10, objectFit: "cover" }} 
                        />
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                           <Typography style={{ fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nft.name}</Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isSearchFocused && searchQuery && searchResults.nfts.length === 0 && searchResults.collections.length === 0 && (
              <div className={classes.searchDropdown} style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
                No results found
              </div>
            )}
          </div>
          <div style={{ flexGrow: 1 }} />

          <Button color="inherit" component={Link} to="/my-collection" size="small">
            My Collection
          </Button>

          {/* Favorites with badge */}
          <Tooltip title="My Favorites">
            <Badge
              badgeContent={favorites.length}
              color="secondary"
              overlap="rectangular"
              style={{ marginLeft: "0.25rem" }}
            >
              <Button
                color="inherit"
                component={Link}
                to="/favorites"
                size="small"
                startIcon={<FavoriteIcon style={{ fontSize: "1rem", color: "#FF4D4D" }} />}
              >
                Favorites
              </Button>
            </Badge>
          </Tooltip>

          <Button
            color="inherit"
            component={Link}
            to="/stats"
            size="small"
            startIcon={<ShowChartIcon style={{ fontSize: "1rem", color: "#FFB547" }} />}
            style={{ marginLeft: "0.25rem" }}
          >
            Stats
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/activity"
            size="small"
            startIcon={<ShowChartIcon style={{ fontSize: "1rem" }} />}
            style={{ marginLeft: "0.25rem" }}
          >
            Activity
          </Button>

          {/* Cart Icon */}
          <Tooltip title="Shopping Cart">
            <IconButton
              size="small"
              color="inherit"
              style={{ marginLeft: "0.25rem" }}
              onClick={() => setCartOpen(true)}
            >
              <Badge badgeContent={cartItems.length} color="secondary" overlap="rectangular">
                <ShoppingCartIcon style={{ fontSize: "1.3rem" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications bell */}
          <Tooltip title="Notifications">
            <IconButton
              id="notif-bell"
              size="small"
              color="inherit"
              style={{ marginLeft: "0.25rem" }}
              onClick={() => { setNotifOpen(true); markAllRead(); }}
            >
              <Badge badgeContent={unreadCount} color="secondary" overlap="rectangular">
                <NotificationsIcon style={{ fontSize: "1.3rem" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Dark/light toggle */}
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            color="inherit"
            size="small"
            style={{ marginLeft: "0.5rem" }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {/* Wallet info */}
          <div className={classes.account}>
            <AccountBalanceWalletIcon titleAccess="Wallet" className={classes.walletIcon} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Typography variant="subtitle2" style={{ lineHeight: 1.2 }}>
                {account ? `${account.slice(0, 7)}...${account.slice(-4)}` : "—"}
              </Typography>
              {balance !== null && (
                <Typography variant="caption" style={{ opacity: 0.6, lineHeight: 1 }}>
                  {balance} ETH
                </Typography>
              )}
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />

      {/* Notifications Drawer */}
      <Drawer anchor="right" open={notifOpen} onClose={() => setNotifOpen(false)}
        PaperProps={{
          style: {
            width: 340,
            background: "rgba(15,15,20,0.97)",
            backdropFilter: "blur(24px)",
            borderLeft: "1px solid var(--glass-bg-hover)",
            padding: "1.5rem 1rem",
          }
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <Typography style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff" }}>
            🔔 Notifications
          </Typography>
          <IconButton size="small" onClick={() => setNotifOpen(false)} style={{ color: "var(--text-muted)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {events.length === 0 ? (
          <Typography style={{ opacity: 0.4, fontSize: "0.9rem", textAlign: "center", marginTop: "3rem", color: "#fff" }}>
            No activity yet. Mint, buy, or sell an NFT to see notifications here.
          </Typography>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", overflowY: "auto" }}>
            {events.slice(0, 15).map((ev) => {
              const color = ACTION_COLORS[ev.type] || "#7B61FF";
              const label = ACTION_LABELS[ev.type] || ev.type;
              const isNew = new Date(ev.timestamp).getTime() > (lastRead - 5000);
              return (
                <div key={ev.id} style={{
                  padding: "0.75rem 1rem",
                  background: isNew ? `${color}14` : "var(--glass-bg)",
                  border: `1px solid ${isNew ? color + "44" : "var(--glass-bg-hover)"}`,
                  borderRadius: 10,
                  transition: "background 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.72rem", background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 6px", fontWeight: 700 }}>{label}</span>
                    {isNew && <span style={{ fontSize: "0.65rem", background: "#7B61FF33", color: "#7B61FF", border: "1px solid #7B61FF55", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>NEW</span>}
                  </div>
                  <Typography style={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", marginTop: "0.2rem" }}>
                    {ev.name || `NFT #${ev.tokenId}`}
                    {ev.price ? ` — ${ev.price} ETH` : ""}
                  </Typography>
                  <Typography style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.1rem" }}>
                    {timeAgo(ev.timestamp)}
                  </Typography>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </React.Fragment>
  );
};

export default Header;
