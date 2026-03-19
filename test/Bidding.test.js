const ArtToken = artifacts.require("ArtToken");
const ArtMarketplace = artifacts.require("ArtMarketplace");

contract("Bidding & Offers", (accounts) => {
    let token;
    let marketplace;
    const [owner, creator, bidder1, bidder2] = accounts;

    before(async () => {
        token = await ArtToken.new();
        marketplace = await ArtMarketplace.new(token.address);
        await token.setMarketplace(marketplace.address);
    });

    describe("Making Offers", () => {
        let tokenId;

        before(async () => {
            // Mint a new token with 10% royalty
            const receipt = await token.mint("https://example.com/nft", 1000, { from: creator });
            tokenId = receipt.logs[0].args.tokenId.toNumber();
            // Transfer to owner (secondary sale simulation)
            await token.transferFrom(creator, owner, tokenId, { from: creator });
        });

        it("should allow a user to make an offer", async () => {
            const offerPrice = web3.utils.toWei("1", "ether");
            await marketplace.makeOffer(tokenId, { from: bidder1, value: offerPrice });

            const offer = await marketplace.highestOffers(tokenId);
            assert.equal(offer.bidder, bidder1, "Bidder should be bidder1");
            assert.equal(offer.price.toString(), offerPrice, "Offer price should match");
            assert.equal(offer.active, true, "Offer should be active");
        });

        it("should reject an offer that is lower or equal to the current offer", async () => {
            const lowerPrice = web3.utils.toWei("0.5", "ether");
            try {
                await marketplace.makeOffer(tokenId, { from: bidder2, value: lowerPrice });
                assert.fail("Should have thrown an error");
            } catch (err) {
                assert(err.message.includes("Offer must be higher than current active offer"), "Expected higher offer error");
            }
        });

        it("should refund the previous bidder when a higher offer is placed", async () => {
            const higherPrice = web3.utils.toWei("2", "ether");

            const initialBalanceBidder1 = web3.utils.toBN(await web3.eth.getBalance(bidder1));

            await marketplace.makeOffer(tokenId, { from: bidder2, value: higherPrice });

            const newBalanceBidder1 = web3.utils.toBN(await web3.eth.getBalance(bidder1));

            // Bidder1 should have received their 1 ETH back
            const refundAmount = web3.utils.toBN(web3.utils.toWei("1", "ether"));
            assert.equal(newBalanceBidder1.sub(initialBalanceBidder1).toString(), refundAmount.toString(), "Bidder1 should be refunded");
        });

        it("should allow a bidder to cancel their offer", async () => {
            // Current highest offer is from bidder2 for 2 ETH
            const initialBalanceBidder2 = web3.utils.toBN(await web3.eth.getBalance(bidder2));

            const tx = await marketplace.cancelOffer(tokenId, { from: bidder2 });
            const gasUsed = web3.utils.toBN(tx.receipt.gasUsed);
            const txDetails = await web3.eth.getTransaction(tx.tx);
            const gasPrice = web3.utils.toBN(txDetails.gasPrice);
            const gasCost = gasUsed.mul(gasPrice);

            const newBalanceBidder2 = web3.utils.toBN(await web3.eth.getBalance(bidder2));

            // Bidder2 should get 2 ETH back minus gas costs
            const refundAmount = web3.utils.toBN(web3.utils.toWei("2", "ether"));
            assert.equal(newBalanceBidder2.toString(), initialBalanceBidder2.add(refundAmount).sub(gasCost).toString(), "Bidder2 should be refunded minus gas");

            const offer = await marketplace.highestOffers(tokenId);
            assert.equal(offer.active, false, "Offer should no longer be active");
        });

        it("should allow the owner to accept an active offer with royalty splits", async () => {
            // bidder1 makes a new 2 ETH offer
            const offerPrice = web3.utils.toWei("2", "ether");
            await marketplace.makeOffer(tokenId, { from: bidder1, value: offerPrice });

            // Owner must approve marketplace
            await token.approve(marketplace.address, tokenId, { from: owner });

            const initialCreatorBalance = web3.utils.toBN(await web3.eth.getBalance(creator));
            const initialOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));

            const tx = await marketplace.acceptOffer(tokenId, { from: owner });
            const gasUsed = web3.utils.toBN(tx.receipt.gasUsed);
            const txDetails = await web3.eth.getTransaction(tx.tx);
            const gasPrice = web3.utils.toBN(txDetails.gasPrice);
            const gasCost = gasUsed.mul(gasPrice);

            // Verify Ownership Transferred
            const newOwner = await token.ownerOf(tokenId);
            assert.equal(newOwner, bidder1, "Token should be transferred to bidder1");

            // Verify Royalty (10% of 2 ETH = 0.2 ETH)
            const royaltyAmount = web3.utils.toBN(web3.utils.toWei("0.2", "ether"));
            const newCreatorBalance = web3.utils.toBN(await web3.eth.getBalance(creator));
            assert.equal(newCreatorBalance.sub(initialCreatorBalance).toString(), royaltyAmount.toString(), "Creator should get 10% royalty");

            // Verify Owner Payment (2 ETH - 0.2 ETH = 1.8 ETH)
            const ownerPayment = web3.utils.toBN(web3.utils.toWei("1.8", "ether"));
            const newOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));
            assert.equal(newOwnerBalance.toString(), initialOwnerBalance.add(ownerPayment).sub(gasCost).toString(), "Owner should get remaining funds minus gas");

            // Verify offer is inactive
            const offer = await marketplace.highestOffers(tokenId);
            assert.equal(offer.active, false, "Offer should be deactivated after acceptance");
        });
    });
});
