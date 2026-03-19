import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import Header from "./components/Header/index";
import Footer from "./components/Footer/index";
import Home from "./pages/Home/index";
import CreateNFT from "./pages/CreateNFT/index";
import MyCollection from "./pages/MyCollection/index";
import Item from "./pages/Item/index";
import Activity from "./pages/Activity/index";
import Favorites from "./pages/Favorites/index";
import Creator from "./pages/Creator/index";
import AboutUs from "./pages/AboutUs/index";
import Documentation from "./pages/Documentation/index";
import CollectionDetail from "./pages/Collection/index";
import Stats from "./pages/Stats/index";
import CreateCollection from "./pages/CreateCollection/index";
import EditCollection from "./pages/EditCollection/index";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const theme = createTheme({
    palette: {
      type: darkMode ? "dark" : "light",
      primary: { main: "#7B61FF" },
      secondary: { main: "#FF4D4D" },
      background: {
        default: darkMode ? "#0a0a0a" : "#fafafa",
        paper: darkMode ? "var(--glass-bg)" : "var(--glass-bg)",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#1a1a1a",
        secondary: darkMode ? "#cccccc" : "#555555",
      }
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
      h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700 },
      h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
      h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
      h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
    },
    overrides: {
      MuiButton: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 600 },
        containedPrimary: {
          background: "linear-gradient(45deg, #7B61FF 30%, #4D33E6 90%)",
          boxShadow: "0 3px 5px 2px rgba(123, 97, 255, .3)",
          color: "white",
        },
      },
      MuiPaper: {
        root: {
          backgroundColor: darkMode ? "var(--glass-bg)" : "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          border: darkMode ? "1px solid var(--glass-border)" : "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: darkMode ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)" : "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        },
      },
      MuiOutlinedInput: {
        root: {
          borderRadius: 8,
          backgroundColor: darkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.5)",
          '&:hover $notchedOutline': {
            borderColor: darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          },
          '&$focused $notchedOutline': {
            borderColor: "#7B61FF",
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: darkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
        },
        input: {
          '&::placeholder': {
            color: darkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
            opacity: 1,
          },
        },
      },
      MuiInputLabel: {
        root: {
          color: darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
          '&$focused': {
            color: "#7B61FF",
          },
        },
      },
    },
  });

  const NotFound = () => (
    <div style={{
      minHeight: "70vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "2rem",
    }}>
      <div style={{
        fontSize: "8rem", fontFamily: "'Outfit', sans-serif", fontWeight: 900,
        background: "linear-gradient(135deg, #7B61FF 0%, #FF4D4D 60%, #FFB547 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        lineHeight: 1, marginBottom: "0.5rem",
        filter: "drop-shadow(0 0 40px rgba(123,97,255,0.4))",
      }}>404</div>
      <Typography variant="h5" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, marginBottom: "0.75rem" }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" style={{ opacity: 0.6, maxWidth: 380, marginBottom: "2rem" }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button component={Link} to="/" variant="contained" color="primary" size="large"
        style={{ padding: "10px 32px", fontSize: "1rem" }}>
        ← Back to Marketplace
      </Button>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.palette.background.default }}>
          <Header darkMode={darkMode} setDarkMode={setDarkMode} />
          <main style={{ flex: 1, color: theme.palette.text.primary, display: "flex", flexDirection: "column" }}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/create-nft" component={CreateNFT} />
              <Route path="/my-collection" component={MyCollection} />
              <Route path="/activity" component={Activity} />
              <Route path="/favorites" component={Favorites} />
              <Route path="/creator/:address" component={Creator} />
              <Route path="/nft/:nftId" component={Item} />
              <Route path="/about" component={AboutUs} />
              <Route path="/docs" component={Documentation} />
              <Route path="/stats" component={Stats} />
              <Route path="/create-collection" component={CreateCollection} />
              <Route path="/edit-collection/:id" component={EditCollection} />
              <Route path="/collection/:id" component={CollectionDetail} />
              <Route><NotFound /></Route>
            </Switch>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
