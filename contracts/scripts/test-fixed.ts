import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🎉 TESTING FIXED DEPLOYMENT!\n");

    const WFLR_ADDRESS = "0xF1aE7Af0eECdf199f3768A052a194A8206b81388";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const FACTORY_ADDRESS = "0x40906DdC46f1594a84A21fAb8AFb7cfCBA6ce1b4";

    const factory = await ethers.getContractAt("ClapswapFactory", FACTORY_ADDRESS);
    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);

    console.log("Step 1: Creating pair...");
    const createTx = await factory.createPair(WFLR_ADDRESS, USDC_ADDRESS);
    await createTx.wait();
    const pairAddress = await factory.getPair(WFLR_ADDRESS, USDC_ADDRESS);
    console.log("✅ Pair created at:", pairAddress);

    const pair = await ethers.getContractAt("ClapswapPair", pairAddress);

    console.log("\nStep 2: Adding liquidity (10 FLR + 10 USDC)...");
    const amount = ethers.parseEther("10");

    await (await wflr.deposit({ value: amount })).wait();
    await (await wflr.transfer(pairAddress, amount)).wait();
    await (await usdc.transfer(pairAddress, amount)).wait();

    console.log("\nStep 3: Minting LP tokens...");
    const mintTx = await pair.mint(signer.address);
    const receipt = await mintTx.wait();

    if (receipt?.status === 1) {
        console.log("\n✅✅✅ SUCCESS! ✅✅✅");
        const reserves = await pair.getReserves();
        const lpBalance = await pair.balanceOf(signer.address);
        console.log("\n📊 Pool Stats:");
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));
        console.log("Your LP tokens:", ethers.formatEther(lpBalance));
        console.log("\n🚀 DEX IS LIVE! Go try swapping in the UI!");
    } else {
        console.log("❌ Failed");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
