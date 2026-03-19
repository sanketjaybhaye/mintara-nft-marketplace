import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import Web3 from "web3";
import { removeFromCart, clearCart } from "../../redux/actions/cartActions";
import MediaViewer from "../MediaViewer";

const CartDrawer = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart?.cartItems || []);
    const marketplaceContract = useSelector((state) => state.allNft.marketplaceContract);
    const account = useSelector((state) => state.allNft.account);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const totalWei = cartItems.reduce((acc, item) => {
        const val = Web3.utils.toBN(item.price || "0");
        return acc.add(val);
    }, Web3.utils.toBN("0"));

    const totalEth = Web3.utils.fromWei(totalWei, "ether");

    const handleCheckout = async () => {
        if (!marketplaceContract || !account) {
            setError("Wallet not connected.");
            return;
        }
        if (cartItems.length === 0) return;

        setLoading(true);
        setError("");

        try {
            const saleIds = cartItems.map(item => item.saleId);
            await marketplaceContract.methods.buyBatch(saleIds).send({
                from: account,
                value: totalWei.toString(),
                gas: 3000000,
            });

            // Clear cart on success
            dispatch(clearCart());
            onClose();
            // Optionally reload the page to refresh UI state
            window.location.reload();
        } catch (err) {
            console.error("Cart Checkout Error:", err);
            const errMsg = err.message ? (err.message.length > 150 ? err.message.substring(0, 150) + "..." : err.message) : "Transaction failed. Make sure you have enough ETH and the contract is updated.";
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                style: {
                    width: 360,
                    background: "rgba(15,15,20,0.97)",
                    backdropFilter: "blur(24px)",
                    borderLeft: "1px solid var(--glass-bg-hover)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <Typography style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#fff" }}>
                    🛒 Shopping Cart
                </Typography>
                <IconButton size="small" onClick={onClose} style={{ color: "var(--text-muted)" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            {cartItems.length === 0 ? (
                <Typography style={{ opacity: 0.5, textAlign: "center", marginTop: "4rem", color: "#fff" }}>
                    Your cart is empty.
                </Typography>
            ) : (
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
                    {cartItems.map((item) => (
                        <div key={item.tokenId} style={{
                            display: "flex", gap: "1rem", alignItems: "center", padding: "0.75rem",
                            background: "var(--glass-bg)", borderRadius: 12, border: "1px solid var(--glass-border)"
                        }}>
                            <div style={{ width: 60, height: 60, flexShrink: 0 }}>
                                <MediaViewer src={item.image} alt={item.name} style={{ width: "100%", height: "100%", borderRadius: 8 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Typography style={{ fontWeight: 600, color: "#fff", fontSize: "0.95rem" }}>{item.name}</Typography>
                                <Typography style={{ color: "#7B61FF", fontWeight: 700, fontSize: "0.85rem" }}>
                                    {Web3.utils.fromWei(String(item.price || "0"), "ether")} ETH
                                </Typography>
                            </div>
                            <IconButton size="small" onClick={() => dispatch(removeFromCart(item.tokenId))} style={{ color: "#FF4D4D" }}>
                                <DeleteOutlineIcon />
                            </IconButton>
                        </div>
                    ))}
                </div>
            )}

            {cartItems.length > 0 && (
                <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <Typography style={{ color: "#fff", fontWeight: 700 }}>Total:</Typography>
                        <Typography style={{ color: "#7B61FF", fontWeight: 700, fontSize: "1.2rem" }}>
                            {totalEth} ETH
                        </Typography>
                    </div>
                    {error && <Typography style={{ color: "#FF4D4D", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{error}</Typography>}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                        onClick={handleCheckout}
                        style={{ fontWeight: 700, padding: "12px 0", background: "#7B61FF", color: "#fff" }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : `Buy ${cartItems.length} items`}
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default CartDrawer;
