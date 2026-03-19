import { ADD_TO_CART, REMOVE_FROM_CART, CLEAR_CART } from "../actions/cartActions";

const initialState = {
    cartItems: [],
};

export const cartReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case ADD_TO_CART:
            // Prevent duplicates
            const exists = state.cartItems.find(item => item.tokenId === payload.tokenId);
            if (exists) return state;
            return {
                ...state,
                cartItems: [...state.cartItems, payload],
            };
        case REMOVE_FROM_CART:
            return {
                ...state,
                cartItems: state.cartItems.filter(item => item.tokenId !== payload),
            };
        case CLEAR_CART:
            return {
                ...state,
                cartItems: [],
            };
        default:
            return state;
    }
};
