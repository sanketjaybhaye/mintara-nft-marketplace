import React, { useState, useRef, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
    Typography, TextField, Button, Paper, Tabs, Tab, CircularProgress,
    MenuItem, Select, FormControl, InputLabel
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import LinkIcon from "@material-ui/icons/Link";
import SaveIcon from "@material-ui/icons/Save";
import DeleteIcon from "@material-ui/icons/Delete";
import { useSelector } from "react-redux";
import { api } from "../../services/api";
import { useStyles } from "../CreateCollection/styles";

const CATEGORIES = ["", "Art", "Gaming", "Photography", "Music", "Sports", "Collectibles", "Utility", "Other"];

// ─── Reusable ImagePicker ─────────────────────────────────────────────────────
function ImagePicker({ label, file, url, onFileChange, onUrlChange, previewStyle, placeholder }) {
    const [tab, setTab] = useState(0);
    const inputRef = useRef();
    const preview = file ? URL.createObjectURL(file) : url || null;

    return (
        <div style={{ marginBottom: "1.25rem" }}>
            <Typography variant="caption" style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.7rem", fontWeight: 700, display: "block", marginBottom: "0.4rem" }}>
                {label}
            </Typography>
            <div
                onClick={() => tab === 0 && inputRef.current?.click()}
                style={{
                    ...previewStyle,
                    backgroundImage: preview ? `url(${preview})` : "none",
                    backgroundSize: "cover", backgroundPosition: "center",
                    cursor: tab === 0 ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: "0.4rem",
                    border: preview ? "2px solid rgba(123,97,255,0.4)" : "2px dashed rgba(127,127,127,0.3)",
                    borderRadius: 12, overflow: "hidden", position: "relative", transition: "border-color 0.2s",
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
                        style={{ marginTop: "0.5rem", borderRadius: 8, textTransform: "none", fontSize: "0.78rem" }} fullWidth>
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

// ─── EditCollection Page ──────────────────────────────────────────────────────
const EditCollection = () => {
    const classes = useStyles();
    const history = useHistory();
    const { id } = useParams();
    const account = useSelector((state) => state.allNft.account);

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerUrl, setBannerUrl] = useState("");
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState("");
    const [category, setCategory] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [discordUrl, setDiscordUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Load existing collection data
    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/collections/${id}`);
                setName(res.data.name || "");
                setDescription(res.data.description || "");
                setBannerUrl(res.data.bannerImage || "");
                setLogoUrl(res.data.logoImage || "");
                setCategory(res.data.category || "");
                setWebsiteUrl(res.data.websiteUrl || "");
                setTwitterUrl(res.data.twitterUrl || "");
                setDiscordUrl(res.data.discordUrl || "");
            } catch {
                setError("Could not load collection data.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) { setError("Collection name is required."); return; }
        if (!account) { setError("Wallet not connected. Please connect MetaMask first."); return; }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("description", description.trim());
            formData.append("owner", account); // ← fixes the 403 bug
            formData.append("category", category);
            formData.append("websiteUrl", websiteUrl.trim());
            formData.append("twitterUrl", twitterUrl.trim());
            formData.append("discordUrl", discordUrl.trim());

            if (bannerFile) {
                formData.append("banner", bannerFile);
            } else {
                formData.append("bannerImage", bannerUrl.trim());
            }

            if (logoFile) {
                formData.append("logo", logoFile);
            } else {
                formData.append("logoImage", logoUrl.trim());
            }

            await api.put(`/collections/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSaved(true);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save changes.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) { setConfirmDelete(true); return; }
        if (!account) { setError("Wallet not connected."); return; }
        setDeleting(true);
        try {
            await api.delete(`/collections/${id}`, { data: { owner: account } });
            history.push("/stats");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete collection.");
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "6rem" }}>
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (saved) {
        return (
            <div className={classes.root}>
                <Paper className={classes.paper} elevation={0}>
                    <div style={{ textAlign: "center", padding: "2rem 0" }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: "50%", margin: "0 auto 1.25rem",
                            background: "linear-gradient(135deg, #7B61FF, #00BE7A)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 0 32px rgba(0,190,122,0.4)",
                        }}>
                            <SaveIcon style={{ fontSize: "2rem", color: "white" }} />
                        </div>
                        <Typography className={classes.title} style={{ fontSize: "1.6rem" }}>Changes Saved! ✅</Typography>
                        <Typography className={classes.subtitle}>
                            <strong>"{name}"</strong> has been updated.
                        </Typography>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
                            <Button variant="contained" color="primary"
                                onClick={() => history.push(`/collection/${id}`)}
                                style={{ padding: "9px 24px", borderRadius: 10, fontWeight: 700 }}>
                                View Collection
                            </Button>
                            <Button variant="outlined" color="primary"
                                onClick={() => history.push("/stats")}
                                style={{ padding: "9px 24px", borderRadius: 10, fontWeight: 700 }}>
                                Back to Stats
                            </Button>
                        </div>
                    </div>
                </Paper>
            </div>
        );
    }

    const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl || null;
    const logoPreview = logoFile ? URL.createObjectURL(logoFile) : logoUrl || null;

    return (
        <div className={classes.root}>
            <Paper component="form" onSubmit={handleSubmit} className={classes.paper} elevation={0}>
                <Typography variant="h1" className={classes.title}>Edit Collection</Typography>
                <Typography className={classes.subtitle}>
                    Update the details of <strong>"{name}"</strong>. Changes are saved immediately.
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
                            {description || "Description…"}
                        </Typography>
                    </div>
                </div>

                {/* Core Fields */}
                <TextField label="Collection Name *" variant="outlined" fullWidth margin="normal"
                    value={name} onChange={(e) => setName(e.target.value)} inputProps={{ maxLength: 60 }} />

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

                {/* Images */}
                <ImagePicker
                    label="Banner Image"
                    file={bannerFile} url={bannerUrl}
                    onFileChange={setBannerFile} onUrlChange={setBannerUrl}
                    previewStyle={{ width: "100%", height: 140, marginBottom: 0 }}
                    placeholder="Click to upload a new banner"
                />

                <ImagePicker
                    label="Logo / Avatar Image"
                    file={logoFile} url={logoUrl}
                    onFileChange={setLogoFile} onUrlChange={setLogoUrl}
                    previewStyle={{ width: 100, height: 100, margin: "0 auto" }}
                    placeholder="Logo"
                />

                {/* Social Links */}
                <span className={classes.sectionLabel} style={{ marginTop: "1rem", display: "block" }}>Social Links (optional)</span>
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

                <Button type="submit" variant="contained" fullWidth disabled={submitting}
                    className={classes.submitButton} startIcon={<SaveIcon />}>
                    {submitting ? "Saving…" : "Save Changes"}
                </Button>

                <Button fullWidth variant="text" color="default"
                    style={{ marginTop: "0.5rem", textTransform: "none", color: "var(--text-muted)" }}
                    onClick={() => history.push(`/collection/${id}`)}>
                    Cancel
                </Button>

                <div style={{
                    marginTop: "2rem", padding: "1.25rem", borderRadius: 12,
                    border: "1px solid rgba(255,77,77,0.2)", background: "rgba(255,77,77,0.04)"
                }}>
                    <Typography variant="subtitle2" style={{ color: "#FF4D4D", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Danger Zone
                    </Typography>
                    <Typography variant="body2" style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                        Permanently delete this collection. NFTs inside it will not be deleted.
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        disabled={deleting}
                        onClick={handleDelete}
                        style={{
                            borderColor: confirmDelete ? "#FF4D4D" : "rgba(255,77,77,0.4)",
                            color: "#FF4D4D",
                            background: confirmDelete ? "rgba(255,77,77,0.1)" : "transparent",
                            textTransform: "none", fontWeight: 700,
                        }}
                    >
                        {deleting ? "Deleting…" : confirmDelete ? "⚠️ Click again to confirm deletion" : "Delete Collection"}
                    </Button>
                    {confirmDelete && (
                        <Button size="small" onClick={() => setConfirmDelete(false)}
                            style={{ marginLeft: "0.75rem", color: "var(--text-muted)", textTransform: "none" }}>
                            Cancel
                        </Button>
                    )}
                </div>
            </Paper>
        </div>
    );
};

export default EditCollection;
