import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: "80vh",
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    headerWrapper: {
        marginBottom: "3rem",
        textAlign: "center",
    },
    pageTitle: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        fontSize: "3rem",
        background: theme.palette.type === 'dark'
            ? "linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)"
            : "linear-gradient(135deg, #111827 0%, #4B5563 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "1rem",
    },
    pageSubtitle: {
        color: theme.palette.type === 'dark' ? "var(--text-muted)" : "rgba(0,0,0,0.6)",
        fontFamily: "'Inter', sans-serif",
        fontSize: "1.1rem",
    },
    tableContainer: {
        background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        border: theme.palette.type === 'dark' ? "1px solid var(--glass-bg)" : "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: theme.palette.type === 'dark' ? "0 10px 40px rgba(0,0,0,0.5)" : "0 10px 40px rgba(0,0,0,0.05)",
        overflow: "hidden",
    },
    table: {
        minWidth: 700,
    },
    tableHead: {
        background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "rgba(0, 0, 0, 0.02)",
    },
    headCell: {
        color: theme.palette.type === 'dark' ? "var(--text-muted)" : "rgba(0,0,0,0.5)",
        textTransform: "uppercase",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        borderBottom: theme.palette.type === 'dark' ? "1px solid var(--glass-bg)" : "1px solid rgba(0, 0, 0, 0.05)",
        padding: "1.5rem 1rem",
    },
    tableRow: {
        transition: "background 0.2s ease, transform 0.2s ease",
        cursor: "pointer",
        textDecoration: "none",
        "&:hover": {
            background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "rgba(123, 97, 255, 0.04)",
            transform: "scale(1.005)",
            "& $collectionName": {
                color: "#7B61FF",
            }
        },
    },
    bodyCell: {
        borderBottom: theme.palette.type === 'dark' ? "1px solid var(--glass-bg)" : "1px solid rgba(0, 0, 0, 0.05)",
        padding: "1rem",
        color: theme.palette.type === 'dark' ? "#ffffff" : "#1a1a1a",
        fontFamily: "'Inter', sans-serif",
        fontSize: "1rem",
        fontWeight: 500,
    },
    rankCell: {
        fontWeight: 700,
        color: theme.palette.type === 'dark' ? "var(--text-muted)" : "rgba(0,0,0,0.4)",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "1.2rem",
    },
    collectionInfo: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    avatar: {
        width: "50px",
        height: "50px",
        borderRadius: "12px",
        border: theme.palette.type === 'dark' ? "1px solid var(--glass-border)" : "1px solid rgba(0, 0, 0, 0.1)",
    },
    collectionName: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        fontSize: "1.1rem",
        transition: "color 0.2s ease",
    },
    positiveChange: {
        color: "#00BE7A",
        fontWeight: 600,
    },
    negativeChange: {
        color: "#FF4D4D",
        fontWeight: 600,
    },
    ethPrice: {
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        fontWeight: 600,
        fontFamily: "'Outfit', sans-serif",
    }
}));

export { useStyles };
