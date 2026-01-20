import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("✅ Testing new deployment with proper WFLR\n");

    const WFLR_ADDRESS = "0xeBa5C69ef1dFf83a2f230E6c2DCaa2Deea65A1DC";
    const ROUTER_ADDRESS = "0x9C69597eD368cF6d98d954D806111b8C58FBc12A";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";

    const router = await ethers.getContractAt("ClapswapRouter", ROUTER_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);

    console.log("1. Approving USDC...");
    const approveTx = await usdc.approve(ROUTER_ADDRESS, ethers.parseEther("10"));
    await approveTx.wait();
    console.log("✅ Approved!");

    console.log("\n2. Adding liquidity: 5 FLR + 5 USDC...");
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    try {
        const tx = await router.addLiquidityFLR(
            USDC_ADDRESS,
            ethers.parseEther("5"),
            0,
            0,
            signer.address,
            deadline,
            { value: ethers.parseEther("5") }
        );
        const receipt = await tx.wait();
        console.log("✅ Liquidity added successfully!");
        console.log("Transaction hash:", receipt?.hash);

        console.log("\n🎉 SUCCESS! The DEX is now live!");
        console.log("👉 Refresh your browser and try swapping in the UI!");
    } catch (error: any) {
        console.log("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
