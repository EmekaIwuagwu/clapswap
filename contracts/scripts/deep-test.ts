import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();

    const FACTORY_ADDRESS = "0x038a41b52253923fc6f3153405Dca33Aee3CDABf";
    const WFLR_ADDRESS = "0xeBa5C69ef1dFf83a2f230E6c2DCaa2Deea65A1DC";
    const ROUTER_ADDRESS = "0x9C69597eD368cF6d98d954D806111b8C58FBc12A";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";

    console.log("🧪 Deep diagnostics on new deployment\n");

    const factory = await ethers.getContractAt("ClapswapFactory", FACTORY_ADDRESS);
    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    const router = await ethers.getContractAt("ClapswapRouter", ROUTER_ADDRESS);

    console.log("1. Testing WFLR...");
    try {
        const depositTx = await wflr.deposit({ value: ethers.parseEther("1") });
        await depositTx.wait();
        const balance = await wflr.balanceOf(signer.address);
        console.log("✅ WFLR works! Balance:", ethers.formatEther(balance));
    } catch (e: any) {
        console.log("❌ WFLR failed:", e.message);
    }

    console.log("\n2. Checking Router config...");
    const routerWFLR = await router.WFLR();
    const routerFactory = await router.factory();
    console.log("Router WFLR:", routerWFLR);
    console.log("Router Factory:", routerFactory);
    console.log("Match:", routerWFLR === WFLR_ADDRESS && routerFactory === FACTORY_ADDRESS);

    console.log("\n3. Creating pair manually...");
    try {
        const createTx = await factory.createPair(WFLR_ADDRESS, USDC_ADDRESS);
        await createTx.wait();
        console.log("✅ Pair created!");
    } catch (e: any) {
        if (e.message.includes("PAIR_EXISTS")) {
            console.log("⚠️ Pair already exists");
        } else {
            console.log("❌ Failed:", e.message);
        }
    }

    const pairAddress = await factory.getPair(WFLR_ADDRESS, USDC_ADDRESS);
    console.log("Pair address:", pairAddress);

    if (pairAddress !== "0x0000000000000000000000000000000000000000") {
        const pair = await ethers.getContractAt("ClapswapPair", pairAddress);
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        console.log("Token0:", token0);
        console.log("Token1:", token1);

        console.log("\n4. Testing manual liquidity add...");
        // Wrap FLR
        const wrapTx = await wflr.deposit({ value: ethers.parseEther("2") });
        await wrapTx.wait();

        // Transfer to pair
        const wflrTransfer = await wflr.transfer(pairAddress, ethers.parseEther("2"));
        await wflrTransfer.wait();

        const usdcTransfer = await usdc.transfer(pairAddress, ethers.parseEther("2"));
        await usdcTransfer.wait();

        console.log("Tokens transferred to pair. Attempting mint...");
        try {
            const mintTx = await pair.mint(signer.address);
            await mintTx.wait();
            console.log("✅ Manual mint SUCCESS!");

            const reserves = await pair.getReserves();
            console.log("\n📊 Pool State:");
            console.log("Reserve0:", ethers.formatEther(reserves[0]));
            console.log("Reserve1:", ethers.formatEther(reserves[1]));
        } catch (e: any) {
            console.log("❌ Mint failed:", e.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
