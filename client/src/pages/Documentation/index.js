import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Paper from "@material-ui/core/Paper";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(6, 0),
        minHeight: "100vh",
    },
    headerBanner: {
        background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
        padding: theme.spacing(6, 4),
        borderRadius: 24,
        marginBottom: theme.spacing(6),
        color: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--glass-bg)",
    },
    headerTitle: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        marginBottom: theme.spacing(1),
        position: "relative",
        zIndex: 2,
        background: "linear-gradient(to right, #ffffff, #a0a0b0)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    headerSubtitle: {
        opacity: 0.8,
        fontFamily: "'Inter', sans-serif",
        maxWidth: 600,
        position: "relative",
        zIndex: 2,
    },
    sidebar: {
        position: "sticky",
        top: 100, // accommodate fixed header
        background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "var(--glass-bg)",
        backdropFilter: "blur(10px)",
        borderRadius: 16,
        border: theme.palette.type === 'dark' ? "1px solid var(--glass-bg)" : "1px solid rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
    },
    navItem: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            background: "rgba(123, 97, 255, 0.1)",
        },
    },
    navItemActive: {
        background: "rgba(123, 97, 255, 0.15)",
        borderRight: "3px solid #7B61FF",
    },
    contentArea: {
        paddingLeft: theme.spacing(4),
        [theme.breakpoints.down('sm')]: {
            paddingLeft: 0,
            marginTop: theme.spacing(4),
        }
    },
    sectionTitle: {
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 700,
        marginBottom: theme.spacing(3),
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    paragraph: {
        fontFamily: "'Inter', sans-serif",
        fontSize: "1.05rem",
        lineHeight: 1.8,
        opacity: 0.85,
        marginBottom: theme.spacing(3),
    },
    codeBlock: {
        fontFamily: "'Fira Code', monospace",
        background: "#1E1E1E",
        color: "#D4D4D4",
        padding: theme.spacing(3),
        borderRadius: 12,
        overflowX: "auto",
        marginBottom: theme.spacing(4),
        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3)",
        border: "1px solid #333",
        "& span.keyword": { color: "#569CD6" },
        "& span.function": { color: "#DCDCAA" },
        "& span.string": { color: "#CE9178" },
        "& span.comment": { color: "#6A9955" },
    },
    highlightBox: {
        background: "rgba(123, 97, 255, 0.05)",
        borderLeft: "4px solid #7B61FF",
        padding: theme.spacing(2, 3),
        borderRadius: "0 8px 8px 0",
        marginBottom: theme.spacing(4),
    }
}));

