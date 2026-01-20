import { ethers } from "hardhat";

async function main() {
    console.log("🔬 Debugging NEW deployment\n");

    const PAIR_ADDRESS = "0x8acc63a04f2579AF341caFFe748484596f73F649";
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    const token0 = await pair.token0();
    const token1 = await pair.token1();
    const reserves = await pair.getReserves();

    console.log("Token0:", token0);
    console.log("Token1:", token1);
    console.log("Reserves:", ethers.formatEther(reserves[0]), ethers.formatEther(reserves[1]));

    const token0Contract = await ethers.getContractAt("IERC20", token0);
    const token1Contract = await ethers.getContractAt("IERC20", token1);

    const bal0 = await token0Contract.balanceOf(PAIR_ADDRESS);
    const bal1 = await token1Contract.balanceOf(PAIR_ADDRESS);

    console.log("Balances:", ethers.formatEther(bal0), ethers.formatEther(bal1));

    const [signer] = await ethers.getSigners();

    console.log("\nTrying static call...");
    try {
        const result = await pair.mint.staticCall(signer.address);
        console.log("✅ Would succeed with liquidity:", ethers.formatEther(result));
    } catch (error: any) {
        console.log("❌ Static call failed");
        console.log("Error data:", error.data);

        if (error.data) {
            const sig = error.data.slice(0, 10);
            console.log("Error signature:", sig);

            // Try to decode
            if (sig === "0x08c379a0") {
                const reason = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + error.data.slice(10));
                console.log("Reason:", reason[0]);
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
