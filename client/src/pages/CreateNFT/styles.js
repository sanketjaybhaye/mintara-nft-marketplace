import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  pageCreateNft: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",

    '& form': {
      margin: "40px auto 80px auto",
      maxWidth: "800px",
      borderRadius: "16px",
      padding: "2rem 3rem",

      display: "flex",
      flexDirection: "column",

      '& fieldset': {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",

        width: "100%",
        maxWidth: "400px",
        marginTop: "1rem",
        marginLeft: "2rem",
        minInlineSize: "auto",
        border: "0",
        padding: "0"
      }
    }
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "2rem",
    borderBottom: theme.palette.type === 'light' ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid var(--glass-border)',
    paddingBottom: "1rem",

    '& h1': {
      fontFamily: "'Outfit', sans-serif",
      fontSize: "32px",
      margin: 0,
    },

    '& a': {
      display: "flex",
    }
  },

  content: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },

  dropzone: {
    minWidth: "300px"
  },
  previewWrapper: {
    marginTop: "1rem",
  },
  previewLabel: {
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
    color: theme.palette.text.secondary,
  },
  previewImage: {
    width: "100%",
    maxWidth: "260px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: "0.9rem",
    marginTop: "0.75rem",
    marginBottom: "0.25rem",
    alignSelf: "flex-start",
  },
  fiatHint: {
    fontSize: "0.85rem",
    color: theme.palette.text.secondary,
    marginTop: "0.35rem",
    alignSelf: "flex-start",
  },
}));

export { useStyles };