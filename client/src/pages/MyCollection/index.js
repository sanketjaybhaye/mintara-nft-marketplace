import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Web3 from "web3";

import getWeb3 from "../../utils/getWeb3";
import { api } from "../../services/api";

import ArtMarketplace from "../../contracts/ArtMarketplace.json";
import ArtToken from "../../contracts/ArtToken.json";

import {
  setNft,
  setAccount,
  setTokenContract,
  setMarketContract,
} from "../../redux/actions/nftActions";
import Card from "../../components/Card";
import { useFavorites } from "../../hooks/useFavorites";

import { useStyles } from "./styles";

const MyCollection = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const account = useSelector((state) => state.allNft.account);
  const allItems = useSelector((state) => state.allNft.nft);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Live ETH→INR rate
  const [ethToInr, setEthToInr] = useState(null);
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr")
      .then((r) => r.json())
      .then((d) => { if (d?.ethereum?.inr) setEthToInr(d.ethereum.inr); })
      .catch(() => { });
  }, []);

  useEffect(() => {
    let itemsList = [];
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();

        if (typeof accounts === undefined) {
          alert("Please login with Metamask!");
          console.log("login to metamask");
        }

        const networkId = await web3.eth.net.getId();
        try {
          const artTokenContract = new web3.eth.Contract(
            ArtToken.abi,
            ArtToken.networks[networkId].address
          );
          const marketplaceContract = new web3.eth.Contract(
            ArtMarketplace.abi,
            ArtMarketplace.networks[networkId].address
          );
          const totalSupply = await artTokenContract.methods
            .totalSupply()
            .call();
          const totalItemsForSale = await marketplaceContract.methods
            .totalItemsForSale()
            .call();

          for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
            const item = await artTokenContract.methods.Items(tokenId).call();
            const owner = await artTokenContract.methods.ownerOf(tokenId).call();

            const response = await api
              .get(`/tokens/${tokenId}`)
              .catch((err) => {
                console.log("Err: ", err);
              });

            itemsList.push({
              name: response.data.name,
              description: response.data.description,
              image: response.data.image,
              tokenId: item.id,
              creator: item.creator,
              owner: owner,
              uri: item.uri,
              isForSale: false,
              saleId: null,
              price: 0,
              isSold: null,
            });
          }

          if (totalItemsForSale > 0) {
            for (let saleId = 0; saleId < totalItemsForSale; saleId++) {
              const item = await marketplaceContract.methods
                .itemsForSale(saleId)
                .call();
              const active = await marketplaceContract.methods
                .activeItems(item.tokenId)
                .call();

              const itemListIndex = itemsList.findIndex(
                (i) => i.tokenId === item.tokenId
              );

              itemsList[itemListIndex] = {
                ...itemsList[itemListIndex],
                isForSale: active,
                saleId: item.id,
                price: item.price,
                isSold: item.isSold,
              };
            }
          }

          dispatch(setAccount(accounts[0]));
          dispatch(setTokenContract(artTokenContract));
          dispatch(setMarketContract(marketplaceContract));
          dispatch(setNft(itemsList));
        } catch (error) {
          console.error("Error", error);
          alert(
            "Contracts not deployed to the current network " +
            networkId.toString()
          );
        }
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.` +
          error
        );
        console.error(error);
      }
    };
    if (!allItems || allItems.length === 0 || !account) {
      init();
    }
  }, [dispatch, allItems, account]);

  const ownedItems = (allItems || []).filter(
    (item) => account && item.owner.toLowerCase() === account.toLowerCase()
  );

  // Portfolio value — sum of prices of owned for-sale NFTs
  const portfolioEth = useMemo(() => {
    return ownedItems.reduce((sum, item) => {
      if (!item.isForSale || !item.price || item.price === "0") return sum;
      return sum + Number(Web3.utils.fromWei(String(item.price), "ether"));
    }, 0);
  }, [ownedItems]);
  const portfolioInr = ethToInr ? (portfolioEth * ethToInr).toLocaleString("en-IN", { maximumFractionDigits: 0 }) : null;

  return (
    <div className={classes.root}>
      <div className={`${classes.headerRow} glass`} style={{ padding: "1rem 2rem", borderRadius: "16px", flexWrap: "wrap", gap: "0.75rem" }}>
        <Typography className={classes.title}>My collection</Typography>
        {account && (
          <Typography variant="subtitle1">
            Connected wallet: {account.slice(0, 7)}...{account.slice(-4)}
          </Typography>
        )}
        {/* Portfolio Value */}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <Tooltip title={portfolioInr ? `≈ ₹${portfolioInr} INR` : "Only for-sale NFTs are counted"} placement="bottom">
            <div style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "flex-end",
              padding: "0.5rem 1rem",
              background: "rgba(123,97,255,0.1)",
              border: "1px solid rgba(123,97,255,0.25)",
              borderRadius: 12,
              cursor: "default",
            }}>
              <Typography variant="caption" style={{ opacity: 0.55, lineHeight: 1 }}>Portfolio Value</Typography>
              <Typography variant="subtitle1" style={{ fontWeight: 700, color: "#7B61FF", lineHeight: 1.4 }}>
                {portfolioEth.toFixed(4)} ETH
              </Typography>
              {portfolioInr && (
                <Typography variant="caption" style={{ opacity: 0.6 }}>≈ ₹{portfolioInr} INR</Typography>
              )}
            </div>
          </Tooltip>
        </div>
      </div>
      {ownedItems.length === 0 ? (
        <Typography className={classes.emptyState}>
          You do not own any NFTs yet. Mint a new piece on the home page to see
          it here.
        </Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          {ownedItems.map((nft) => (
            <Grid item key={nft.tokenId}>
              <Card
                {...nft}
                account={account}
                isFavorite={isFavorite(nft.tokenId)}
                onToggleFavorite={toggleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default MyCollection;

