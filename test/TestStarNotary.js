const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    const instance = await StarNotary.deployed();
    const name = await instance.name.call();
    const symbol = await instance.symbol.call();
    assert.equal(name, 'Star token');
    assert.equal(symbol, 'STAR');
});

it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    // 1. create 2 Stars with different tokenId
    const starId1 = 6;
    const starId2 = 7;
    await instance.createStar('user1 star', starId1, {from: user1});
    await instance.createStar('user2 star', starId2, {from: user2});
    assert.equal(await instance.ownerOf.call(starId1), user1);
    assert.equal(await instance.ownerOf.call(starId2), user2);
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2, {from: user1});
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(starId1), user2);
    assert.equal(await instance.ownerOf.call(starId2), user1);
});

it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    // 1. create a Star with different tokenId
    const starId = 8;
    await instance.createStar('user1 star', starId, {from: user1});
    assert.equal(await instance.ownerOf.call(starId), user1);
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId, {from: user1});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    // 1. create a Star with different tokenId
    const starId = 9;
    const starName = 'Arcturus';
    await instance.createStar(starName, starId, {from: user1});
    // 2. Call your method lookUptokenIdToStarInfo
    const starInfo = await instance.lookUptokenIdToStarInfo.call(starId);
    // 3. Verify if you Star name is the same
    assert.equal(starInfo, starName);
});