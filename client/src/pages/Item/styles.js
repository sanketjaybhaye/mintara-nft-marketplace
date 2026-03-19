import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  pageItem: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",

    '& main': {
      margin: "40px auto 80px auto",
      maxWidth: "1200px",
      color: theme.palette.text.primary,
      padding: "0 2rem",

      display: "flex",
      flexDirection: "column",

      '& *': {
        color: "inherit",
      },

      '& .MuiTypography-root': {
        color: theme.palette.text.primary,
      },
      '& .MuiTypography-caption': {
        color: theme.palette.text.secondary,
      },

      '& header': {
        display: "flex",
        alignItems: "center",
        marginBottom: "2rem",

        '& a': {
          margin: "0 auto 0 0",
        }
      },

      '& section': {
        '& figure': {
          minHeight: "400px",
          height: "100%",
          margin: "0",
          background: "linear-gradient(145deg, rgba(30,27,50,0.6) 0%, rgba(18,16,38,0.8) 100%)",
          border: "1px solid rgba(123,97,255,0.18)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 40px rgba(123,97,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          outline: "0",
          overflow: "hidden",
          borderRadius: "16px",
          padding: "1rem",

          '& img': {
            width: "100% !important",
            height: "100% !important",
            objectFit: "contain !important",
            borderRadius: "10px",
          },

          '& iframe': {
            width: "100%",
            height: "100%",
            minHeight: "500px",
            border: "none",
          },
        },

        '& fieldset': {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          border: "0",
        }
      },
    }
  }
}));

export { useStyles };