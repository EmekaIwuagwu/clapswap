import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();

    const WFLR_ADDRESS = "0xeBa5C69ef1dFf83a2f230E6c2DCaa2Deea65A1DC";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";

    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);
    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);

    console.log("🔍 Checking pair balances before mint...\n");

    const wflrBalance = await wflr.balanceOf(PAIR_ADDRESS);
    const usdcBalance = await usdc.balanceOf(PAIR_ADDRESS);
    const reserves = await pair.getReserves();
    const totalSupply = await pair.totalSupply();

    console.log("WFLR balance in pair:", ethers.formatEther(wflrBalance));
    console.log("USDC balance in pair:", ethers.formatEther(usdcBalance));
    console.log("Reserve0:", ethers.formatEther(reserves[0]));
    console.log("Reserve1:", ethers.formatEther(reserves[1]));
    console.log("Total LP supply:", ethers.formatEther(totalSupply));

    const amount0 = wflrBalance - reserves[0];
    const amount1 = usdcBalance - reserves[1];
    console.log("\nAmount0 to mint:", ethers.formatEther(amount0));
    console.log("Amount1 to mint:", ethers.formatEther(amount1));

    if (totalSupply == BigInt(0)) {
        const liquidity = Math.sqrt(Number(amount0) * Number(amount1)) - 1000;
        console.log("Calculated liquidity:", liquidity);

        if (liquidity <= 0) {
            console.log("\n❌ PROBLEM: Not enough liquidity! Need larger amounts.");
            console.log("Try adding at least 0.001 FLR and 0.001 USDC to create meaningful liquidity");
        }
    }

    console.log("\n💡 Trying with MUCH larger amounts (100 FLR + 100 USDC)...");

    const wrapTx = await wflr.deposit({ value: ethers.parseEther("100") });
    await wrapTx.wait();

    const wflrTransfer = await wflr.transfer(PAIR_ADDRESS, ethers.parseEther("100"));
    await wflrTransfer.wait();

    const usdcTransfer = await usdc.transfer(PAIR_ADDRESS, ethers.parseEther("100"));
    await usdcTransfer.wait();

    const mintTx = await pair.mint(signer.address);
    await mintTx.wait();
    console.log("✅ SUCCESS!");

    const finalReserves = await pair.getReserves();
    console.log("\n📊 Final Pool State:");
    console.log("Reserve0:", ethers.formatEther(finalReserves[0]));
    console.log("Reserve1:", ethers.formatEther(finalReserves[1]));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
