import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🚀 Final liquidity seed using existing tokens in pair\n");

    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    console.log("Calling mint with existing 2 FLR + 2 USDC already in pair...");

    try {
        const mintTx = await pair.mint(signer.address, { gasLimit: 5000000 });
        const receipt = await mintTx.wait();
        console.log("✅ LIQUIDITY ADDED SUCCESSFULLY!");
        console.log("Transaction hash:", receipt?.hash);

        const reserves = await pair.getReserves();
        const lpBalance = await pair.balanceOf(signer.address);

        console.log("\n📊 Pool is now live:");
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));
        console.log("Your LP tokens:", ethers.formatEther(lpBalance));

        console.log("\n🎉 DEX IS READY! Go to the UI and try swapping!");
    } catch (error: any) {
        console.log("❌ Error:", error);

        // Try to decode the revert reason
        if (error.data) {
            const iface = new ethers.Interface([
                "error InsufficientLiquidity()",
                "error Locked()"
            ]);
            try {
                const decoded = iface.parseError(error.data);
                console.log("Decoded error:", decoded);
            } catch (e) {
                console.log("Could not decode error");
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
