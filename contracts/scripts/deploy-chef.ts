import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Deploying MasterChef Ecosystem\n");

    // 1. Deploy CLAP Token
    const ClapToken = await ethers.getContractFactory("ClapToken");
    const clap = await ClapToken.deploy();
    await clap.waitForDeployment();
    const clapAddress = await clap.getAddress();
    console.log("✅ CLAP Token deployed to:", clapAddress);

    // 2. Deploy MasterChef
    const clapPerBlock = ethers.parseUnits("1", 18); // 1 CLAP per block
    const startBlock = await ethers.provider.getBlockNumber();
    const MasterChef = await ethers.getContractFactory("MasterChef");
    const chef = await MasterChef.deploy(clapAddress, clapPerBlock, startBlock);
    await chef.waitForDeployment();
    const chefAddress = await chef.getAddress();
    console.log("✅ MasterChef deployed to:", chefAddress);

    // 3. Transfer Ownership of CLAP to MasterChef (so it can mint rewards)
    await clap.transferOwnership(chefAddress);
    console.log("✅ Ownership of CLAP transferred to MasterChef");

    // 4. Add initial pools
    // We need the LP addresses from the Factory
    const FACTORY_ADDRESS = "0xb18398735D57570394678934157D5Bfb2a3e2B37";
    const WFLR = "0x59A68F2390Aafde7a3B888FB29d708D696De440c";
    const USDC = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const LEGEND = "0x0eaF4Fa5a3abfb43456334ceB2A64B990Ea7a60a";

    const factory = await ethers.getContractAt("ClapswapFactory", FACTORY_ADDRESS);

    const pools = [
        { name: "FLR/USDC", tokenA: WFLR, tokenB: USDC, alloc: 100 },
        { name: "FLR/LEGEND", tokenA: WFLR, tokenB: LEGEND, alloc: 200 },
    ];

    for (const pool of pools) {
        const lpAddress = await factory.getPair(pool.tokenA, pool.tokenB);
        if (lpAddress !== ethers.ZeroAddress) {
            await chef.add(pool.alloc, lpAddress, false);
            console.log(`✅ Added ${pool.name} pool (PID: ${pools.indexOf(pool)}) at ${lpAddress}`);
        }
    }

    console.log("\nSummary:");
    console.log("CLAP:", clapAddress);
    console.log("CHEF:", chefAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
