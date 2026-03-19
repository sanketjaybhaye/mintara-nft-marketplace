import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 720,
        margin: "3rem auto 5rem auto",
        padding: "0 1.5rem",
    },
    paper: {
        padding: "2.5rem",
        borderRadius: 20,
        background: theme.palette.type === 'dark'
            ? "var(--glass-bg)"
            : "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        border: theme.palette.type === 'dark'
            ? "1px solid var(--glass-bg-hover)"
            : "1px solid rgba(0,0,0,0.06)",
        boxShadow: theme.palette.type === 'dark'
            ? "0 12px 48px rgba(0,0,0,0.5)"
            : "0 12px 48px rgba(31,38,135,0.07)",
    },
    title: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        fontSize: "2rem",
        marginBottom: "0.25rem",
        color: theme.palette.type === 'dark' ? "#ffffff" : "#1a1a1a",
    },
    subtitle: {
        opacity: 0.55,
        fontFamily: "'Inter', sans-serif",
        marginBottom: "2rem",
        fontSize: "0.95rem",
    },
    sectionLabel: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        opacity: 0.5,
        marginBottom: "0.5rem",
        display: "block",
    },
    bannerPreview: {
        width: "100%",
        height: 160,
        borderRadius: 12,
        backgroundSize: "cover",
        backgroundPosition: "center",
        background: theme.palette.type === 'dark'
            ? "var(--glass-bg)"
            : "rgba(0,0,0,0.04)",
        border: theme.palette.type === 'dark'
            ? "2px dashed var(--glass-bg-active)"
            : "2px dashed rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1rem",
        overflow: "hidden",
        position: "relative",
        transition: "border-color 0.2s ease",
    },
    logoPreview: {
        width: 90,
        height: 90,
        borderRadius: 14,
        backgroundSize: "cover",
        backgroundPosition: "center",
        background: theme.palette.type === 'dark'
            ? "var(--glass-bg-hover)"
            : "rgba(0,0,0,0.06)",
        border: theme.palette.type === 'dark'
            ? "2px dashed var(--glass-bg-active)"
            : "2px dashed rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
    },
    previewSection: {
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        marginBottom: "1.5rem",
    },
    errorBox: {
        background: "rgba(255,77,77,0.1)",
        border: "1px solid rgba(255,77,77,0.3)",
        borderRadius: 10,
        padding: "0.75rem 1rem",
        marginTop: "1rem",
    },
    successBox: {
        background: "rgba(0,190,122,0.1)",
        border: "1px solid rgba(0,190,122,0.3)",
        borderRadius: 10,
        padding: "0.75rem 1rem",
        marginTop: "1rem",
    },
    submitButton: {
        marginTop: "1.5rem",
        padding: "13px 0",
        fontSize: "1rem",
        borderRadius: 12,
        fontWeight: 700,
        background: "linear-gradient(45deg, #7B61FF 30%, #4D33E6 90%)",
        color: "white",
        boxShadow: "0 4px 20px rgba(123,97,255,0.35)",
        "&:hover": {
            boxShadow: "0 6px 28px rgba(123,97,255,0.5)",
        },
        "&:disabled": {
            opacity: 0.5,
            boxShadow: "none",
        },
    },
}));

export { useStyles };
