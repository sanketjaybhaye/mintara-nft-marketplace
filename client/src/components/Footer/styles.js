import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: "4rem",
    background: theme.palette.type === 'dark'
      ? "linear-gradient(180deg, #111827 0%, #0B101A 100%)"
      : "linear-gradient(180deg, #F3F4F6 0%, #FFFFFF 100%)",
    color: theme.palette.type === 'dark' ? "#E5E7EB" : "#374151",
    borderTop: theme.palette.type === 'dark'
      ? "1px solid var(--glass-bg)"
      : "1px solid rgba(0, 0, 0, 0.08)",
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "4rem 2rem 2rem 2rem",
    position: "relative",
  },
  logo: {
    width: "8rem",
    filter: theme.palette.type === 'light' ? 'invert(1)' : 'none',
  },
  description: {
    fontSize: "0.9rem",
    lineHeight: 1.6,
    color: theme.palette.type === 'dark' ? "#9CA3AF" : "#4B5563",
    fontFamily: "'Inter', sans-serif",
    maxWidth: "400px",
  },
  columnTitle: {
    fontWeight: 700,
    fontSize: "1rem",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: "1.5rem",
    color: theme.palette.type === 'dark' ? "#F9FAFB" : "#111827",
  },
  linkGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  link: {
    color: theme.palette.type === 'dark' ? "#9CA3AF" : "#4B5563",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontFamily: "'Inter', sans-serif",
    transition: "color 0.2s ease",
    "&:hover": {
      color: "#7B61FF",
    },
  },
  socialIcons: {
    display: "flex",
    gap: "0.5rem",
  },
  iconButton: {
    color: theme.palette.type === 'dark' ? "#9CA3AF" : "#4B5563",
    background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: theme.palette.type === 'dark' ? "rgba(123, 97, 255, 0.2)" : "rgba(123, 97, 255, 0.1)",
      color: theme.palette.type === 'dark' ? "#ffffff" : "#7B61FF",
      transform: "translateY(-3px)",
    },
  },
  divider: {
    height: "1px",
    background: theme.palette.type === 'dark' ? "var(--glass-border)" : "rgba(0, 0, 0, 0.08)",
    margin: "3rem 0 2rem 0",
  },
  bottomBar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  meta: {
    fontSize: "0.8rem",
    color: theme.palette.type === 'dark' ? "#6B7280" : "#9CA3AF",
    fontFamily: "'Inter', sans-serif",
  },
  termsLinks: {
    display: "flex",
    gap: "1.5rem",
    "& > a": {
      fontSize: "0.8rem",
      color: theme.palette.type === 'dark' ? "#6B7280" : "#9CA3AF",
    }
  }
}));

export { useStyles };

