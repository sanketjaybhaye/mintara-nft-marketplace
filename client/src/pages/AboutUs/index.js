import React from "react";
import { ThemeProvider, createTheme, makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import sanketImg from "../../assets/myimage.jpeg";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(8, 0),
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    heroSection: {
        textAlign: "center",
        marginBottom: theme.spacing(8),
        position: "relative",
        "&::before": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "300px",
            height: "300px",
            background: "linear-gradient(135deg, rgba(123, 97, 255, 0.4) 0%, rgba(255, 77, 77, 0.1) 100%)",
            filter: "blur(80px)",
            borderRadius: "50%",
            zIndex: -1,
        },
    },
    gradientText: {
        background: "linear-gradient(135deg, #7B61FF 0%, #FF4D4D 60%, #FFB547 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: 900,
        marginBottom: theme.spacing(2),
        fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
        opacity: 0.8,
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
        fontSize: "1.2rem",
        lineHeight: 1.6,
    },
    missionSection: {
        marginBottom: theme.spacing(10),
    },
    missionCard: {
        padding: theme.spacing(4),
        background: theme.palette.type === 'dark' ? "var(--glass-bg)" : "var(--glass-bg)",
        backdropFilter: "blur(12px)",
        border: theme.palette.type === 'dark' ? "1px solid var(--glass-border)" : "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: theme.palette.type === 'dark' ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)" : "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        borderRadius: 24,
        height: "100%",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: theme.palette.type === 'dark' ? "0 12px 40px 0 rgba(123, 97, 255, 0.2)" : "0 12px 40px 0 rgba(123, 97, 255, 0.15)",
        },
    },
    sectionTitle: {
        fontWeight: 700,
        marginBottom: theme.spacing(4),
        fontFamily: "'Outfit', sans-serif",
        textAlign: "center",
    },
    teamSection: {
        marginBottom: theme.spacing(8),
    },
    teamMember: {
        textAlign: "center",
        padding: theme.spacing(3),
    },
    avatarPlaceholder: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4D33E6 0%, #7B61FF 100%)",
        margin: "0 auto",
        marginBottom: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "2.5rem",
        fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        boxShadow: "0 8px 20px rgba(123, 97, 255, 0.4)",
    },
    memberName: {
        fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        marginBottom: theme.spacing(0.5),
    },
    memberRole: {
        opacity: 0.7,
        fontFamily: "'Inter', sans-serif",
        fontSize: "0.9rem",
    }
}));

const AboutUs = () => {
    const classes = useStyles();

    return (
        <Container maxWidth="lg" className={classes.root}>
            {/* Hero Section */}
            <div className={classes.heroSection}>
                <Typography variant="h2" className={classes.gradientText}>
                    Empowering Digital Creators
                </Typography>
                <Typography variant="body1" className={classes.subtitle}>
                    We are building a decentralized ecosystem where artists, collectors, and enthusiasts can connect, discover, and trade truly unique digital assets securely on the blockchain.
                </Typography>
            </div>

            {/* Mission & Vision */}
            <div className={classes.missionSection}>
                <Typography variant="h3" className={classes.sectionTitle}>
                    Our Core Values
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.missionCard} elevation={0}>
                            <CardContent style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
                                <Typography variant="h5" style={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: '1rem' }}>
                                    Creator First
                                </Typography>
                                <Typography variant="body2" style={{ opacity: 0.8, lineHeight: 1.6 }}>
                                    We prioritize tools that give creators maximum control over their art, royalties, and community engagement.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.missionCard} elevation={0}>
                            <CardContent style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                                <Typography variant="h5" style={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: '1rem' }}>
                                    Decentralized Trust
                                </Typography>
                                <Typography variant="body2" style={{ opacity: 0.8, lineHeight: 1.6 }}>
                                    Built completely on smart contracts to ensure fairness, transparency, and immutability for every transaction.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.missionCard} elevation={0}>
                            <CardContent style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                                <Typography variant="h5" style={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", marginBottom: '1rem' }}>
                                    Continuous Innovation
                                </Typography>
                                <Typography variant="body2" style={{ opacity: 0.8, lineHeight: 1.6 }}>
                                    Constantly evolving our platform to support new standards, networks, and features to keep our users ahead.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>

            {/* The Team */}
            <div className={classes.teamSection}>
                <Typography variant="h3" className={classes.sectionTitle}>
                    Meet The Team
                </Typography>
                <Grid container spacing={4} justifyContent="center">
                    {[
                        {
                            name: "Sanket Jaybhaye",
                            role: "Founder & Lead Dev",
                            initials: "SJ"
                        },
                        {
                            name: "Sanket Jaybhaye",
                            role: "Head of Design",
                            initials: "SJ",
                            image: sanketImg
                        },
                        { name: "Sanket Jaybhaye", role: "Smart Contract Engineer", initials: "SJ" }
                    ].map((member, index) => (
                        <Grid item xs={12} sm={4} key={index}>
                            <div className={classes.teamMember}>
                                {member.image ? (
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className={classes.avatarPlaceholder}
                                        style={{ objectFit: "cover", border: "none" }}
                                    />
                                ) : (
                                    <div className={classes.avatarPlaceholder}>{member.initials}</div>
                                )}
                                <Typography variant="h6" className={classes.memberName}>
                                    {member.name}
                                </Typography>
                                <Typography variant="body2" className={classes.memberRole}>
                                    {member.role}
                                </Typography>
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </div>
        </Container>
    );
};

export default AboutUs;
