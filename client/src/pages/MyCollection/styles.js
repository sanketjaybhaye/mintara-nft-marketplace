import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    padding: "2rem",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.8rem",
    fontWeight: 600,
  },
  emptyState: {
    marginTop: "2rem",
    textAlign: "center",
  },
});

export { useStyles };

