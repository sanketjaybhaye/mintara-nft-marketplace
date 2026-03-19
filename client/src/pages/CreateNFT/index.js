import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Tooltip from "@material-ui/core/Tooltip";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ImageIcon from "@material-ui/icons/Image";
import DescriptionIcon from "@material-ui/icons/Description";
import MonetizationOnIcon from "@material-ui/icons/MonetizationOn";
import WhatshotIcon from "@material-ui/icons/Whatshot";

import { useStyles } from "./styles.js";
import DropZone from "../../components/DropZone";
import { api } from "../../services/api";
import { logActivity } from "../Activity/index";
import { saveNftMeta, CATEGORIES } from "../../utils/nftMeta";
import MediaViewer from "../../components/MediaViewer";

// ─── Constants ────────────────────────────────────────────────────────────────
const TITLE_MAX = 60;
const DESC_MAX = 300;

// CATEGORIES imported from utils/nftMeta.js

const EDITION_TYPES = [
  { label: "1-of-1", desc: "Unique one-of-a-kind piece", color: "#7B61FF" },
  { label: "Limited", desc: "Limited series", color: "#00BE7A" },
  { label: "Open", desc: "Open edition", color: "#FFB547" },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { label: "Upload Image", icon: ImageIcon },
  { label: "Fill Details", icon: DescriptionIcon },
  { label: "Set Price", icon: MonetizationOnIcon },
  { label: "Mint", icon: WhatshotIcon },
];

