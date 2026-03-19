import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Slider from "@material-ui/core/Slider";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import ViewModuleIcon from "@material-ui/icons/ViewModule";
import ViewListIcon from "@material-ui/icons/ViewList";
import SvgIcon from "@material-ui/core/SvgIcon";
import Web3 from "web3";
import { ReactComponent as EthereumLogo } from "../../assets/ethereum_logo.svg";

import getWeb3 from "../../utils/getWeb3";
import { api } from "../../services/api";

import ArtMarketplace from "../../contracts/ArtMarketplace.json";
import ArtToken from "../../contracts/ArtToken.json";

import {
  setNft,
  setAccount,
  setTokenContract,
  setMarketContract,
} from "../../redux/actions/nftActions";
import Card from "../../components/Card";
import { useFavorites } from "../../hooks/useFavorites";
import MediaViewer from "../../components/MediaViewer";

import { useStyles } from "./styles.js";

import veterans from "../../assets/arts/Sparse-Ahmed-Mostafa-vetarans-2.jpg";
import lionKing from "../../assets/arts/suresh-pydikondala-lion.jpg";
import dreaming from "../../assets/arts/phuongvp-maybe-i-m-dreaming-by-pvpgk-deggyli.jpg";
import modeling3d from "../../assets/arts/alan-linssen-alanlinssen-kitbashkitrender2.jpg";
import woman from "../../assets/arts/ashline-sketch-brushes-3-2.jpg";
import stones from "../../assets/arts/rentao_-22-10-.jpg";
import wale from "../../assets/arts/luzhan-liu-1-1500.jpg";
import comic from "../../assets/arts/daniel-taylor-black-and-white-2019-2.jpg";
import galerie from "../../assets/galerie.svg";


