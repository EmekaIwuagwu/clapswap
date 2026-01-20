import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🎯 Direct mint call with proper function signature\n");

    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    const balances = await Promise.all([
        ethers.provider.getBalance(PAIR_ADDRESS),
        pair.totalSupply()
    ]);

    console.log("Pair FLR balance:", ethers.formatEther(balances[0]));
    console.log("LP total supply:", ethers.formatEther(balances[1]));

    console.log("\nCalling mint()...");

    const mintTx = await pair.mint(signer.address, {
        gasLimit: 5000000
    });

    console.log("Transaction submitted:", mintTx.hash);
    console.log("Waiting for confirmation...");

    const receipt = await mintTx.wait();

    if (receipt && receipt.status === 1) {
        console.log("✅ SUCCESS!");

        const reserves = await pair.getReserves();
        console.log("\n📊 Pool State:");
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));

        console.log("\n🎉 POOL IS LIVE! Refresh the UI and try swapping!");
    } else {
        console.log("❌ Transaction reverted");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Full error:");
        console.error(error);
        process.exit(1);
    });
