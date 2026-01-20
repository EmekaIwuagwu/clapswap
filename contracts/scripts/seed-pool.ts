import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🚀 Manually seeding liquidity pool\n");

    const FACTORY_ADDRESS = "0xA603b873302EE3D4769C834833ff2c1dfb734d59";
    const WFLR_ADDRESS = "0x1d80c49bb67d11ce79447230495a97a5e2060879";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";

    const factory = await ethers.getContractAt("ClapswapFactory", FACTORY_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);

    // Step 1: Create pair if it doesn't exist
    let pairAddress = await factory.getPair(WFLR_ADDRESS, USDC_ADDRESS);

    if (pairAddress === "0x0000000000000000000000000000000000000000") {
        console.log("Creating pair...");
        const tx = await factory.createPair(WFLR_ADDRESS, USDC_ADDRESS);
        await tx.wait();
        pairAddress = await factory.getPair(WFLR_ADDRESS, USDC_ADDRESS);
        console.log("✅ Pair created at:", pairAddress);
    } else {
        console.log("✅ Pair already exists at:", pairAddress);
    }

    const pair = await ethers.getContractAt("ClapswapPair", pairAddress);
    const wflr = await ethers.getContractAt("IWFLR", WFLR_ADDRESS);

    // Step 2: Wrap 5 FLR to WFLR
    console.log("\nWrapping 5 FLR to WFLR...");
    const wrapTx = await wflr.deposit({ value: ethers.parseEther("5") });
    await wrapTx.wait();
    console.log("✅ Wrapped!");

    // Step 3: Transfer WFLR to pair
    console.log("\nTransferring 5 WFLR to pair...");
    const wflrTransferTx = await wflr.transfer(pairAddress, ethers.parseEther("5"));
    await wflrTransferTx.wait();
    console.log("✅ WFLR transferred!");

    // Step 4: Transfer USDC to pair
    console.log("\nTransferring 5 USDC to pair...");
    const usdcTransferTx = await usdc.transfer(pairAddress, ethers.parseEther("5"));
    await usdcTransferTx.wait();
    console.log("✅ USDC transferred!");

    // Step 5: Mint LP tokens
    console.log("\nMinting LP tokens...");
    const mintTx = await pair.mint(signer.address);
    const receipt = await mintTx.wait();
    console.log("✅ LP tokens minted!");
    console.log("Transaction hash:", receipt?.hash);

    // Step 6: Check reserves
    const reserves = await pair.getReserves();
    console.log("\n📊 Final Pool State:");
    console.log("Reserve 0:", ethers.formatEther(reserves[0]));
    console.log("Reserve 1:", ethers.formatEther(reserves[1]));
    console.log("\n🎉 Pool successfully seeded! Now try swapping in the UI!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
