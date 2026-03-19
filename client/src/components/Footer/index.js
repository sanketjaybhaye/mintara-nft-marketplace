import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import TwitterIcon from "@material-ui/icons/Twitter";
import GitHubIcon from "@material-ui/icons/GitHub";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import InstagramIcon from "@material-ui/icons/Instagram";

import { useStyles } from "./styles";
import logo from "../../assets/Logo.svg";

const Footer = () => {
  const classes = useStyles();
  const year = new Date().getFullYear();

  return (
    <footer className={classes.root}>
      <div className={classes.inner}>
        <Grid container spacing={4}>
          {/* Brand & Description */}
          <Grid item xs={12} md={4}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
              <img src={logo} alt="Mintara" className={classes.logo} />
            </div>
            <Typography className={classes.description}>
              The premier decentralized marketplace for discovering, collecting, and trading truly unique digital assets on the blockchain. Empowering creators and collectors alike.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography className={classes.columnTitle}>Marketplace</Typography>
            <div className={classes.linkGroup}>
              <RouterLink to="/" className={classes.link}>Explore</RouterLink>
              <RouterLink to="/create-nft" className={classes.link}>Create NFT</RouterLink>
              <RouterLink to="/activity" className={classes.link}>Activity</RouterLink>
            </div>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} md={2}>
            <Typography className={classes.columnTitle}>Resources</Typography>
            <div className={classes.linkGroup}>
              <RouterLink to="/about" className={classes.link}>About Us</RouterLink>
              <RouterLink to="/docs" className={classes.link}>Documentation</RouterLink>
              <a href="https://github.com/sanketjaybhaye" target="_blank" rel="noopener noreferrer" className={classes.link}>GitHub</a>
            </div>
          </Grid>

          {/* Social connections */}
          <Grid item xs={12} md={4}>
            <Typography className={classes.columnTitle}>Join Our Community</Typography>
            <Typography className={classes.description} style={{ marginBottom: "1rem" }}>
              Stay updated with the latest NFT drops, features, and community announcements.
            </Typography>
            <div className={classes.socialIcons}>
              <IconButton className={classes.iconButton} href="#" target="_blank"><TwitterIcon fontSize="small" /></IconButton>
              <IconButton className={classes.iconButton} href="#" target="_blank"><InstagramIcon fontSize="small" /></IconButton>
              <IconButton className={classes.iconButton} href="https://github.com/sanketjaybhaye" target="_blank"><GitHubIcon fontSize="small" /></IconButton>
              <IconButton className={classes.iconButton} href="https://www.linkedin.com/in/sanket-jaybhaye-96943a31a/" target="_blank"><LinkedInIcon fontSize="small" /></IconButton>
            </div>
          </Grid>
        </Grid>

        <div className={classes.divider} />

        <div className={classes.bottomBar}>
          <Typography className={classes.meta}>
            © {year} Mintara. All rights reserved.
          </Typography>
          <div className={classes.termsLinks}>
            <RouterLink to="/docs" className={classes.link}>Privacy Policy</RouterLink>
            <RouterLink to="/docs" className={classes.link}>Terms of Service</RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

