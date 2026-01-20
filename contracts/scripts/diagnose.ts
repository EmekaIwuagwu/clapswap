import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🔍 Diagnostic Check with account:", signer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "FLR\n");

    const FACTORY_ADDRESS = "0xA603b873302EE3D4769C834833ff2c1dfb734d59";
    const ROUTER_ADDRESS = "0x79fc40161D49B88Ae8658D3E16fb085aC7208220";
    const WFLR_ADDRESS = "0x1d80c49bb67d11ce79447230495a97a5e2060879";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";

    // Connect to contracts
    const factory = await ethers.getContractAt("ClapswapFactory", FACTORY_ADDRESS);
    const router = await ethers.getContractAt("ClapswapRouter", ROUTER_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);

    console.log("📋 Step 1: Check if pool exists");
    const pairAddress = await factory.getPair(WFLR_ADDRESS, USDC_ADDRESS);
    console.log("Pair address:", pairAddress);

    if (pairAddress !== "0x0000000000000000000000000000000000000000") {
        console.log("✅ Pool already exists! Address:", pairAddress);
        const pair = await ethers.getContractAt("ClapswapPair", pairAddress);
        const reserves = await pair.getReserves();
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));
    } else {
        console.log("❌ Pool does not exist yet");
    }

    console.log("\n📋 Step 2: Check USDC balance and allowance");
    const usdcBalance = await usdc.balanceOf(signer.address);
    const usdcAllowance = await usdc.allowance(signer.address, ROUTER_ADDRESS);
    console.log("USDC Balance:", ethers.formatEther(usdcBalance));
    console.log("USDC Allowance to Router:", ethers.formatEther(usdcAllowance));

    console.log("\n📋 Step 3: Check Router configuration");
    const routerWFLR = await router.WFLR();
    const routerFactory = await router.factory();
    console.log("Router's WFLR address:", routerWFLR);
    console.log("Router's Factory address:", routerFactory);
    console.log("Expected WFLR:", WFLR_ADDRESS);
    console.log("Expected Factory:", FACTORY_ADDRESS);

    if (routerWFLR.toLowerCase() !== WFLR_ADDRESS.toLowerCase()) {
        console.log("⚠️ WARNING: Router WFLR mismatch!");
    }
    if (routerFactory.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) {
        console.log("⚠️ WARNING: Router Factory mismatch!");
    }

    console.log("\n📋 Step 4: Try to add liquidity with detailed error");
    try {
        const amountFLR = ethers.parseEther("5");
        const amountUSDC = ethers.parseEther("5");
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

        console.log("Attempting addLiquidityFLR with:");
        console.log("- Token:", USDC_ADDRESS);
        console.log("- Amount USDC:", ethers.formatEther(amountUSDC));
        console.log("- Amount FLR:", ethers.formatEther(amountFLR));
        console.log("- To:", signer.address);
        console.log("- Deadline:", deadline);

        // Estimate gas first
        const gasEstimate = await router.addLiquidityFLR.estimateGas(
            USDC_ADDRESS,
            amountUSDC,
            0,
            0,
            signer.address,
            deadline,
            { value: amountFLR }
        );
        console.log("✅ Gas estimate successful:", gasEstimate.toString());
        console.log("\n🎉 The transaction SHOULD work! Try it in the UI with these exact amounts.");
    } catch (error: any) {
        console.log("❌ Gas estimation failed with error:");
        console.log(error.message);

        if (error.data) {
            console.log("\nError data:", error.data);
        }

        // Try to decode the revert reason
        if (error.error && error.error.message) {
            console.log("\nDetailed error:", error.error.message);
        }
    }

    console.log("\n📋 Step 5: Check Factory feeTo");
    const feeTo = await factory.feeTo();
    console.log("Factory feeTo:", feeTo);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
