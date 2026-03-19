import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  dropzone: {
    height: "350px",
    background: theme.palette.type === 'light' ? "rgba(0, 0, 0, 0.02)" : "var(--glass-bg)",
    borderRadius: "16px",
    border: theme.palette.type === 'light' ? "2px dashed rgba(0, 0, 0, 0.15)" : "2px dashed var(--glass-border-hover)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "24px",
    outline: "none",
    transition: "all 0.3s ease",

    "&:hover": {
      background: theme.palette.type === 'light' ? "rgba(123, 97, 255, 0.05)" : "rgba(123, 97, 255, 0.1)",
      borderColor: theme.palette.primary.main,
    },

    '& img': {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "14px",
    },

    '& p': {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: theme.palette.text.secondary,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,

      '& svg': {
        color: theme.palette.primary.main,
        width: "48px",
        height: "48px",
        marginBottom: "16px",
        opacity: 0.8,
      }
    }
  }
}));

export { useStyles };