function StepIndicator({ currentStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2rem", justifyContent: "center" }}>
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const Icon = step.icon;
        return (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: done ? "#7B61FF" : active ? "rgba(123,97,255,0.2)" : "var(--glass-bg-hover)",
                border: active ? "2px solid #7B61FF" : done ? "2px solid #7B61FF" : "2px solid var(--glass-bg-active)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: active ? "0 0 16px rgba(123,97,255,0.4)" : done ? "0 0 8px rgba(123,97,255,0.2)" : "none",
              }}>
                {done
                  ? <CheckCircleIcon style={{ fontSize: "1.1rem", color: "white" }} />
                  : <Icon style={{ fontSize: "1rem", color: active ? "#7B61FF" : "var(--text-muted)", transition: "color 0.3s" }} />
                }
              </div>
              <Typography style={{ fontSize: "0.65rem", opacity: active ? 1 : done ? 0.8 : 0.35, color: active ? "#7B61FF" : "inherit", fontWeight: active ? 700 : 400, transition: "all 0.3s", whiteSpace: "nowrap" }}>
                {step.label}
              </Typography>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentStep ? "#7B61FF" : "var(--glass-bg-hover)", maxWidth: 60, margin: "0 6px", marginBottom: "1.2rem", transition: "background 0.4s ease" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Live Preview Card ────────────────────────────────────────────────────────
function LivePreviewCard({ previewUrl, title, owner, price, category, editionType, fileType }) {
  const displayPrice = price && !isNaN(Number(price)) && Number(price) > 0 ? Number(price).toFixed(4) : null;
  const short = owner ? `${owner.slice(0, 6)}...${owner.slice(-4)}` : "You";
  const edition = EDITION_TYPES.find(e => e.label === editionType) || EDITION_TYPES[0];

  return (
    <div style={{
      width: 220,
      borderRadius: 16,
      overflow: "hidden",
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      transition: "transform 0.3s ease",
      flexShrink: 0,
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
    >
      {/* Image area */}
      <div style={{ height: 180, background: previewUrl ? "black" : "var(--glass-bg)", position: "relative" }}>
        {previewUrl
          ? <MediaViewer src={previewUrl} type={fileType} alt="preview" style={{ width: "100%", height: "100%" }} />
          : <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0.25 }}>
            <ImageIcon style={{ fontSize: "2.5rem" }} />
            <Typography style={{ fontSize: "0.75rem", marginTop: "0.4rem" }}>Upload image</Typography>
          </div>
        }
        {/* Edition badge */}
        <div style={{ position: "absolute", top: 8, left: 8, background: `${edition.color}cc`, color: "white", borderRadius: 8, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, backdropFilter: "blur(4px)" }}>
          {edition.label}
        </div>
        {/* Category badge */}
        {category && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "white", borderRadius: 8, padding: "2px 8px", fontSize: "0.65rem", backdropFilter: "blur(4px)" }}>
            {CATEGORIES.find(c => c.value === category)?.label.split(" ")[0]}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "0.75rem" }}>
        <Typography style={{ fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2, marginBottom: "0.3rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title || "NFT Title"}
        </Typography>
        <Typography style={{ fontSize: "0.7rem", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "monospace" }}>{short}</Typography>
        <div style={{ borderTop: "1px solid var(--glass-bg-hover)", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography style={{ fontSize: "0.7rem", opacity: 0.45 }}>Price</Typography>
          {displayPrice
            ? <Typography style={{ fontWeight: 700, color: "#7B61FF", fontSize: "0.85rem" }}>{displayPrice} ETH</Typography>
            : <Typography style={{ fontSize: "0.7rem", opacity: 0.3 }}>Not listed</Typography>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Minting Success Screen ───────────────────────────────────────────────────
function MintSuccess({ title, previewUrl, onGoHome, onMintAnother, fileType }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 2rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Animated ring */}
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "linear-gradient(135deg, #7B61FF, #00BE7A)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.5rem",
        boxShadow: "0 0 48px rgba(123,97,255,0.5)",
        animation: "pulse 2s ease-in-out infinite",
      }}>
        <CheckCircleIcon style={{ fontSize: "3rem", color: "white" }} />
      </div>
      <Typography variant="h4" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: "0.5rem" }}>
        🎉 Minted!
      </Typography>
      <Typography style={{ opacity: 0.65, marginBottom: "1.5rem" }}>
        <strong>"{title}"</strong> has been minted successfully to the blockchain.
      </Typography>
      {previewUrl && (
        <MediaViewer src={previewUrl} type={fileType} alt={title} style={{ width: 160, height: 160, borderRadius: 16, marginBottom: "1.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }} />
      )}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Button variant="contained" color="primary" size="large" onClick={onGoHome} style={{ padding: "10px 28px" }}>
          Go to Marketplace
        </Button>
        <Button variant="outlined" color="primary" size="large" onClick={onMintAnother} style={{ padding: "10px 28px" }}>
          Mint Another
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateNFT = () => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const account = useSelector((state) => state.allNft.account);
  const artTokenContract = useSelector((state) => state.allNft.artTokenContract);

  const [selectedFile, setSelectedFile] = useState();
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({ title: "", description: "", price: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [ethToInr, setEthToInr] = useState(null);
  const [rateError, setRateError] = useState("");

  // New feature state
  const [category, setCategory] = useState("");
  const [royalty, setRoyalty] = useState(10);
  const [editionType, setEditionType] = useState("1-of-1");
  const [unlockableContent, setUnlockableContent] = useState("");
  const [mintDone, setMintDone] = useState(false);
  const [mintedTitle, setMintedTitle] = useState("");

  const queryCollectionId = new URLSearchParams(location.search).get("collectionId");
  const initialCollectionId = location.state?.collectionId || queryCollectionId || "";
  const [collectionId, setCollectionId] = useState(initialCollectionId);

  // Core (system) collections shown in dropdown; user-created ones excluded
  const [collections, setCollections] = useState([]);
  const [lockedCollection, setLockedCollection] = useState(null); // if routed here from a user collection

  // Fetch only core/system collections for the dropdown
  useEffect(() => {
    async function fetchCollections() {
      try {
        // Fetch ALL collections to detect if the pre-selected one is non-core
        const [coreRes, allRes] = await Promise.all([
          api.get("/collections?coreOnly=true"),
          api.get("/collections"),
        ]);
        setCollections(coreRes.data);

        // If launched with a collectionId that is NOT in core list, lock it
        if (initialCollectionId) {
          const allList = allRes.data;
          const matched = allList.find(c => c.id === initialCollectionId);
          if (matched && matched.owner && matched.owner !== "") {
            // It's a user-created collection — lock it and clear from dropdown
            setLockedCollection(matched);
            setCollectionId(""); // don't pre-select in dropdown
          }
        }
      } catch (err) {
        console.error("Error fetching collections", err);
      }
    }
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preview URL
  useEffect(() => {
    if (!selectedFile) { setPreviewUrl(""); return; }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Fetch ETH→INR rate
  useEffect(() => {
    async function fetchRate() {
      try {
        setRateError("");
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr");
        if (!res.ok) throw new Error("rate failed");
        const json = await res.json();
        if (json?.ethereum?.inr) setEthToInr(Number(json.ethereum.inr));
      } catch {
        setRateError("Live INR rate unavailable right now.");
      }
    }
    fetchRate();
  }, []);

  const priceInInr = ethToInr && formData.price && !isNaN(Number(formData.price))
    ? Number(formData.price) * ethToInr
    : null;

  const fileType = selectedFile ? (
    selectedFile.type.startsWith("video/") ? "video" :
      selectedFile.type.startsWith("audio/") ? "audio" :
        selectedFile.type === "application/pdf" ? "document" :
          "image"
  ) : null;

  // Compute current step for progress indicator
  const currentStep = useMemo(() => {
    if (!selectedFile) return 0;
    if (!formData.title.trim() || !formData.description.trim()) return 1;
    if (!formData.price) return 2;
    return 3;
  }, [selectedFile, formData]);

  function handleInputChange(event) {
    let { name, value } = event.target;
    if (name === "title" && value.length > TITLE_MAX) return;
    if (name === "description" && value.length > DESC_MAX) return;
    if (name === "price" && value !== "" && Number(value) < 0) value = "0";
    setFormData({ ...formData, [name]: value });
  }

  async function createNFT(event) {
    event.preventDefault();
    const { title, description } = formData;

    if (!account || !artTokenContract) {
      setFormError("Wallet not connected. Go to the home page first to initialize Web3.");
      return;
    }
    if (!selectedFile) { setFormError("Please upload an image for your NFT."); return; }
    if (!title.trim()) { setFormError("Please provide a title."); return; }
    if (!description.trim()) { setFormError("Please provide a description."); return; }
    if (formData.price && isNaN(Number(formData.price))) { setFormError("Price must be a valid ETH number."); return; }

    setFormError("");
    setIsSubmitting(true);

    const data = new FormData();
    data.append("name", title);
    data.append("description", description);
    data.append("img", selectedFile);
    const finalCollectionId = lockedCollection ? lockedCollection.id : collectionId;
    if (finalCollectionId) {
      data.append("collectionId", finalCollectionId);
    }

    try {
      const totalSupply = await artTokenContract.methods.totalSupply().call();
      data.append("tokenId", Number(totalSupply) + 1);

      const response = await api.post("/tokens", data, {
        headers: { "Content-Type": `multipart/form-data; boundary=${data._boundary}` },
      });

      await mint(response.data.message, title);
    } catch (error) {
      console.log(error);
      setFormError("There was a problem uploading metadata or minting. Check the console.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function mint(tokenMetadataURL, title) {
    try {
      // Convert royalty percent → basis points (e.g. 10% → 1000 bps)
      const royaltyBps = Math.round(royalty * 100);
      const receipt = await artTokenContract.methods
        .mint(tokenMetadataURL, royaltyBps)
        .send({ from: account });
      const tokenId = receipt.events.Transfer.returnValues.tokenId;
      // Save category, edition, royalty, mimeType, and unlockable so they persist and show on Card/Item pages
      saveNftMeta(tokenId, { category, editionType, royalty, unlockableContent, mimeType: selectedFile?.type || "" });
      logActivity("mint", { name: formData.title, tokenId });
      setMintedTitle(title);
      setMintDone(true);
    } catch (error) {
      console.error("Error minting:", error);
      alert("Error while minting!");
      throw error;
    }
  }

  function resetForm() {
    setSelectedFile(undefined);
    setPreviewUrl("");
    setFormData({ title: "", description: "", price: "" });
    setCategory("");
    setRoyalty(10);
    setEditionType("1-of-1");
    setUnlockableContent("");
    setCollectionId("");
    setMintDone(false);
    setMintedTitle("");
    setFormError("");
  }

  // ── If minting succeeded, show success screen ──
  if (mintDone) {
    return (
      <div className={classes.pageCreateNft}>
        <Paper elevation={0} style={{ margin: "40px auto 80px auto", maxWidth: 680, borderRadius: 20, padding: "2rem" }}>
          <MintSuccess
            title={mintedTitle}
            previewUrl={previewUrl}
            fileType={fileType}
            onGoHome={() => history.push("/")}
            onMintAnother={resetForm}
          />
        </Paper>
      </div>
    );
  }

  // ── Main form ──
  return (
    <div className={classes.pageCreateNft}>
      <Paper component="form" onSubmit={createNFT} elevation={0}
        style={{ margin: "40px auto 80px auto", maxWidth: 940, borderRadius: 20, padding: "2rem 2.5rem" }}>

        {/* Header */}
        <div className={classes.formHeader}>
          <h1>Create collectible</h1>
          <Link to="/"><CancelOutlinedIcon fontSize="large" color="action" /></Link>
        </div>

        {/* Step Progress */}
        <StepIndicator currentStep={currentStep} />

        {/* Body */}
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>

          {/* Left column: dropzone + live preview card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
            <div className={classes.dropzone}>
              <DropZone onFileUploaded={setSelectedFile} />
            </div>

            {/* Live preview label */}
            <div style={{ width: "100%", textAlign: "center" }}>
              <Typography variant="caption" style={{ color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem" }}>
                Live Preview
              </Typography>
            </div>
            <LivePreviewCard
              previewUrl={previewUrl}
              title={formData.title}
              owner={account}
              price={formData.price}
              category={category}
              editionType={editionType}
              fileType={fileType}
            />
          </div>

          {/* Right column: form fields */}
          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Title with character counter */}
            <div style={{ position: "relative" }}>
              <TextField
                label="Title"
                name="title"
                variant="outlined"
                margin="normal"
                required
                value={formData.title}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ maxLength: TITLE_MAX }}
                helperText={`${formData.title.length}/${TITLE_MAX}`}
              />
            </div>

            {/* Description with character counter */}
            <TextField
              multiline
              rows={3}
              label="Description"
              name="description"
              variant="outlined"
              margin="normal"
              required
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ maxLength: DESC_MAX }}
              helperText={`${formData.description.length}/${DESC_MAX}`}
            />

            {/* Price */}
            {category !== "certificates" && (
              <>
                <TextField
                  label="Price (optional)"
                  name="price"
                  variant="outlined"
                  margin="normal"
                  value={formData.price}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">ETH</InputAdornment>,
                    inputProps: { min: 0, step: "any" },
                  }}
                  fullWidth
                />
                {priceInInr !== null && priceInInr > 0 && (
                  <Typography variant="caption" style={{ opacity: 0.6, marginLeft: "0.2rem" }}>
                    ≈ ₹{priceInInr.toFixed(0).toLocaleString("en-IN")} INR
                  </Typography>
                )}
                {!priceInInr && rateError && (
                  <Typography variant="caption" style={{ opacity: 0.45, marginLeft: "0.2rem" }}>{rateError}</Typography>
                )}
              </>
            )}

            {/* Collection selector */}
            <div style={{ marginTop: "1.25rem" }}>
              {lockedCollection ? (
                // User navigated from a user-created collection — show info only
                <div style={{
                  padding: "0.75rem 1rem",
                  borderRadius: 10,
                  background: "rgba(255,171,0,0.07)",
                  border: "1px solid rgba(255,171,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}>
                  <span style={{ fontSize: "1.1rem" }}>🔒</span>
                  <div>
                    <Typography style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFB547" }}>
                      Minting into "{lockedCollection.name}" is owner-only.
                    </Typography>
                    <Typography style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                      Only the collection creator can mint directly into this collection.
                      Go to{" "}
                      <Link to={`/collection/${lockedCollection.id}`} style={{ color: "#7B61FF" }}>
                        the collection page
                      </Link>{" "}to mint.
                    </Typography>
                  </div>
                </div>
              ) : (
                <>
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="collection-label">Collection (optional)</InputLabel>
                    <Select
                      labelId="collection-label"
                      value={collectionId}
                      onChange={(e) => setCollectionId(e.target.value)}
                      label="Collection (optional)"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {collections.map((col) => (
                        <MenuItem key={col.id} value={col.id}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {col.name}
                            <span style={{ fontSize: "0.65rem", opacity: 0.45, marginLeft: 2 }}>Core</span>
                          </span>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" style={{ color: "var(--text-muted)", marginTop: "0.4rem", display: "block", fontSize: "0.75rem" }}>
                    Only open/core collections are shown here.{" "}
                    <Link to="/stats" style={{ color: "#7B61FF", textDecoration: "none" }}>Browse your collections →</Link>
                  </Typography>
                </>
              )}
            </div>

            {/* Category selector */}
            <div style={{ marginTop: "1.25rem" }}>
              <Typography variant="caption" style={{ opacity: 0.55, display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.68rem" }}>
                Category
              </Typography>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.value}
                    label={cat.label}
                    size="small"
                    clickable
                    onClick={() => setCategory(category === cat.value ? "" : cat.value)}
                    style={{
                      background: category === cat.value ? "rgba(123,97,255,0.25)" : "var(--glass-bg)",
                      color: category === cat.value ? "#7B61FF" : "inherit",
                      border: category === cat.value ? "1px solid rgba(123,97,255,0.5)" : "1px solid var(--glass-border)",
                      fontWeight: category === cat.value ? 700 : 400,
                      fontSize: "0.72rem",
                      transition: "all 0.2s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Edition Type */}
            <div style={{ marginTop: "1.25rem" }}>
              <Typography variant="caption" style={{ opacity: 0.55, display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.68rem" }}>
                Edition Type
              </Typography>
              <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                {EDITION_TYPES.map((et) => (
                  <Tooltip key={et.label} title={et.desc}>
                    <div
                      onClick={() => setEditionType(et.label)}
                      style={{
                        padding: "0.45rem 1rem",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: editionType === et.label ? `${et.color}22` : "var(--glass-bg)",
                        border: editionType === et.label ? `1.5px solid ${et.color}77` : "1.5px solid var(--glass-border)",
                        color: editionType === et.label ? et.color : "inherit",
                        fontWeight: editionType === et.label ? 700 : 400,
                        fontSize: "0.8rem",
                        transition: "all 0.2s ease",
                        userSelect: "none",
                      }}
                    >
                      {et.label}
                    </div>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Royalty slider */}
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <Typography variant="caption" style={{ opacity: 0.55, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.68rem" }}>
                  Creator Royalty
                </Typography>
                <Typography variant="caption" style={{ color: "#7B61FF", fontWeight: 700, fontSize: "0.85rem" }}>
                  {royalty}%
                </Typography>
              </div>
              <Slider
                value={royalty}
                onChange={(_, val) => setRoyalty(val)}
                min={0}
                max={30}
                step={1}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 10, label: "10%" },
                  { value: 20, label: "20%" },
                  { value: 30, label: "30%" },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
              <Typography variant="caption" style={{ color: "var(--text-muted)", fontSize: "0.75rem", display: "block", marginTop: "0.2rem" }}>
                You earn {royalty}% on every future resale of this NFT
              </Typography>
            </div>

            {/* Unlockable Content */}
            <div style={{ marginTop: "1.25rem" }}>
              <TextField
                multiline
                rows={2}
                label="Unlockable Content (Secret Link/Message)"
                name="unlockableContent"
                variant="outlined"
                margin="normal"
                value={unlockableContent}
                onChange={(e) => setUnlockableContent(e.target.value)}
                fullWidth
                helperText={<span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Only the owner of this NFT will be able to see this.</span>}
                InputProps={{
                  style: { fontSize: "0.85rem", background: "rgba(123,97,255,0.04)" }
                }}
              />
            </div>

            {/* Error */}
            {formError && (
              <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.3)", borderRadius: 10 }}>
                <Typography style={{ color: "#FF4D4D", fontSize: "0.85rem" }}>{formError}</Typography>
              </div>
            )}

            {/* Submit button */}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
              size="large"
              style={{ marginTop: "1.5rem", padding: "13px 0", fontSize: "1rem", borderRadius: 12, position: "relative", overflow: "hidden" }}
              fullWidth
            >
              {isSubmitting
                ? <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #ffffff55", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Minting on blockchain…
                </span>
                : "🚀 Mint your art"
              }
            </Button>

            {/* Wallet hint */}
            {!account && (
              <Typography variant="caption" style={{ color: "var(--text-muted)", marginTop: "0.8rem", textAlign: "center", display: "block" }}>
                ⚠️ Connect MetaMask by visiting the home page first
              </Typography>
            )}
          </div>
        </div>
      </Paper>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 32px rgba(123,97,255,0.4); } 50% { box-shadow: 0 0 64px rgba(123,97,255,0.7); } }
      `}</style>
    </div>
  );
};

export default CreateNFT;
