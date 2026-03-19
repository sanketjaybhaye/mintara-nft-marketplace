import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  header: {
    background: theme.palette.type === 'light' ? 'var(--text-muted)' : 'var(--glass-bg)',
    backdropFilter: "blur(16px)",
    borderBottom: theme.palette.type === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid var(--glass-border)',
    color: theme.palette.text.primary,
  },
  logo: {
    width: "10rem",
    filter: theme.palette.type === 'light' ? 'invert(1)' : 'none',
  },
  account: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
  },
  walletIcon: {
    marginRight: "0.4rem",
  },
  searchContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "12px",
    padding: "2px 10px",
    marginLeft: "2rem",
    height: "36px",
    minWidth: "250px",
    flexGrow: 0,
    transition: "box-shadow 0.2s ease, border-color 0.2s",
    "&:focus-within": {
      borderColor: "#7B61FF",
      boxShadow: "0 0 0 2px rgba(123, 97, 255, 0.2)"
    }
  },
  searchInput: {
    border: "none",
    background: "transparent",
    color: theme.palette.text.primary,
    flexGrow: 1,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.85rem",
    "&::placeholder": {
      color: "var(--text-muted)",
    }
  },
  searchDropdown: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: theme.palette.type === "light" ? "#fff" : "rgba(20, 20, 30, 0.98)",
    backdropFilter: "blur(24px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    maxHeight: "350px",
    overflowY: "auto",
    zIndex: 1000,
    padding: "0.5rem 0",
    display: "flex",
    flexDirection: "column",
  },
  searchGroupHeader: {
    padding: "0.4rem 1rem",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
  },
  searchItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    textDecoration: "none",
    color: theme.palette.text.primary,
    transition: "background 0.2s",
    "&:hover": {
      background: "var(--glass-bg-hover)",
    }
  },
}));

export { useStyles };