const StatCard = ({ label, value, color }) => (
  <div style={{
    flex: "1 1 160px",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "1.2rem 1.5rem",
    textAlign: "center",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${color}44`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
  >
    <div style={{ fontSize: "2rem", fontWeight: 700, color, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: "0.8rem", opacity: 0.65, marginTop: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
  </div>
);

const Home = () => {
  const classes = useStyles();
  const account = useSelector((state) => state.allNft.account);
  const nft = useSelector((state) => state.allNft.nft);
  const dispatch = useDispatch();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [filterMode, setFilterMode] = useState("all");
  const [sortMode, setSortMode] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [visibleCount, setVisibleCount] = useState(8);

  const nftItem = useSelector((state) => state.allNft.nft);

  const priceBounds = useMemo(() => {
    const items = nftItem || [];
    const prices = items
      .filter((item) => item.isForSale && item.price && item.price !== "0")
      .map((item) =>
        Number(Web3.utils.fromWei(String(item.price || 0), "ether"))
      );

    if (!prices.length) return { min: 0, max: 0 };

    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [nftItem]);

  const [priceRange, setPriceRange] = useState([0, 0]);

  useEffect(() => {
    setVisibleCount(8);
  }, [filterMode, sortMode, searchQuery, priceRange]);

  useEffect(() => {
    if (priceBounds.max === 0 && priceBounds.min === 0) {
      setPriceRange([0, 0]);
    } else {
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
  }, [priceBounds.min, priceBounds.max]);

  // Live stats derived from nftItem
  const stats = useMemo(() => {
    const items = nftItem || [];
    const totalNfts = items.length;
    const forSale = items.filter((i) => i.isForSale).length;
    const sold = items.filter((i) => i.isSold).length;
    const owners = new Set(items.map((i) => i.owner?.toLowerCase()).filter(Boolean)).size;
    return { totalNfts, forSale, sold, owners };
  }, [nftItem]);

  // Top 3 for-sale NFTs by price → trending
  const trendingIds = useMemo(() => {
    const forSaleItems = (nftItem || []).filter((i) => i.isForSale && i.price && i.price !== "0");
    forSaleItems.sort((a, b) => Number(b.price) - Number(a.price));
    return new Set(forSaleItems.slice(0, 3).map((i) => i.tokenId));
  }, [nftItem]);

  // Top creators ranked by minted count
  const topCreators = useMemo(() => {
    const map = {};
    (nftItem || []).forEach((item) => {
      if (!item.creator) return;
      const addr = item.creator.toLowerCase();
      if (!map[addr]) map[addr] = { address: item.creator, minted: 0, forSale: 0, sold: 0 };
      map[addr].minted += 1;
      if (item.isForSale) map[addr].forSale += 1;
      if (item.isSold) map[addr].sold += 1;
    });
    return Object.values(map).sort((a, b) => b.minted - a.minted).slice(0, 8);
  }, [nftItem]);

  useEffect(() => {
    let itemsList = [];
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();

        if (typeof accounts === undefined) {
          alert("Please login with Metamask!");
        }

        const networkId = await web3.eth.net.getId();
        try {
          const artTokenContract = new web3.eth.Contract(
            ArtToken.abi,
            ArtToken.networks[networkId].address
          );
          const marketplaceContract = new web3.eth.Contract(
            ArtMarketplace.abi,
            ArtMarketplace.networks[networkId].address
          );
          const totalSupply = await artTokenContract.methods.totalSupply().call();
          const totalItemsForSale = await marketplaceContract.methods.totalItemsForSale().call();

          for (var tokenId = 1; tokenId <= totalSupply; tokenId++) {
            let item = await artTokenContract.methods.Items(tokenId).call();
            let owner = await artTokenContract.methods.ownerOf(tokenId).call();
            const response = await api.get(`/tokens/${tokenId}`).catch((err) => {
              console.log("Err: ", err);
            });

            itemsList.push({
              name: response.data.name,
              description: response.data.description,
              image: response.data.image,
              mimeType: response.data.mimeType || "",
              collectionId: response.data.collectionId || null,
              tokenId: item.id,
              creator: item.creator,
              owner: owner,
              uri: item.uri,
              isForSale: false,
              saleId: null,
              price: 0,
              isSold: null,
            });
          }

          if (totalItemsForSale > 0) {
            for (var saleId = 0; saleId < totalItemsForSale; saleId++) {
              let item = await marketplaceContract.methods.itemsForSale(saleId).call();
              let active = await marketplaceContract.methods.activeItems(item.tokenId).call();
              let itemListIndex = itemsList.findIndex((i) => i.tokenId === item.tokenId);
              itemsList[itemListIndex] = {
                ...itemsList[itemListIndex],
                isForSale: active,
                saleId: item.id,
                price: item.price,
                isSold: item.isSold,
              };
            }
          }

          dispatch(setAccount(accounts[0]));
          dispatch(setTokenContract(artTokenContract));
          dispatch(setMarketContract(marketplaceContract));
          dispatch(setNft(itemsList));
        } catch (error) {
          console.error("Error", error);
          alert("Contracts not deployed to the current network " + networkId.toString());
        }
      } catch (error) {
        alert(`Failed to load web3, accounts, or contract. Check console for details.` + error);
        console.error(error);
      }
    };
    init();
  }, [dispatch]);

  const visibleItems = useMemo(() => {
    let items = nftItem || [];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    if (filterMode === "forSale") {
      items = items.filter((item) => item.isForSale);
    } else if (filterMode === "sold") {
      items = items.filter((item) => item.isSold);
    } else if (filterMode === "notForSale") {
      items = items.filter((item) => !item.isForSale && !item.isSold);
    }

    if (priceBounds.max > 0 || priceBounds.min > 0) {
      const [minPrice, maxPrice] = priceRange;
      items = items.filter((item) => {
        const priceEth = Number(Web3.utils.fromWei(String(item.price || 0), "ether"));
        if (!item.isForSale) return true;
        return priceEth >= minPrice && priceEth <= maxPrice;
      });
    }

    const sorted = [...items];
    if (sortMode === "newest") {
      sorted.sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
    } else if (sortMode === "priceLowHigh") {
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortMode === "priceHighLow") {
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return sorted;
  }, [nftItem, filterMode, sortMode, searchQuery, priceRange, priceBounds]);

  const paginatedItems = visibleItems.slice(0, visibleCount);

  return (
    <div className={classes.homepage}>
      <section className={classes.banner}>
        <Grid container spacing={0} xs={12} className={classes.gridBanner}>
          <Grid item xs={3}>
            <Grid container spacing={2}>
              <Grid item xs={7}>
                <div className={classes.imageWrapper} style={{ height: "240px" }}>
                  <img src={dreaming} alt="dreaming" className={classes.images} />
                </div>
              </Grid>
              <Grid item xs={5}>
                <div className={classes.imageWrapper} style={{ height: "240px" }}>
                  <img src={veterans} alt="veterans" className={classes.images} />
                </div>
              </Grid>
              <Grid item xs={5}>
                <div className={classes.imageWrapper} style={{ height: "180px" }}>
                  <img src={modeling3d} alt="modeling3d" className={classes.images} />
                </div>
              </Grid>
              <Grid item xs={7}>
                <div className={classes.imageWrapper} style={{ height: "180px" }}>
                  <img src={lionKing} alt="lionKing" className={classes.images} />
                </div>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={6} className={classes.main}>
            <img src={galerie} alt="galerie" />
            <Typography>A decentralized NFT marketplace where you can expose your art.</Typography>
            <Link to="/create-nft">
              <Button variant="contained" color="primary" disableElevation>
                Mint your art
              </Button>
            </Link>
          </Grid>

          <Grid item xs={3}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <div className={classes.imageWrapper} style={{ height: "180px" }}>
                  <img src={stones} alt="stones" className={classes.images} />
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className={classes.imageWrapper} style={{ height: "180px" }}>
                  <img src={woman} alt="woman" className={classes.images} />
                </div>
              </Grid>
              <Grid item xs={8}>
                <div className={classes.imageWrapper} style={{ height: "240px" }}>
                  <img src={wale} alt="wale" className={classes.images} />
                </div>
              </Grid>
              <Grid item xs={4}>
                <div className={classes.imageWrapper} style={{ height: "240px" }}>
                  <img src={comic} alt="comic" className={classes.images} />
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ padding: "0 2rem 2rem 2rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <StatCard label="Total NFTs" value={stats.totalNfts} color="#7B61FF" />
          <StatCard label="For Sale" value={stats.forSale} color="#00BE7A" />
          <StatCard label="Sold" value={stats.sold} color="#FF4D4D" />
          <StatCard label="Unique Owners" value={stats.owners} color="#FFB547" />
        </div>
      </section>

      {/* ── Top Creators Leaderboard ── */}
      {topCreators.length > 0 && (
        <section style={{ padding: "0 2rem 2.5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <Typography style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.4rem" }}>🏆 Top Creators</Typography>
          </div>
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            {topCreators.map((creator, i) => {
              const hue = parseInt(creator.address.slice(2, 8), 16) % 360;
              const short = `${creator.address.slice(0, 6)}...${creator.address.slice(-4)}`;
              return (
                <Link key={creator.address} to={`/creator/${creator.address}`} style={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}>
                  <div style={{
                    minWidth: 150,
                    padding: "1rem",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-bg-hover)",
                    borderRadius: 16,
                    textAlign: "center",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(123,97,255,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    {/* Rank badge */}
                    <div style={{ position: "relative", display: "inline-block", marginBottom: "0.5rem" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${(hue + 60) % 360},70%,45%))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.2rem", fontWeight: 700, color: "white",
                        margin: "0 auto",
                        boxShadow: `0 4px 16px hsla(${hue},70%,50%,0.4)`,
                      }}>
                        {creator.address.slice(2, 4).toUpperCase()}
                      </div>
                      {i < 3 && (
                        <div style={{
                          position: "absolute", bottom: -2, right: -2,
                          background: ["#FFD700", "#C0C0C0", "#CD7F32"][i],
                          color: "#000", borderRadius: "50%",
                          width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.65rem", fontWeight: 900, border: "1px solid rgba(0,0,0,0.2)",
                        }}>#{i + 1}</div>
                      )}
                    </div>
                    <Typography variant="caption" style={{ fontFamily: "monospace", display: "block", opacity: 0.55, fontSize: "0.7rem" }}>{short}</Typography>
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.68rem", background: "rgba(123,97,255,0.15)", color: "#7B61FF", borderRadius: 6, padding: "2px 6px" }}>{creator.minted} minted</span>
                      {creator.forSale > 0 && <span style={{ fontSize: "0.68rem", background: "rgba(0,190,122,0.15)", color: "#00BE7A", borderRadius: 6, padding: "2px 6px" }}>{creator.forSale} for sale</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className={classes.allNfts}>
        <div className={`${classes.controlsRow} glass`}>
          <Typography className={classes.title}>Marketplace</Typography>
          <div className={classes.controlsRight}>
            {/* Search bar */}
            <TextField
              id="nft-search"
              placeholder="Search NFTs…"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" style={{ opacity: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />

            <ButtonGroup color="primary" variant="outlined" size="small">
              <Button
                onClick={() => setFilterMode("all")}
                color={filterMode === "all" ? "primary" : "default"}
              >
                All items
              </Button>
              <Button
                onClick={() => setFilterMode("forSale")}
                color={filterMode === "forSale" ? "primary" : "default"}
              >
                For sale
              </Button>
              <Button
                onClick={() => setFilterMode("sold")}
                color={filterMode === "sold" ? "primary" : "default"}
              >
                Sold
              </Button>
              <Button
                onClick={() => setFilterMode("notForSale")}
                color={filterMode === "notForSale" ? "primary" : "default"}
              >
                Not for sale
              </Button>
            </ButtonGroup>

            <FormControl variant="outlined" size="small" className={classes.sortControl}>
              <InputLabel id="sort-label">Sort by</InputLabel>
              <Select
                labelId="sort-label"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                label="Sort by"
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="priceLowHigh">Price: low to high</MenuItem>
                <MenuItem value="priceHighLow">Price: high to low</MenuItem>
              </Select>
            </FormControl>

            {priceBounds.max > 0 && (
              <Box className={classes.priceFilter}>
                <Typography variant="caption" color="textSecondary">
                  Price range (ETH)
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, value) => setPriceRange(value)}
                  valueLabelDisplay="auto"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={priceBounds.max - priceBounds.min > 0 ? (priceBounds.max - priceBounds.min) / 20 : 0.01}
                />
              </Box>
            )}
          </div>
          {/* View toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto" }}>
            <Tooltip title="Grid view">
              <IconButton size="small" onClick={() => setViewMode("grid")} color={viewMode === "grid" ? "primary" : "default"}>
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="List view">
              <IconButton size="small" onClick={() => setViewMode("list")} color={viewMode === "list" ? "primary" : "default"}>
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {visibleItems.length === 0 && (
          <Typography align="center" style={{ marginTop: "3rem", opacity: 0.5 }}>
            {searchQuery ? `No NFTs found matching "${searchQuery}"` : "No NFTs found."}
          </Typography>
        )}

        {/* ── Grid View ── */}
        {viewMode === "grid" && (
          <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {paginatedItems.map((nft) => (
              <Grid item key={nft.tokenId}>
                <Card
                  {...nft}
                  account={account}
                  isFavorite={isFavorite(nft.tokenId)}
                  onToggleFavorite={toggleFavorite}
                  isTrending={trendingIds.has(nft.tokenId)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* ── List View ── */}
        {viewMode === "list" && visibleItems.length > 0 && (
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {paginatedItems.map((nft) => {
              const priceEth = Web3.utils.fromWei(String(nft.price || 0), "ether");
              const shortOwner = nft.owner ? `${nft.owner.slice(0, 7)}...${nft.owner.slice(-4)}` : "—";
              return (
                <Link key={nft.tokenId} to={`/nft/${nft.tokenId}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    padding: "0.75rem 1.25rem",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-bg-hover)",
                    borderRadius: 12,
                    transition: "background 0.2s, transform 0.2s",
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(123,97,255,0.08)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--glass-bg)"; e.currentTarget.style.transform = ""; }}
                  >
                    <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                      <MediaViewer src={nft.image} alt={nft.name} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>{nft.name}</Typography>
                      <Typography variant="caption" style={{ opacity: 0.55 }}>Owner: {shortOwner}</Typography>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {nft.isForSale ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#7B61FF", fontWeight: 700 }}>
                          <SvgIcon component={EthereumLogo} viewBox="0 0 400 426.6" style={{ fontSize: "1rem" }} />
                          {priceEth}
                        </div>
                      ) : (
                        <Typography variant="caption" style={{ opacity: 0.45 }}>Not for sale</Typography>
                      )}
                      <div style={{ marginTop: 2 }}>
                        {nft.isForSale && <span style={{ fontSize: "0.7rem", background: "#00BE7A22", color: "#00BE7A", border: "1px solid #00BE7A55", borderRadius: 6, padding: "1px 6px" }}>For Sale</span>}
                        {nft.isSold && <span style={{ fontSize: "0.7rem", background: "#FF4D4D22", color: "#FF4D4D", border: "1px solid #FF4D4D55", borderRadius: 6, padding: "1px 6px" }}>Sold</span>}
                      </div>
                    </div>
                    {account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase() && (
                      <span style={{ fontSize: "0.7rem", background: "#7B61FF22", color: "#7B61FF", border: "1px solid #7B61FF55", borderRadius: 6, padding: "2px 8px", fontWeight: 700, flexShrink: 0 }}>Yours</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {visibleCount < visibleItems.length && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem", marginBottom: "2rem" }}>
            <Button variant="outlined" color="primary" onClick={() => setVisibleCount(c => c + 8)} style={{ padding: "8px 32px", borderRadius: 24, fontWeight: 700 }}>
              Load More
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
