import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
    Typography, TextField, Button, Paper, Tabs, Tab,
    MenuItem, Select, FormControl, InputLabel
} from "@material-ui/core";
import CollectionsIcon from "@material-ui/icons/Collections";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import LinkIcon from "@material-ui/icons/Link";
import { useSelector } from "react-redux";
import { api } from "../../services/api";
import { useStyles } from "./styles";

const CATEGORIES = ["", "Art", "Gaming", "Photography", "Music", "Sports", "Collectibles", "Utility", "Other"];

function slugify(str) {
    return str.toString().toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// ─── Image picker: supports both file upload and URL input ──────────────────
function ImagePicker({ label, file, url, onFileChange, onUrlChange, previewStyle, placeholder }) {
    const [tab, setTab] = useState(0); // 0=upload, 1=url
    const inputRef = useRef();
    const preview = file ? URL.createObjectURL(file) : url || null;

    return (
        <div style={{ marginBottom: "1.25rem" }}>
            <Typography variant="caption" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.7rem", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                {label}
            </Typography>

            {/* Preview box */}
            <div
                onClick={() => tab === 0 && inputRef.current?.click()}
                style={{
                    ...previewStyle,
                    backgroundImage: preview ? `url(${preview})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    cursor: tab === 0 ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "0.4rem",
                    transition: "border-color 0.2s",
                    border: preview ? "2px solid rgba(123,97,255,0.4)" : "2px dashed rgba(127,127,127,0.3)",
                    borderRadius: 12,
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {!preview && (
                    <>
                        <CloudUploadIcon style={{ color: "var(--text-muted)", opacity: 0.5, fontSize: "2rem" }} />
                        <Typography style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{placeholder}</Typography>
                    </>
                )}
                {file && (
                    <div style={{
                        position: "absolute", bottom: 6, right: 6,
                        background: "rgba(0,190,122,0.85)", borderRadius: 8,
                        padding: "2px 8px", fontSize: "0.68rem", color: "white", fontWeight: 700,
                    }}>
                        ✓ {file.name.length > 18 ? file.name.slice(0, 15) + "…" : file.name}
                    </div>
                )}
            </div>

            {/* Source tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary"
                style={{ marginTop: "0.4rem", minHeight: 32 }}>
                <Tab icon={<CloudUploadIcon style={{ fontSize: "0.9rem" }} />} label="Upload file" style={{ minHeight: 32, fontSize: "0.72rem", textTransform: "none" }} />
                <Tab icon={<LinkIcon style={{ fontSize: "0.9rem" }} />} label="Paste URL" style={{ minHeight: 32, fontSize: "0.72rem", textTransform: "none" }} />
            </Tabs>

            {tab === 0 ? (
                <>
                    <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={(e) => onFileChange(e.target.files[0] || null)} />
                    <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />}
                        onClick={() => inputRef.current?.click()}
                        style={{ marginTop: "0.5rem", borderRadius: 8, textTransform: "none", fontSize: "0.78rem" }}
                        fullWidth>
                        {file ? "Change file" : "Choose from PC"}
                    </Button>
                </>
            ) : (
                <TextField placeholder="https://..." variant="outlined" size="small" fullWidth
                    value={url} onChange={(e) => onUrlChange(e.target.value)}
                    style={{ marginTop: "0.5rem" }} helperText="Paste any public image URL" />
            )}
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
const CreateCollection = () => {
    const classes = useStyles();
    const history = useHistory();
    const account = useSelector((state) => state.allNft.account);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [discordUrl, setDiscordUrl] = useState("");

    // Banner
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerUrl, setBannerUrl] = useState("");

    // Logo
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) { setError("Collection name is required."); return; }
        const id = slugify(name);
        if (!id) { setError("Name produced an invalid ID. Use letters and numbers."); return; }
        if (!account) { setError("Wallet not connected. Go to the home page first."); return; }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("name", name.trim());
            formData.append("description", description.trim());
            formData.append("owner", account);
            formData.append("category", category);
            formData.append("websiteUrl", websiteUrl.trim());
            formData.append("twitterUrl", twitterUrl.trim());
            formData.append("discordUrl", discordUrl.trim());

            if (bannerFile) {
                formData.append("banner", bannerFile);
            } else if (bannerUrl.trim()) {
                formData.append("bannerImage", bannerUrl.trim());
            }

            if (logoFile) {
                formData.append("logo", logoFile);
            } else if (logoUrl.trim()) {
                formData.append("logoImage", logoUrl.trim());
            }

            const res = await api.post("/collections", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccess({ id, name: name.trim(), url: res.data.message });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create collection.");
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setSuccess(null); setName(""); setDescription("");
        setBannerFile(null); setBannerUrl("");
        setLogoFile(null); setLogoUrl("");
        setCategory(""); setWebsiteUrl(""); setTwitterUrl(""); setDiscordUrl("");
        setError("");
    };

    // ── Success Screen ──
    if (success) {
        return (
            <div className={classes.root}>
                <Paper className={classes.paper} elevation={0}>
                    <div style={{ textAlign: "center", padding: "1rem 0 0.5rem" }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 1.5rem",
                            background: "linear-gradient(135deg, #7B61FF, #00BE7A)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 40px rgba(0,190,122,0.4)",
                        }}>
                            <CollectionsIcon style={{ fontSize: "2.2rem", color: "white" }} />
                        </div>
                        <Typography className={classes.title}>Collection Created! 🎉</Typography>
                        <Typography className={classes.subtitle}>
                            <strong>"{success.name}"</strong> is now live on your marketplace.
                        </Typography>
                        <div style={{
                            background: "rgba(123,97,255,0.08)", border: "1px solid rgba(123,97,255,0.2)",
                            borderRadius: 12, padding: "0.75rem 1.25rem",
                            fontFamily: "monospace", fontSize: "0.8rem", marginBottom: "1.5rem",
                        }}>
                            Collection ID: <strong>{success.id}</strong>
                        </div>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                            <Button variant="contained" color="primary"
                                onClick={() => history.push(`/collection/${success.id}`)}
                                style={{ padding: "10px 28px", borderRadius: 10, fontWeight: 700 }}>
                                View Collection
                            </Button>
                            <Button variant="outlined" color="primary"
                                onClick={() => history.push("/create-nft")}
                                style={{ padding: "10px 28px", borderRadius: 10, fontWeight: 700 }}>
                                Mint an NFT to it
                            </Button>
                            <Button variant="text" onClick={reset}>Create another</Button>
                        </div>
                    </div>
                </Paper>
            </div>
        );
    }

    // ── Form ──
    const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl || null;
    const logoPreview = logoFile ? URL.createObjectURL(logoFile) : logoUrl || null;

    return (
        <div className={classes.root}>
            <Paper component="form" onSubmit={handleSubmit} className={classes.paper} elevation={0}>
                <Typography variant="h1" className={classes.title}>Create a Collection</Typography>
                <Typography className={classes.subtitle}>
                    Group your NFTs into a themed collection with your own banner and logo.
                </Typography>

                {/* Live preview */}
                <span className={classes.sectionLabel}>Preview</span>
                <div className={classes.bannerPreview}
                    style={bannerPreview ? { backgroundImage: `url(${bannerPreview})`, borderStyle: "solid", borderColor: "rgba(123,97,255,0.35)" } : {}}>
                    {!bannerPreview && <Typography style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Banner preview</Typography>}
                </div>
                <div className={classes.previewSection}>
                    <div className={classes.logoPreview}
                        style={logoPreview ? { backgroundImage: `url(${logoPreview})`, borderStyle: "solid", borderColor: "rgba(123,97,255,0.35)" } : {}}>
                        {!logoPreview && <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Logo</span>}
                    </div>
                    <div>
                        <Typography style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "1.3rem" }}>
                            {name || <span style={{ color: "var(--text-muted)" }}>Collection Name</span>}
                        </Typography>
                        <Typography variant="body2" style={{ color: "var(--text-muted)", marginTop: "0.2rem" }}>
                            {description || <span>Description…</span>}
                        </Typography>
                    </div>
                </div>

                {/* Name & Description */}
                <TextField label="Collection Name *" variant="outlined" fullWidth margin="normal"
                    value={name} onChange={(e) => setName(e.target.value)} inputProps={{ maxLength: 60 }}
                    helperText={`Slug ID: ${slugify(name) || "—"}`} />

                <TextField label="Description" variant="outlined" fullWidth multiline rows={2}
                    margin="normal" value={description} onChange={(e) => setDescription(e.target.value)}
                    inputProps={{ maxLength: 300 }} helperText={`${description.length}/300`} />

                {/* Category */}
                <FormControl variant="outlined" fullWidth margin="normal">
                    <InputLabel>Category</InputLabel>
                    <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                        {CATEGORIES.map((c) => (
                            <MenuItem key={c} value={c}>{c || "— None —"}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Banner picker */}
                <ImagePicker
                    label="Banner Image (wide landscape)"
                    file={bannerFile} url={bannerUrl}
                    onFileChange={setBannerFile} onUrlChange={setBannerUrl}
                    previewStyle={{ width: "100%", height: 140, marginBottom: 0 }}
                    placeholder="Click to upload or switch to URL tab"
                />

                {/* Logo picker */}
                <ImagePicker
                    label="Logo / Avatar Image (square)"
                    file={logoFile} url={logoUrl}
                    onFileChange={setLogoFile} onUrlChange={setLogoUrl}
                    previewStyle={{ width: 100, height: 100, margin: "0 auto 0" }}
                    placeholder="Logo"
                />

                {/* Social Links */}
                <span className={classes.sectionLabel} style={{ marginTop: "0.5rem", display: "block" }}>
                    Social Links <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
                </span>
                <TextField label="Website URL" variant="outlined" fullWidth margin="dense"
                    value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com" />
                <TextField label="Twitter URL" variant="outlined" fullWidth margin="dense"
                    value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourhandle" />
                <TextField label="Discord URL" variant="outlined" fullWidth margin="dense"
                    value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="https://discord.gg/invite" style={{ marginBottom: "1.25rem" }} />

                {error && (
                    <div className={classes.errorBox}>
                        <Typography style={{ color: "#FF4D4D", fontSize: "0.9rem" }}>{error}</Typography>
                    </div>
                )}

                <Button type="submit" variant="contained" fullWidth disabled={submitting} className={classes.submitButton}>
                    {submitting ? "Creating…" : "✨ Create Collection"}
                </Button>
            </Paper>
        </div>
    );
};

export default CreateCollection;
