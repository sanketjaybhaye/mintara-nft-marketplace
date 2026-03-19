const ArtToken = artifacts.require("ArtToken");
const ArtMarketplace = artifacts.require("ArtMarketplace");

contract("Batch Buying", (accounts) => {
    let token;
    let marketplace;
    const [owner, creator1, creator2, buyer] = accounts;

    before(async () => {
        token = await ArtToken.new();
        marketplace = await ArtMarketplace.new(token.address);
        await token.setMarketplace(marketplace.address);
    });

    describe("Batch Buying Multiple NFTs", () => {
        let tokenId1;
        let tokenId2;
        let saleId1;
        let saleId2;
        const price1 = web3.utils.toWei("1", "ether");
        const price2 = web3.utils.toWei("2", "ether");

        before(async () => {
            // Mint token 1 (10% royalty)
            const receipt1 = await token.mint("https://example.com/nft1", 1000, { from: creator1 });
            tokenId1 = receipt1.logs[0].args.tokenId.toNumber();
            await token.approve(marketplace.address, tokenId1, { from: creator1 });
            const listReceipt1 = await marketplace.putItemForSale(tokenId1, price1, { from: creator1 });
            saleId1 = listReceipt1.logs[0].args.id.toNumber();

            // Mint token 2 (5% royalty)
            const receipt2 = await token.mint("https://example.com/nft2", 500, { from: creator2 });
            tokenId2 = receipt2.logs[0].args.tokenId.toNumber();
            await token.transferFrom(creator2, owner, tokenId2, { from: creator2 }); // Secondary sale
            await token.approve(marketplace.address, tokenId2, { from: owner });
            const listReceipt2 = await marketplace.putItemForSale(tokenId2, price2, { from: owner });
            saleId2 = listReceipt2.logs[0].args.id.toNumber();
        });

        it("should successfully batch buy multiple NFTs and split royalties", async () => {
            const totalPrice = web3.utils.toBN(price1).add(web3.utils.toBN(price2));

            const initialCreator1Balance = web3.utils.toBN(await web3.eth.getBalance(creator1));
            const initialCreator2Balance = web3.utils.toBN(await web3.eth.getBalance(creator2));
            const initialOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));

            // Execute batch buy
            await marketplace.buyBatch([saleId1, saleId2], { from: buyer, value: totalPrice });

            // Verify ownership
            assert.equal(await token.ownerOf(tokenId1), buyer, "Buyer should own token 1");
            assert.equal(await token.ownerOf(tokenId2), buyer, "Buyer should own token 2");

            // Verify items are no longer for sale
            const item1 = await marketplace.itemsForSale(saleId1);
            const item2 = await marketplace.itemsForSale(saleId2);
            assert.equal(item1.isSold, true, "Item 1 should be sold");
            assert.equal(item2.isSold, true, "Item 2 should be sold");

            // Royalty calculations
            // Token 1: 1 ETH, 0% royalty (because creator is seller)
            // Token 2: 2 ETH, 5% royalty (creator2 is creator, owner is seller)

            // Expected balances
            const newCreator1Balance = web3.utils.toBN(await web3.eth.getBalance(creator1));
            // creator1 should get 1 ETH total
            assert.equal(newCreator1Balance.sub(initialCreator1Balance).toString(), price1.toString(), "Creator1 should receive full price (no royalty on primary)");

            const newCreator2Balance = web3.utils.toBN(await web3.eth.getBalance(creator2));
            const royalty2 = web3.utils.toBN(price2).mul(web3.utils.toBN(500)).div(web3.utils.toBN(10000));
            assert.equal(newCreator2Balance.sub(initialCreator2Balance).toString(), royalty2.toString(), "Creator2 should receive 5% royalty");

            const newOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));
            const ownerProceeds = web3.utils.toBN(price2).sub(royalty2);
            assert.equal(newOwnerBalance.sub(initialOwnerBalance).toString(), ownerProceeds.toString(), "Owner should receive sale price minus royalty");
        });

        it("should reject batch buy if funds are insufficient", async () => {
            const price = web3.utils.toWei("1", "ether");

            // Re-setup items
            const r1 = await token.mint("https://example.com/nftx", 0, { from: creator1 });
            const t1 = r1.logs[0].args.tokenId.toNumber();
            await token.approve(marketplace.address, t1, { from: creator1 });
            const lr1 = await marketplace.putItemForSale(t1, price, { from: creator1 });
            const s1 = lr1.logs[0].args.id.toNumber();

            const r2 = await token.mint("https://example.com/nfty", 0, { from: creator2 });
            const t2 = r2.logs[0].args.tokenId.toNumber();
            await token.approve(marketplace.address, t2, { from: creator2 });
            const lr2 = await marketplace.putItemForSale(t2, price, { from: creator2 });
            const s2 = lr2.logs[0].args.id.toNumber();

            const insufficientFunds = web3.utils.toBN(price).add(web3.utils.toBN(price)).sub(web3.utils.toBN("1"));

            try {
                await marketplace.buyBatch([s1, s2], { from: buyer, value: insufficientFunds });
                assert.fail("Should have thrown error");
            } catch (error) {
                assert(error.message.includes("Not enough funds sent for batch buy"), "Expected insufficient funds error");
            }
        });
    });
});
