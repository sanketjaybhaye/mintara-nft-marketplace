import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 280,
    minWidth: 280,
    maxWidth: 280,
    height: 420,
    borderRadius: "20px",
    margin: "auto",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    background: theme.palette.type === 'dark'
      ? "linear-gradient(145deg, var(--glass-bg-hover) 0%, var(--glass-bg) 100%)"
      : "linear-gradient(145deg, var(--text-muted) 0%, var(--text-muted) 100%)",
    backdropFilter: "blur(20px)",
    border: theme.palette.type === 'dark'
      ? "1px solid var(--glass-bg-hover)"
      : "1px solid rgba(0, 0, 0, 0.06)",
    boxShadow: theme.palette.type === 'dark'
      ? "0 8px 32px rgba(0, 0, 0, 0.5)"
      : "0 8px 32px rgba(31, 38, 135, 0.08)",
    "&:hover": {
      transform: "translateY(-10px) scale(1.01)",
      boxShadow: theme.palette.type === 'dark'
        ? "0 24px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(123, 97, 255, 0.4)"
        : "0 24px 48px rgba(31, 38, 135, 0.15), 0 0 24px rgba(123, 97, 255, 0.2)",
      borderColor: "rgba(123, 97, 255, 0.5)",
      "& $mediaOverlay": {
        opacity: 1,
      },
      "& $mediaContainer img": {
        transform: "scale(1.07)",
      },
    },
  },
  mediaContainer: {
    position: "relative",
    width: "100%",
    height: 220,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.type === 'dark' ? "#111" : "#f5f5f5",
    "& img, & video": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      transition: "transform 0.5s ease",
    },
  },
  mediaOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
    zIndex: 1,
    pointerEvents: "none",
  },
  content: {
    padding: "1.1rem 1.25rem 1.25rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
    zIndex: 2,
  },
  divider: {
    margin: "0.75rem 0",
    background: theme.palette.type === 'dark' ? "var(--glass-bg-hover)" : "rgba(0,0,0,0.06)",
    flexShrink: 0,
  },
  titleWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.4rem",
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 800,
    fontSize: "1.1rem",
    lineHeight: 1.2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
    color: theme.palette.type === 'dark' ? "#ffffff" : "#1a1a1a",
  },
  badge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    height: "1.4rem",
    flexShrink: 0,
    color: "white",
    backgroundColor: "#00BE7A",
    boxShadow: "0 0 10px rgba(0, 190, 122, 0.4)",
    fontFamily: "'Inter', sans-serif",
    border: "none",
  },
  notForSaleBadge: {
    fontSize: "0.7rem",
    fontWeight: 600,
    height: "1.4rem",
    flexShrink: 0,
    color: theme.palette.type === 'dark' ? "var(--text-muted)" : "rgba(0,0,0,0.5)",
    backgroundColor: theme.palette.type === 'dark' ? "var(--glass-bg)" : "rgba(0,0,0,0.04)",
    border: theme.palette.type === 'dark' ? "1px solid var(--glass-border)" : "1px solid rgba(0,0,0,0.08)",
    fontFamily: "'Inter', sans-serif",
  },
  yoursBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    height: "1.4rem",
    flexShrink: 0,
    marginRight: "5px",
    background: theme.palette.type === 'dark' ? "rgba(123, 97, 255, 0.2)" : "rgba(123, 97, 255, 0.1)",
    color: theme.palette.type === 'dark' ? "#bba6ff" : "#7B61FF",
    border: theme.palette.type === 'dark' ? "1px solid rgba(123, 97, 255, 0.4)" : "1px solid rgba(123, 97, 255, 0.2)",
  },
  badgesContainer: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    gap: "2px",
  },
  favoriteButton: {
    padding: 5,
    flexShrink: 0,
    background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "rgba(0,0,0,0.03)",
    "&:hover": {
      background: "rgba(255, 77, 77, 0.15)",
    },
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.type === 'dark' ? "rgba(123,97,255,0.08)" : "rgba(123,97,255,0.05)",
    padding: "0.35rem 0.7rem",
    borderRadius: "10px",
    border: theme.palette.type === 'dark' ? "1px solid rgba(123,97,255,0.2)" : "1px solid rgba(123,97,255,0.15)",
  },
  priceValue: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "1rem",
    marginLeft: "0.35rem",
    color: theme.palette.type === 'dark' ? "#ffffff" : "#1a1a1a",
  },
  sellerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerLabel: {
    fontSize: "0.68rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
    color: theme.palette.type === 'dark' ? "var(--text-muted)" : "rgba(0,0,0,0.4)",
    marginBottom: "0.15rem",
    fontFamily: "'Inter', sans-serif",
  },
  sellerAddress: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: theme.palette.type === 'dark' ? "var(--text-muted)" : "rgba(0,0,0,0.8)",
  },
  actionButton: {
    textTransform: 'none',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '5px 14px',
    borderRadius: '8px',
    fontFamily: "'Inter', sans-serif",
    background: "linear-gradient(45deg, #7B61FF 30%, #4D33E6 90%)",
    color: "white",
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(123, 97, 255, 0.3)",
    "&:hover": {
      boxShadow: "0 4px 15px rgba(123, 97, 255, 0.5)",
      background: "linear-gradient(45deg, #8A73FF 30%, #5C44FF 90%)",
    }
  },
  actionButtonOutlined: {
    textTransform: 'none',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: '8px',
    flexShrink: 0,
    fontFamily: "'Inter', sans-serif",
    border: "2px solid #7B61FF",
    color: theme.palette.type === 'dark' ? "#bba6ff" : "#7B61FF",
    "&:hover": {
      background: "rgba(123, 97, 255, 0.1)",
      border: "2px solid #7B61FF",
    }
  }
}));

export { useStyles };
