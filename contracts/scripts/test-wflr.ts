import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    const WFLR_ADDRESS = "0x1d80c49bb67d11ce79447230495a97a5e2060879";

    console.log("🧪 Testing WFLR deposit function...\n");

    const wflr = await ethers.getContractAt("IWFLR", WFLR_ADDRESS);

    try {
        const tx = await wflr.deposit({ value: ethers.parseEther("0.1") });
        await tx.wait();
        console.log("✅ WFLR deposit works!");

        const balance = await wflr.balanceOf(signer.address);
        console.log("WFLR Balance:", ethers.formatEther(balance));
    } catch (error: any) {
        console.log("❌ WFLR deposit failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
