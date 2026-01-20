import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🚀 Bootstrap with SUFFICIENT liquidity (1000+ minimum)\n");

    const WFLR_ADDRESS = "0xeBa5C69ef1dFf83a2f230E6c2DCaa2Deea65A1DC";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";

    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    // Need at least SQRT(X*Y) > 1000 for first mint
    // Using 50 FLR + 50 USDC: SQRT(50*50) = 50, which is > 1000 when using wei
    // Actually need SQRT(amount0 * amount1) > 1000
    // With 18 decimals: 50e18 * 50e18 = 2500e36, sqrt = 50e18
    // We need sqrt(X) - 1000 > 0, so X > 1000
    // Since we're in wei, 0.001 tokens = 1e15 wei
    // sqrt(1e15 * 1e15) = 1e15, which >> 1000
    // Let's use 0.1 FLR + 0.1 USDC to be safe

    const amount = ethers.parseEther("0.1"); // 0.1 tokens = 1e17 wei
    // sqrt(1e17 * 1e17) = 1e17, way more than 1000!

    console.log("Using 0.1 FLR + 0.1 USDC");
    console.log("Expected liquidity: ~0.1 tokens worth of LP");

    console.log("\n1. Wrapping FLR...");
    const wrapTx = await wflr.deposit({ value: amount });
    await wrapTx.wait();
    console.log("✅");

    console.log("\n2. Transferring to pair...");
    await (await wflr.transfer(PAIR_ADDRESS, amount)).wait();
    await (await usdc.transfer(PAIR_ADDRESS, amount)).wait();
    console.log("✅");

    console.log("\n3. Minting LP tokens...");
    const mintTx = await pair.mint(signer.address, { gasLimit: 10000000 });
    const receipt = await mintTx.wait();

    if (receipt?.status === 1) {
        console.log("\n🎉🎉🎉 SUCCESS! 🎉🎉🎉");
        const reserves = await pair.getReserves();
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));
        console.log("\n✅ DEX IS NOW LIVE! Try swapping in the UI!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
