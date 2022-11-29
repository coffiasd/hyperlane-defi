const hre = require("hardhat");

async function main() {
    const Account = await hre.ethers.getContractFactory("Hyperswap");
    const account = await Account.deploy(0x62732d74);

    console.log(
        "deploy address:", account.address
    );

    const interAccount = await account.InterChainAccount(0x62732d74)

    console.log(
        "inter chain account:", interAccount
    );

    // const retApprove = await account.ApproveMyToken(path[0], ethers.utils.parseEther('0.01'));
    // console.log("approve:", retApprove);

    // const transfer = await account.TransferFrom(path[0], ethers.utils.parseEther('1'));
    // console.log("transfer:", transfer);

    // const ret = await account.HyperlaneSwap(path, 500, ethers.utils.parseEther('0.01'), 0)
    // console.log("ret:", ret)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
