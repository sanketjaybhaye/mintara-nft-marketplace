// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ArtToken.sol";

contract ArtMarketplace {
  ArtToken private token;

  struct ItemForSale {
    uint256 id;
    uint256 tokenId;
    address payable seller;
    uint256 price;
    bool isSold;
  }

  struct Offer {
    uint256 tokenId;
    address payable bidder;
    uint256 price;
    bool active;
  }

  ItemForSale[] public itemsForSale;
  mapping(uint256 => bool) public activeItems; // tokenId => active?
  mapping(uint256 => Offer) public highestOffers; // tokenId => active highest offer

  event itemAddedForSale(uint256 id, uint256 tokenId, uint256 price);
  event itemSold(uint256 id, address buyer, uint256 price);
  event itemCanceled(uint256 id, uint256 tokenId);
  event itemPriceUpdated(uint256 id, uint256 tokenId, uint256 newPrice);
  event royaltyPaid(uint256 tokenId, address creator, uint256 amount); // NEW

  event OfferMade(uint256 tokenId, address bidder, uint256 price);
  event OfferCanceled(uint256 tokenId, address bidder, uint256 price);
  event OfferAccepted(uint256 tokenId, address bidder, address seller, uint256 price);

  constructor(ArtToken _token) {
    token = _token;
  }

  modifier OnlyItemOwner(uint256 tokenId) {
    require(token.ownerOf(tokenId) == msg.sender, "Sender does not own the item");
    _;
  }

  modifier HasTransferApproval(uint256 tokenId) {
    require(token.getApproved(tokenId) == address(this), "Market is not approved");
    _;
  }

  modifier ItemExists(uint256 id) {
    require(id < itemsForSale.length && itemsForSale[id].id == id, "Could not find item");
    _;
  }

  modifier IsForSale(uint256 id) {
    require(!itemsForSale[id].isSold, "Item is already sold");
    _;
  }

  function putItemForSale(uint256 tokenId, uint256 price)
    OnlyItemOwner(tokenId)
    HasTransferApproval(tokenId)
    external
    returns (uint256)
  {
    require(!activeItems[tokenId], "Item is already up for sale");

    uint256 newItemId = itemsForSale.length;
    itemsForSale.push(ItemForSale({
      id: newItemId,
      tokenId: tokenId,
      seller: payable(msg.sender),
      price: price,
      isSold: false
    }));
    activeItems[tokenId] = true;

    assert(itemsForSale[newItemId].id == newItemId);
    emit itemAddedForSale(newItemId, tokenId, price);
    return newItemId;
  }

  /**
   * @dev Buy an NFT.
   *      Automatically splits the payment:
   *        - royaltyBps (stored per-token in ArtToken) goes to the original creator
   *        - remainder goes to the current seller
   *
   *      Royalty is NOT paid when creator == seller (creator reselling their own work).
   */
  function buyItem(uint256 id)
    ItemExists(id)
    IsForSale(id)
    HasTransferApproval(itemsForSale[id].tokenId)
    payable
    external
  {
    require(msg.value >= itemsForSale[id].price, "Not enough funds sent");
    require(msg.sender != itemsForSale[id].seller, "Seller cannot buy own item");

    uint256 tokenId = itemsForSale[id].tokenId;

    itemsForSale[id].isSold = true;
    activeItems[tokenId] = false;
    token.safeTransferFrom(itemsForSale[id].seller, msg.sender, tokenId);

    // ── Royalty split ───────────────────────────────────────────────────────
    uint96  bps = token.royaltyBps(tokenId);
    (, address creator,) = token.Items(tokenId); // destructure tuple: (id, creator, uri)
    uint256 royaltyAmount = 0;

    // Only pay royalty if: royalty > 0 AND this is a secondary sale (creator != seller)
    if (bps > 0 && creator != itemsForSale[id].seller) {
      royaltyAmount = (msg.value * uint256(bps)) / 10000;
      payable(creator).transfer(royaltyAmount);
      emit royaltyPaid(tokenId, creator, royaltyAmount);
    }

    // Remainder goes to seller
    itemsForSale[id].seller.transfer(msg.value - royaltyAmount);

    emit itemSold(id, msg.sender, itemsForSale[id].price);
  }

  /**
   * @dev Batch buy multiple NFTs in a single transaction.
   *      Saves significant gas compared to buying one by one.
   */
  function buyBatch(uint256[] calldata ids) external payable {
    uint256 totalPrice = 0;
    
    // First pass: verify all items are valid, for sale, calculate total price
    for (uint256 i = 0; i < ids.length; i++) {
        uint256 id = ids[i];
        require(id < itemsForSale.length && itemsForSale[id].id == id, "Could not find item");
        require(!itemsForSale[id].isSold, "Item is already sold");
        require(token.getApproved(itemsForSale[id].tokenId) == address(this), "Market is not approved");
        require(msg.sender != itemsForSale[id].seller, "Seller cannot buy own item");
        
        totalPrice += itemsForSale[id].price;
    }
    
    require(msg.value >= totalPrice, "Not enough funds sent for batch buy");
    
    // Second pass: execute transfers and payouts
    for (uint256 i = 0; i < ids.length; i++) {
        uint256 id = ids[i];
        uint256 tokenId = itemsForSale[id].tokenId;
        uint256 price = itemsForSale[id].price;
        address payable seller = itemsForSale[id].seller;

        itemsForSale[id].isSold = true;
        activeItems[tokenId] = false;
        token.safeTransferFrom(seller, msg.sender, tokenId);

        // Royalty split
        uint96 bps = token.royaltyBps(tokenId);
        (, address creator,) = token.Items(tokenId);
        uint256 royaltyAmount = 0;

        if (bps > 0 && creator != seller) {
            royaltyAmount = (price * uint256(bps)) / 10000;
            payable(creator).transfer(royaltyAmount);
            emit royaltyPaid(tokenId, creator, royaltyAmount);
        }

        // Remainder goes to seller
        seller.transfer(price - royaltyAmount);

        emit itemSold(id, msg.sender, price);
    }
    
    // Refund excess ETH back to buyer if any
    if (msg.value > totalPrice) {
        payable(msg.sender).transfer(msg.value - totalPrice);
    }
  }

  function cancelItemSale(uint256 id)
    ItemExists(id)
    IsForSale(id)
    external
  {
    require(msg.sender == itemsForSale[id].seller, "Only seller can cancel");
    itemsForSale[id].isSold = true;
    activeItems[itemsForSale[id].tokenId] = false;
    emit itemCanceled(id, itemsForSale[id].tokenId);
  }

  function updateItemPrice(uint256 id, uint256 newPrice)
    ItemExists(id)
    IsForSale(id)
    external
  {
    require(msg.sender == itemsForSale[id].seller, "Only seller can update price");
    require(newPrice > 0, "Price must be greater than 0");
    itemsForSale[id].price = newPrice;
    emit itemPriceUpdated(id, itemsForSale[id].tokenId, newPrice);
  }

  function totalItemsForSale() external view returns (uint256) {
    return itemsForSale.length;
  }

  /**
   * @dev Preview how much royalty and seller payment will be made for a given sale.
   *      Useful for the frontend to display "You will receive X ETH after royalty".
   */
  function getRoyaltyInfo(uint256 tokenId, uint256 salePrice)
    external
    view
    returns (address creator, uint96 bps, uint256 royaltyAmount, uint256 sellerAmount)
  {
    (, address _creator,) = token.Items(tokenId); // destructure tuple: (id, creator, uri)
    creator       = _creator;
    bps           = token.royaltyBps(tokenId);
    royaltyAmount = bps > 0 ? (salePrice * uint256(bps)) / 10000 : 0;
    sellerAmount  = salePrice - royaltyAmount;
  }

  /**
   * @dev Make an offer on any NFT.
   */
  function makeOffer(uint256 tokenId)
    external
    payable
  {
    require(msg.value > 0, "Offer must be greater than 0");
    require(msg.sender != token.ownerOf(tokenId), "Owner cannot make an offer");
    
    Offer memory currentOffer = highestOffers[tokenId];
    require(msg.value > currentOffer.price || !currentOffer.active, "Offer must be higher than current active offer");

    // Refund previous bidder if there is an active offer
    if (currentOffer.active && currentOffer.price > 0) {
      currentOffer.bidder.transfer(currentOffer.price);
    }

    highestOffers[tokenId] = Offer({
      tokenId: tokenId,
      bidder: payable(msg.sender),
      price: msg.value,
      active: true
    });

    emit OfferMade(tokenId, msg.sender, msg.value);
  }

  /**
   * @dev Cancel the highest active offer.
   */
  function cancelOffer(uint256 tokenId)
    external
  {
    Offer storage currentOffer = highestOffers[tokenId];
    require(currentOffer.active, "No active offer");
    require(currentOffer.bidder == msg.sender, "Only the highest bidder can cancel");

    currentOffer.active = false;
    uint256 refundAmount = currentOffer.price;
    currentOffer.bidder.transfer(refundAmount);

    emit OfferCanceled(tokenId, msg.sender, refundAmount);
  }

  /**
   * @dev Accept the highest active offer. Only the owner can call this.
   */
  function acceptOffer(uint256 tokenId)
    OnlyItemOwner(tokenId)
    HasTransferApproval(tokenId)
    external
  {
    Offer storage currentOffer = highestOffers[tokenId];
    require(currentOffer.active, "No active offer to accept");

    address payable seller = payable(msg.sender);
    address bidder = currentOffer.bidder;
    uint256 price = currentOffer.price;

    currentOffer.active = false;

    // If item was listed for sale, delist it
    if (activeItems[tokenId]) {
        activeItems[tokenId] = false;
        for (uint256 i = 0; i < itemsForSale.length; i++) {
            if (itemsForSale[i].tokenId == tokenId && !itemsForSale[i].isSold) {
                itemsForSale[i].isSold = true;
                break;
            }
        }
    }

    token.safeTransferFrom(seller, bidder, tokenId);

    // ── Royalty split ───────────────────────────────────────────────────────
    uint96 bps = token.royaltyBps(tokenId);
    (, address creator,) = token.Items(tokenId);
    uint256 royaltyAmount = 0;

    // Only pay royalty if: royalty > 0 AND this is a secondary sale (creator != seller)
    if (bps > 0 && creator != seller) {
      royaltyAmount = (price * uint256(bps)) / 10000;
      payable(creator).transfer(royaltyAmount);
      emit royaltyPaid(tokenId, creator, royaltyAmount);
    }

    // Remainder goes to seller
    seller.transfer(price - royaltyAmount);

    emit OfferAccepted(tokenId, bidder, seller, price);
  }
}
