const hre = require("hardhat");

async function main() {
    const Account = await hre.ethers.getContractFactory("Hyperswap");
    // const account = await Account.deploy();
    const account = Account.attach("0x29C4822A51D2a22fbAe1b9070C88Ecf3a7c6407f")

    //mumbai address 0x5b2D50c596e68c71281dFBD4F991054864A34402
    //geli address 0x3Efe28DFb10e027Be459Ac4930B892E667335d6f
    console.log(
        "deploy address:", account.address
    );

    const interAccount1 = await account.InterChainAccount(80001)
    const interAccount2 = await account.InterChainAccount(5)

    const path = [
        "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", // geli weth
        "0x5d96dA7dEcF336a824b4f3C235EF4BB3683b0ABF"  // token dai
    ];

    // const approve = await account.ApproveMyToken(path[0], ethers.utils.parseEther('1'))
    // console.log("approve", approve);

    const ret = await account.HyperlaneSwap(5, path, 500, ethers.utils.parseEther('0.00001'), 0)
    console.log("ret:", ret)

    //get interchain aaccount
    console.log(interAccount1, interAccount2);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
