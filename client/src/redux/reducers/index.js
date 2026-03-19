import { combineReducers } from "redux";
import { nftReducer, selectedNftReducer } from "./nftReducer";
import { cartReducer } from "./cartReducer";

const reducers = combineReducers({
  allNft: nftReducer,
  nft: selectedNftReducer,
  cart: cartReducer,
});

export default reducers;
