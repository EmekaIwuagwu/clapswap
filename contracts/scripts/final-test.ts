import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🎯 FINAL TEST WITH OZ 4.9.0\n");

    const WFLR_ADDRESS = "0x59A68F2390Aafde7a3B888FB29d708D696De440c";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const FACTORY_ADDRESS = "0xb18398735D57570394678934157D5Bfb2a3e2B37";

    const factory = await ethers.getContractAt("ClapswapFactory", FACTORY_ADDRESS);
    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);

    console.log("Creating pair...");
    await (await factory.createPair(WFLR_ADDRESS, USDC_ADDRESS)).wait();
    const pairAddress = await factory.getPair(WFLR_ADDRESS, USDC_ADDRESS);
    console.log("✅ Pair:", pairAddress);

    const pair = await ethers.getContractAt("ClapswapPair", pairAddress);

    console.log("\nAdding 10 FLR + 10 USDC...");
    const amount = ethers.parseEther("10");

    await (await wflr.deposit({ value: amount })).wait();
    await (await wflr.transfer(pairAddress, amount)).wait();
    await (await usdc.transfer(pairAddress, amount)).wait();

    console.log("\nMinting LP tokens...");
    const mintTx = await pair.mint(signer.address);
    const receipt = await mintTx.wait();

    if (receipt?.status === 1) {
        console.log("\n🎉🎉🎉 IT WORKED! 🎉🎉🎉\n");
        const reserves = await pair.getReserves();
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));
        console.log("\n✅ DEX IS LIVE!");
        console.log("Pair address:", pairAddress);
        console.log("\nUpdate frontend and TRY SWAPPING!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