const Documentation = () => {
    const classes = useStyles();
    const [activeSection, setActiveSection] = useState("getting-started");

    const sections = [
        { id: "getting-started", label: "Getting Started" },
        { id: "smart-contracts", label: "Smart Contracts" },
        { id: "royalties", label: "On-Chain Royalties" },
        { id: "unlockable", label: "Unlockable Content" },
    ];

    return (
        <Container maxWidth="xl" className={classes.root}>
            {/* Header Banner */}
            <div className={classes.headerBanner}>
                <div style={{
                    position: "absolute", top: -50, right: -50, width: 300, height: 300,
                    background: "radial-gradient(circle, rgba(123,97,255,0.4) 0%, rgba(0,0,0,0) 70%)", zIndex: 1
                }} />
                <Typography variant="h3" className={classes.headerTitle}>
                    Developer Documentation
                </Typography>
                <Typography variant="body1" className={classes.headerSubtitle}>
                    Everything you need to know about the deeper technical mechanics of our NFT Marketplace, smart contracts, and features.
                </Typography>
            </div>

            <Grid container>
                {/* Sidebar */}
                <Grid item xs={12} md={3}>
                    <Paper className={classes.sidebar} elevation={0}>
                        <List component="nav" disablePadding>
                            {sections.map((sec, i) => (
                                <React.Fragment key={sec.id}>
                                    <ListItem
                                        className={`${classes.navItem} ${activeSection === sec.id ? classes.navItemActive : ''}`}
                                        onClick={() => setActiveSection(sec.id)}
                                    >
                                        <ListItemText
                                            primary={sec.label}
                                            primaryTypographyProps={{
                                                style: {
                                                    fontWeight: activeSection === sec.id ? 600 : 400,
                                                    color: activeSection === sec.id ? '#7B61FF' : 'inherit'
                                                }
                                            }}
                                        />
                                    </ListItem>
                                    {i < sections.length - 1 && <Divider style={{ opacity: 0.1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Content Area */}
                <Grid item xs={12} md={9} className={classes.contentArea}>

                    {activeSection === "getting-started" && (
                        <div>
                            <Typography variant="h4" className={classes.sectionTitle}>
                                <span style={{ color: '#7B61FF' }}>#</span> Getting Started
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                Welcome to the documentation for our decentralized NFT Marketplace. This platform allows users to mint, list, buy, and interact with non-fungible tokens securely on the Ethereum network.
                            </Typography>
                            <div className={classes.highlightBox}>
                                <Typography variant="body2" style={{ fontFamily: "'Inter', sans-serif", opacity: 0.9 }}>
                                    <strong>Prerequisites:</strong> Node.js (v16+), Truffle/Hardhat, Ganache (for local development), and MetaMask installed on your browser.
                                </Typography>
                            </div>
                            <Typography variant="h5" className={classes.sectionTitle} style={{ marginTop: '2rem', fontSize: '1.5rem' }}>
                                Local Setup
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                To run the marketplace locally, you need to spin up a local blockchain node, compile the contracts, and start the React development server.
                            </Typography>
                            <div className={classes.codeBlock}>
                                <pre style={{ margin: 0 }}>
                                    <span className="comment"># 1. Start Ganache</span><br />
                                    <span className="keyword">npx</span> ganache-cli<br /><br />
                                    <span className="comment"># 2. Compile and Deploy Contracts</span><br />
                                    <span className="keyword">truffle</span> deploy --network development<br /><br />
                                    <span className="comment"># 3. Start Frontend</span><br />
                                    <span className="keyword">cd</span> client<br />
                                    <span className="keyword">npm</span> start
                                </pre>
                            </div>
                        </div>
                    )}

                    {activeSection === "smart-contracts" && (
                        <div>
                            <Typography variant="h4" className={classes.sectionTitle}>
                                <span style={{ color: '#7B61FF' }}>#</span> Smart Contracts Architecture
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                Our platform utilizes two primary smart contracts working in tandem: <strong>ArtToken</strong> and <strong>ArtMarketplace</strong>.
                            </Typography>

                            <Typography variant="h6" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                                1. ArtToken (ERC721)
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                An extension of the OpenZeppelin ERC721 standard. It handles the minting of new tokens, URI storage (IPFS links), and creator royalties mapping.
                            </Typography>

                            <Typography variant="h6" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                                2. ArtMarketplace
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                Manages the listing, buying, and cancelling of marketplace orders. It holds the logic for securely transferring funds and enforcing royalties during secondary sales. It utilizes a ReentrancyGuard for security.
                            </Typography>
                        </div>
                    )}

                    {activeSection === "royalties" && (
                        <div>
                            <Typography variant="h4" className={classes.sectionTitle}>
                                <span style={{ color: '#7B61FF' }}>#</span> On-Chain Royalties
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                Unlike many centralized marketplaces that enforce royalties off-chain, our platform bakes the royalty logic directly into the smart contracts to ensure creators always get paid, regardless of which interface is used to interact with the contract.
                            </Typography>
                            <div className={classes.highlightBox}>
                                <Typography variant="body2" style={{ fontFamily: "'Inter', sans-serif", opacity: 0.9 }}>
                                    Royalties are defined during the initial <code>mint</code> transaction and are permanently attached to the specific Token ID.
                                </Typography>
                            </div>
                            <Typography variant="body1" className={classes.paragraph}>
                                When a secondary sale occurs via the <strong>ArtMarketplace</strong> contract:
                            </Typography>
                            <List style={{ paddingLeft: '1rem', listStyleType: 'disc' }}>
                                <ListItem style={{ display: 'list-item' }}><Typography variant="body2">The contract queries the Token contract for the original creator address and royalty percentage.</Typography></ListItem>
                                <ListItem style={{ display: 'list-item' }}><Typography variant="body2">It calculates the creator cut: <code>(price * basisPoints) / 10000</code>.</Typography></ListItem>
                                <ListItem style={{ display: 'list-item' }}><Typography variant="body2">It automatically routes the calculated cut to the original creator.</Typography></ListItem>
                                <ListItem style={{ display: 'list-item' }}><Typography variant="body2">The remainder is sent to the previous owner (the seller).</Typography></ListItem>
                            </List>
                        </div>
                    )}

                    {activeSection === "unlockable" && (
                        <div>
                            <Typography variant="h4" className={classes.sectionTitle}>
                                <span style={{ color: '#7B61FF' }}>#</span> Unlockable Content
                            </Typography>
                            <Typography variant="body1" className={classes.paragraph}>
                                Unlockable content allows creators to attach secret messages, high-resolution source files, or private links to an NFT. This data is only visible to the cryptographic owner of the item.
                            </Typography>
                            <div className={classes.codeBlock}>
                                <pre style={{ margin: 0 }}>
                                    <span className="comment">// Frontend logic for revealing unlockable content</span><br />
                                    <span className="keyword">const</span> <span className="function">revealSecret</span> = <span className="keyword">async</span> () ={'>'} {'{'}<br />
                                    {'  '}try {'{'}<br />
                                    {'    '}<span className="keyword">const</span> signature = <span className="keyword">await</span> web3.eth.personal.sign(<br />
                                    {'      '}<span className="string">"Sign this message to prove ownership"</span>, <br />
                                    {'      '}account<br />
                                    {'    '});<br />
                                    {'    '}<span className="comment">// Send signature to backend to verify ownership and retrieve secret</span><br />
                                    {'    '}<span className="keyword">const</span> secret = <span className="keyword">await</span> api.reveal(tokenId, signature);<br />
                                    {'  '}{'}'} catch (err) {'{'}<br />
                                    {'    '}console.error(err);<br />
                                    {'  '}{'}'}<br />
                                    {'}'};
                                </pre>
                            </div>
                        </div>
                    )}

                </Grid>
            </Grid>
        </Container>
    );
};

export default Documentation;
