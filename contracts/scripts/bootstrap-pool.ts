import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🚀 Complete Liquidity Bootstrap Process\n");
    console.log("Deployer:", signer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "FLR\n");

    const WFLR_ADDRESS = "0xeBa5C69ef1dFf83a2f230E6c2DCaa2Deea65A1DC";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";

    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    console.log("Step 1: Wrapping 10 FLR to WFLR...");
    const wrapTx = await wflr.deposit({ value: ethers.parseEther("10") });
    await wrapTx.wait();
    console.log("✅ Wrapped!");

    console.log("\nStep 2: Transferring 10 WFLR to pair...");
    const wflrTx = await wflr.transfer(PAIR_ADDRESS, ethers.parseEther("10"));
    await wflrTx.wait();
    console.log("✅ WFLR transferred!");

    console.log("\nStep 3: Transferring 10 USDC to pair...");
    const usdcTx = await usdc.transfer(PAIR_ADDRESS, ethers.parseEther("10"));
    await usdcTx.wait();
    console.log("✅ USDC transferred!");

    console.log("\nStep 4: Verifying pair balances...");
    const wflrBal = await wflr.balanceOf(PAIR_ADDRESS);
    const usdcBal = await usdc.balanceOf(PAIR_ADDRESS);
    console.log("WFLR in pair:", ethers.formatEther(wflrBal));
    console.log("USDC in pair:", ethers.formatEther(usdcBal));

    if (wflrBal < ethers.parseEther("10") || usdcBal < ethers.parseEther("10")) {
        throw new Error("Token transfer failed!");
    }

    console.log("\nStep 5: Minting LP tokens...");
    try {
        const mintTx = await pair.mint(signer.address, {
            gasLimit: 10000000 // Very high limit
        });
        console.log("Tx hash:", mintTx.hash);
        const receipt = await mintTx.wait();

        if (receipt && receipt.status === 1) {
            console.log("\n✅✅✅ SUCCESS! Pool is now LIVE! ✅✅✅");

            const reserves = await pair.getReserves();
            const lpBalance = await pair.balanceOf(signer.address);

            console.log("\n📊 Final Pool State:");
            console.log("Reserve0:", ethers.formatEther(reserves[0]));
            console.log("Reserve1:", ethers.formatEther(reserves[1]));
            console.log("Your LP tokens:", ethers.formatEther(lpBalance));

            console.log("\n🎉 GO TO THE UI AND TRY SWAPPING NOW!");
        } else {
            console.log("\n❌ Mint transaction reverted");
            console.log("Receipt:", receipt);
        }
    } catch (error: any) {
        console.log("\n❌ Mint failed with error:");
        console.log(error.message);

        // Get more details
        console.log("\nAttempting to diagnose...");
        const reserves = await pair.getReserves();
        const totalSupply = await pair.totalSupply();
        console.log("Current reserves:", ethers.formatEther(reserves[0]), ethers.formatEther(reserves[1]));
        console.log("Current LP supply:", ethers.formatEther(totalSupply));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n💥 Fatal error:");
        console.error(error);
        process.exit(1);
    });
