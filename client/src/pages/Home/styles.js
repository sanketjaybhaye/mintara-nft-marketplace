import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  homepage: {

  },
  imageWrapper: {
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: theme.palette.type === 'light' ? "0 8px 24px 0 rgba(0, 0, 0, 0.15)" : "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
    transition: "transform 0.4s ease, box-shadow 0.4s ease",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: theme.palette.type === 'light' ? "0 12px 30px 0 rgba(123, 97, 255, 0.3)" : "0 12px 40px 0 rgba(123, 97, 255, 0.4)",
    }
  },
  images: {
    objectFit: "cover",
    width: "100%",
    height: "100%",

  },
  banner: {
    padding: "4rem 2rem",
    background: theme.palette.type === 'light'
      ? "linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,1) 100%)"
      : "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,1) 100%)",
  },
  gridBanner: {
    // margin: 0,
    // width: '100%',
  },
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 1rem",
    textAlign: "center",
    '& img': {
      width: "55%",
      filter: "drop-shadow(0px 0px 20px rgba(123, 97, 255, 0.4))",
      marginBottom: "2rem"
    },
    '& p': {
      fontSize: "1.4rem",
      color: "inherit",
      opacity: 0.8,
      maxWidth: "500px",
      margin: "0 auto 3rem auto"
    },
    '& button': {
      padding: "0.8rem 2.5rem",
      fontSize: "1.2rem",
      textTransform: "uppercase",
      letterSpacing: "0.1em"
    }

  },
  allNfts: {
    marginTop: "2rem",
    padding: "0 2rem",
  },
  controlsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "0.75rem",
    padding: "1rem 2rem",
    borderRadius: "16px",
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: "1.8rem",
    fontWeight: "600",
    marginBottom: "1rem",
  },
  controlsRight: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.75rem",
  },
  sortControl: {
    marginLeft: "0.75rem",
    minWidth: 160,
  },
  priceFilter: {
    width: 200,
    marginLeft: "0.75rem",
  },
}));

export { useStyles };