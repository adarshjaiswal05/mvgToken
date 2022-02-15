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
describe('ERC20Votes', () => {
	beforeEach(async () => {
		;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

		const MVGToken = await ethers.getContractFactory('MVGToken')

		mvgtoken = await MVGToken.deploy()
		await mvgtoken.deployed()
	});
    describe('balanceOf', function () {
            it('grants to initial account', async function () {
              expect(await mvgtoken.balanceOf(owner.address)).to.be.equal('500000000000000000000000000');
            });
          });
    describe('numCheckpoints', function () {
        let recipient= addrs;
        it('returns the number of checkpoints for a delegate', async function () {
            await mvgtoken.transfer(recipient, '100', { from: owner }); //give an account a few tokens for readability
            expect(await mvgtoken.numCheckpoints(addr1.address)).to.be.equal('0');
    
            const t1 = await mvgtoken.delegate(addr1.address, { from: recipient });
            expect(await mvgtoken.numCheckpoints(addr1.address)).to.be.equal('1');
    
            const t2 = await mvgtoken.transfer(addr2.address, 10, { from: recipient });
            expect(await mvgtoken.numCheckpoints(addr1.address)).to.be.equal('2');
    
            const t3 = await mvgtoken.transfer(addr2.address, 10, { from: recipient });
            expect(await mvgtoken.numCheckpoints(addr1.address)).to.be.equal('3');
    
            const t4 = await mvgtoken.transfer(recipient, 20, { from: owner });
            expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('4');
    
            expect(await mvgtoken.checkpoints(addr1, 0)).to.be.deep.equal([ t1.receipt.blockNumber.toString(), '100' ]);
            expect(await mvgtoken.checkpoints(addr1, 1)).to.be.deep.equal([ t2.receipt.blockNumber.toString(), '90' ]);
            expect(await mvgtoken.checkpoints(addr1, 2)).to.be.deep.equal([ t3.receipt.blockNumber.toString(), '80' ]);
            expect(await mvgtoken.checkpoints(addr1, 3)).to.be.deep.equal([ t4.receipt.blockNumber.toString(), '100' ]);
    
            await time.advanceBlock();
            expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber)).to.be.bignumber.equal('100');
            expect(await mvgtoken.getPastVotes(addr1, t2.receipt.blockNumber)).to.be.bignumber.equal('90');
            expect(await mvgtoken.getPastVotes(addr1, t3.receipt.blockNumber)).to.be.bignumber.equal('80');
            expect(await mvgtoken.getPastVotes(addr1, t4.receipt.blockNumber)).to.be.bignumber.equal('100');
        });
    
        it('does not add more than one checkpoint in a block', async function () {
            await mvgtoken.transfer(recipient, '100', { from: owner });
            expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('0');
    
            const [ t1, t2, t3 ] = await batchInBlock([
            () => mvgtoken.delegate(addr1, { from: recipient, gas: 100000 }),
            () => mvgtoken.transfer(addr2, 10, { from: recipient, gas: 100000 }),
            () => mvgtoken.transfer(addr2, 10, { from: recipient, gas: 100000 }),
            ]);
            expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('1');
            expect(await mvgtoken.checkpoints(addr1, 0)).to.be.deep.equal([ t1.receipt.blockNumber.toString(), '80' ]);
            // expectReve(await mvgtoken.checkpoints(addr1, 1)).to.be.deep.equal([ '0', '0' ]); // Reverts due to array overflow check
            // expect(await mvgtoken.checkpoints(addr1, 2)).to.be.deep.equal([ '0', '0' ]); // Reverts due to array overflow check
    
            const t4 = await mvgtoken.transfer(recipient, 20, { from: owner });
            expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('2');
            expect(await mvgtoken.checkpoints(addr1, 1)).to.be.deep.equal([ t4.receipt.blockNumber.toString(), '100' ]);
        });
        });


    // // The following tests are a adaptation of https://github.com/compound-finance/compound-protocol/blob/master/tests/Governance/CompTest.js.
  // describe('Compound test suite', function () {
  //   beforeEach(async function () {
  //     await mvgtoken.mint(owner, supply);
  //   });

  //   describe('balanceOf', function () {
  //     it('grants to initial account', async function () {
  //       expect(await mvgtoken.balanceOf(owner)).to.be.bignumber.equal('10000000000000000000000000');
  //     });
  //   });

  //   describe('numCheckpoints', function () {
  //     it('returns the number of checkpoints for a delegate', async function () {
  //       await mvgtoken.transfer(recipient, '100', { from: owner }); //give an account a few tokens for readability
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('0');

  //       const t1 = await mvgtoken.delegate(addr1, { from: recipient });
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('1');

  //       const t2 = await mvgtoken.transfer(addr2, 10, { from: recipient });
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('2');

  //       const t3 = await mvgtoken.transfer(addr2, 10, { from: recipient });
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('3');

  //       const t4 = await mvgtoken.transfer(recipient, 20, { from: owner });
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('4');

  //       expect(await mvgtoken.checkpoints(addr1, 0)).to.be.deep.equal([ t1.receipt.blockNumber.toString(), '100' ]);
  //       expect(await mvgtoken.checkpoints(addr1, 1)).to.be.deep.equal([ t2.receipt.blockNumber.toString(), '90' ]);
  //       expect(await mvgtoken.checkpoints(addr1, 2)).to.be.deep.equal([ t3.receipt.blockNumber.toString(), '80' ]);
  //       expect(await mvgtoken.checkpoints(addr1, 3)).to.be.deep.equal([ t4.receipt.blockNumber.toString(), '100' ]);

  //       await time.advanceBlock();
  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber)).to.be.bignumber.equal('100');
  //       expect(await mvgtoken.getPastVotes(addr1, t2.receipt.blockNumber)).to.be.bignumber.equal('90');
  //       expect(await mvgtoken.getPastVotes(addr1, t3.receipt.blockNumber)).to.be.bignumber.equal('80');
  //       expect(await mvgtoken.getPastVotes(addr1, t4.receipt.blockNumber)).to.be.bignumber.equal('100');
  //     });

  //     it('does not add more than one checkpoint in a block', async function () {
  //       await mvgtoken.transfer(recipient, '100', { from: owner });
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('0');

  //       const [ t1, t2, t3 ] = await batchInBlock([
  //         () => mvgtoken.delegate(addr1, { from: recipient, gas: 100000 }),
  //         () => mvgtoken.transfer(addr2, 10, { from: recipient, gas: 100000 }),
  //         () => mvgtoken.transfer(addr2, 10, { from: recipient, gas: 100000 }),
  //       ]);
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('1');
  //       expect(await mvgtoken.checkpoints(addr1, 0)).to.be.deep.equal([ t1.receipt.blockNumber.toString(), '80' ]);
  //       // expectReve(await mvgtoken.checkpoints(addr1, 1)).to.be.deep.equal([ '0', '0' ]); // Reverts due to array overflow check
  //       // expect(await mvgtoken.checkpoints(addr1, 2)).to.be.deep.equal([ '0', '0' ]); // Reverts due to array overflow check

  //       const t4 = await mvgtoken.transfer(recipient, 20, { from: owner });
  //       expect(await mvgtoken.numCheckpoints(addr1)).to.be.bignumber.equal('2');
  //       expect(await mvgtoken.checkpoints(addr1, 1)).to.be.deep.equal([ t4.receipt.blockNumber.toString(), '100' ]);
  //     });
  //   });

  //   describe('getPastVotes', function () {
  //     it('reverts if block number >= current block', async function () {
  //       await expectRevert(
  //         mvgtoken.getPastVotes(addr1, 5e10),
  //         'ERC20Votes: block not yet mined',
  //       );
  //     });

  //     it('returns 0 if there are no checkpoints', async function () {
  //       expect(await mvgtoken.getPastVotes(addr1, 0)).to.be.bignumber.equal('0');
  //     });

  //     it('returns the latest block if >= last checkpoint block', async function () {
  //       const t1 = await mvgtoken.delegate(addr1, { from: owner });
  //       await time.advanceBlock();
  //       await time.advanceBlock();

  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber)).to.be.bignumber.equal('10000000000000000000000000');
  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //     });

  //     it('returns zero if < first checkpoint block', async function () {
  //       await time.advanceBlock();
  //       const t1 = await mvgtoken.delegate(addr1, { from: owner });
  //       await time.advanceBlock();
  //       await time.advanceBlock();

  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber - 1)).to.be.bignumber.equal('0');
  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //     });

  //     it('generally returns the voting balance at the appropriate checkpoint', async function () {
  //       const t1 = await mvgtoken.delegate(addr1, { from: owner });
  //       await time.advanceBlock();
  //       await time.advanceBlock();
  //       const t2 = await mvgtoken.transfer(addr2, 10, { from: owner });
  //       await time.advanceBlock();
  //       await time.advanceBlock();
  //       const t3 = await mvgtoken.transfer(addr2, 10, { from: owner });
  //       await time.advanceBlock();
  //       await time.advanceBlock();
  //       const t4 = await mvgtoken.transfer(owner, 20, { from: addr2 });
  //       await time.advanceBlock();
  //       await time.advanceBlock();

  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber - 1)).to.be.bignumber.equal('0');
  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber)).to.be.bignumber.equal('10000000000000000000000000');
  //       expect(await mvgtoken.getPastVotes(addr1, t1.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //       expect(await mvgtoken.getPastVotes(addr1, t2.receipt.blockNumber)).to.be.bignumber.equal('9999999999999999999999990');
  //       expect(await mvgtoken.getPastVotes(addr1, t2.receipt.blockNumber + 1)).to.be.bignumber.equal('9999999999999999999999990');
  //       expect(await mvgtoken.getPastVotes(addr1, t3.receipt.blockNumber)).to.be.bignumber.equal('9999999999999999999999980');
  //       expect(await mvgtoken.getPastVotes(addr1, t3.receipt.blockNumber + 1)).to.be.bignumber.equal('9999999999999999999999980');
  //       expect(await mvgtoken.getPastVotes(addr1, t4.receipt.blockNumber)).to.be.bignumber.equal('10000000000000000000000000');
  //       expect(await mvgtoken.getPastVotes(addr1, t4.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //     });
  //   });
  // });

  // describe('getPastTotalSupply', function () {
  //   beforeEach(async function () {
  //     await mvgtoken.delegate(owner, { from: owner });
  //   });

  //   it('reverts if block number >= current block', async function () {
  //     await expectRevert(
  //       mvgtoken.getPastTotalSupply(5e10),
  //       'ERC20Votes: block not yet mined',
  //     );
  //   });

  //   it('returns 0 if there are no checkpoints', async function () {
  //     expect(await mvgtoken.getPastTotalSupply(0)).to.be.bignumber.equal('0');
  //   });

  //   it('returns the latest block if >= last checkpoint block', async function () {
  //     t1 = await mvgtoken.mint(owner, supply);

  //     await time.advanceBlock();
  //     await time.advanceBlock();

  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber)).to.be.bignumber.equal(supply);
  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber + 1)).to.be.bignumber.equal(supply);
  //   });

  //   it('returns zero if < first checkpoint block', async function () {
  //     await time.advanceBlock();
  //     const t1 = await mvgtoken.mint(owner, supply);
  //     await time.advanceBlock();
  //     await time.advanceBlock();

  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber - 1)).to.be.bignumber.equal('0');
  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //   });

  //   it('generally returns the voting balance at the appropriate checkpoint', async function () {
  //     const t1 = await mvgtoken.mint(owner, supply);
  //     await time.advanceBlock();
  //     await time.advanceBlock();
  //     const t2 = await mvgtoken.burn(owner, 10);
  //     await time.advanceBlock();
  //     await time.advanceBlock();
  //     const t3 = await mvgtoken.burn(owner, 10);
  //     await time.advanceBlock();
  //     await time.advanceBlock();
  //     const t4 = await mvgtoken.mint(owner, 20);
  //     await time.advanceBlock();
  //     await time.advanceBlock();

  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber - 1)).to.be.bignumber.equal('0');
  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber)).to.be.bignumber.equal('10000000000000000000000000');
  //     expect(await mvgtoken.getPastTotalSupply(t1.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //     expect(await mvgtoken.getPastTotalSupply(t2.receipt.blockNumber)).to.be.bignumber.equal('9999999999999999999999990');
  //     expect(await mvgtoken.getPastTotalSupply(t2.receipt.blockNumber + 1)).to.be.bignumber.equal('9999999999999999999999990');
  //     expect(await mvgtoken.getPastTotalSupply(t3.receipt.blockNumber)).to.be.bignumber.equal('9999999999999999999999980');
  //     expect(await mvgtoken.getPastTotalSupply(t3.receipt.blockNumber + 1)).to.be.bignumber.equal('9999999999999999999999980');
  //     expect(await mvgtoken.getPastTotalSupply(t4.receipt.blockNumber)).to.be.bignumber.equal('10000000000000000000000000');
  //     expect(await mvgtoken.getPastTotalSupply(t4.receipt.blockNumber + 1)).to.be.bignumber.equal('10000000000000000000000000');
  //   });
  // });
});