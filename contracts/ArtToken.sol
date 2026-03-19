// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArtToken is ERC721Enumerable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIds;
  address public marketplace;

  struct Item {
    uint256 id;
    address creator;
    string uri; // metadata url
  }

  mapping(uint256 => Item) public Items;          // tokenId => Item
  mapping(uint256 => uint96) public royaltyBps;   // tokenId => basis points (e.g. 1000 = 10%)

  constructor() ERC721("ArtToken", "ARTK") {}

  /**
   * @dev Mint a new NFT.
   * @param uri          Metadata URL (IPFS / server endpoint)
   * @param _royaltyBps  Creator royalty in basis points (0 – 3000 = 0 – 30%).
   *                     Validated on-chain; cannot exceed 30 %.
   */
  function mint(string memory uri, uint96 _royaltyBps) public returns (uint256) {
    require(_royaltyBps <= 3000, "Royalty cannot exceed 30%");

    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();
    _safeMint(msg.sender, newItemId);
    approve(marketplace, newItemId);

    Items[newItemId] = Item({
      id: newItemId,
      creator: msg.sender,
      uri: uri
    });
    royaltyBps[newItemId] = _royaltyBps;

    return newItemId;
  }

  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");
    return Items[tokenId].uri;
  }

  function setMarketplace(address market) public {
    marketplace = market;
  }
}