export const ADD_TO_CART = "ADD_TO_CART";
export const REMOVE_FROM_CART = "REMOVE_FROM_CART";
export const CLEAR_CART = "CLEAR_CART";

export const addToCart = (nft) => {
    return {
        type: ADD_TO_CART,
        payload: nft,
    };
};

export const removeFromCart = (tokenId) => {
    return {
        type: REMOVE_FROM_CART,
        payload: tokenId,
    };
};

export const clearCart = () => {
    return {
        type: CLEAR_CART,
    };
};
