import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Factory
    const Factory = await ethers.getContractFactory("ClapswapFactory");
    const factory = await Factory.deploy(deployer.address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("ClapswapFactory deployed to:", factoryAddress);

    // 2. Coston2 WFLR: 0x1d80c49bb67d11ce79447230495a97a5e2060879
    const WFLR_ADDRESS = "0x1d80c49bb67d11ce79447230495a97a5e2060879";

    // 3. Deploy Router
    const Router = await ethers.getContractFactory("ClapswapRouter");
    const router = await Router.deploy(factoryAddress, WFLR_ADDRESS);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("ClapswapRouter deployed to:", routerAddress);

    // 4. Deploy Mock Tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");

    console.log("Deploying Mock USDC...");
    const usdc = await MockERC20.deploy("Mock USDC", "mUSDC");
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress);

    console.log("Deploying Mock ETH...");
    const eth = await MockERC20.deploy("Mock ETH", "mETH");
    await eth.waitForDeployment();
    const ethAddress = await eth.getAddress();
    console.log("Mock ETH deployed to:", ethAddress);

    console.log("\n--- Deployment Summary ---");
    console.log(`Factory: ${factoryAddress}`);
    console.log(`Router: ${routerAddress}`);
    console.log(`Mock USDC: ${usdcAddress}`);
    console.log(`Mock ETH: ${ethAddress}`);
    console.log("---------------------------\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
