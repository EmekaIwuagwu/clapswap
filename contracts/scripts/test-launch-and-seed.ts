import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const LAUNCHPAD_ADDRESS = "0x8d56967BeCAD5c112F3Fda236a6a4B31F1E6031D";
    const ROUTER_ADDRESS = "0xA73CA124552D62c167e1233Fa46680b768f8337A";

    console.log("🚀 Launching 'Clap Legend' (LEGEND) via Launchpad...");

    const launchpad = await ethers.getContractAt("ClapswapLaunchpad", LAUNCHPAD_ADDRESS);

    // 1. Create Token
    const tx = await launchpad.createToken("Clap Legend", "LEGEND", 1000000);
    const receipt = await tx.wait();
    const event = receipt?.logs.find((l: any) => l.fragment && l.fragment.name === "TokenCreated");
    const tokenAddress = (event as any).args[0];

    console.log("✅ Token Created at:", tokenAddress);

    // 2. Add Liquidity
    console.log("\n💧 Seeding LEGEND/FLR Pool...");
    const token = await ethers.getContractAt("ERC20", tokenAddress);

    const amountToken = ethers.parseUnits("10000", 18);
    const amountFLR = ethers.parseUnits("20", 18);    // Even lower to be safe

    console.log("Approving Router...");
    const appTx = await token.approve(ROUTER_ADDRESS, amountToken);
    await appTx.wait();
    console.log("✅ Approved. Waiting for state to propagate...");

    // Small wait
    await new Promise(resolve => setTimeout(resolve, 5000));

    const router = await ethers.getContractAt("ClapswapRouter", ROUTER_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

    console.log("Adding Liquidity...");
    const liqTx = await router.addLiquidityFLR(
        tokenAddress,
        amountToken,
        0,
        0,
        deployer.address,
        deadline,
        { value: amountFLR }
    );
    await liqTx.wait();

    console.log("✅ SUCCESS! LEGEND/FLR is live.");
    console.log("\n--- TOKEN DETAILS ---");
    console.log(`Name: Clap Legend`);
    console.log(`Symbol: LEGEND`);
    console.log(`Address: ${tokenAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
