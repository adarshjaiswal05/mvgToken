/* eslint-disable */

const { BigNumber } = require('@ethersproject/bignumber')
const chai = require('chai')
const { expect, bignumber, assert } = chai
const { ethers, network } = require('hardhat')
const { solidity } = require('ethereum-waffle')
chai.use(solidity)

let mvgtoken
let owner
let addr1
let addr2
let addrs
describe('Middleverse gold token', () => {
	beforeEach(async () => {
		;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

		const MVGToken = await ethers.getContractFactory('MVGToken')

		mvgtoken = await MVGToken.deploy()
		await mvgtoken.deployed()
	})

	describe('token attributes', () => {
		it('has the correct name', async function () {
			expect(await mvgtoken.name()).to.equal('Middleverse Gold')
		})

		it('has the correct symbol', async function () {
			expect(await mvgtoken.symbol()).to.equal('MVG')
		})

		it('has the correct decimals', async function () {
			expect(await mvgtoken.decimals()).to.equal(18)
		})
  });
  describe("Deployment", function () {
          
    it("Should set the right owner", async function () {

      expect(await mvgtoken.owner()).to.equal(owner.address);
    });
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await mvgtoken.balanceOf(owner.address);
      expect(await mvgtoken.totalSupply()).to.equal(ownerBalance);
    });
  });
      
  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await mvgtoken.transfer(addr1.address, 50);
      const addr1Balance = await mvgtoken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await mvgtoken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await mvgtoken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  
    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await mvgtoken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
      mvgtoken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await mvgtoken.balanceOf(owner.address)).to.equal(
      initialOwnerBalance);
    });
  });              
});   