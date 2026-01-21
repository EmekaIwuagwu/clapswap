import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("🚀 Deploying Clapswap Launchpad\n");
    console.log("Deployer:", deployer.address);

    const Launchpad = await ethers.getContractFactory("ClapswapLaunchpad");
    const launchpad = await Launchpad.deploy();
    await launchpad.waitForDeployment();
    const launchpadAddress = await launchpad.getAddress();

    console.log("\n✅ Launchpad deployed to:", launchpadAddress);
    console.log("\nAdd this to your frontend constants.ts!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
