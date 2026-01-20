import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Redeploying with custom WFLR\n");
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "FLR\n");

    // 1. Deploy WFLR
    console.log("1. Deploying WFLR...");
    const WFLR = await ethers.getContractFactory("WFLR");
    const wflr = await WFLR.deploy();
    await wflr.waitForDeployment();
    const wflrAddress = await wflr.getAddress();
    console.log("✅ WFLR deployed to:", wflrAddress);

    // 2. Deploy Factory
    console.log("\n2. Deploying Factory...");
    const Factory = await ethers.getContractFactory("ClapswapFactory");
    const factory = await Factory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✅ Factory deployed to:", factoryAddress);

    // 3. Deploy Router
    console.log("\n3. Deploying Router...");
    const Router = await ethers.getContractFactory("ClapswapRouter");
    const router = await Router.deploy(factoryAddress, wflrAddress);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("✅ Router deployed to:", routerAddress);

    // 4. Deploy Mock Tokens (keep the same ones for simplicity)
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const ETH_ADDRESS = "0xe0572C001B320dBd214C5ddB592C018FA5cedA4F";

    console.log("\n📋 Deployment Summary:");
    console.log("WFLR:", wflrAddress);
    console.log("Factory:", factoryAddress);
    console.log("Router:", routerAddress);
    console.log("Mock USDC:", USDC_ADDRESS);
    console.log("Mock ETH:", ETH_ADDRESS);

    console.log("\n🔧 Update your frontend constants.ts with these addresses!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
