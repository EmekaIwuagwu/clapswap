import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("🔬 Deep Error Analysis\n");

    const WFLR_ADDRESS = "0xeBa5C69ef1dFf83a2f230E6c2DCaa2Deea65A1DC";
    const USDC_ADDRESS = "0xdDC7a84B617E6a08934e7c93B677a30DC8890fff";
    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";

    const wflr = await ethers.getContractAt("WFLR", WFLR_ADDRESS);
    const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    try {
        console.log("Step 1: Checking pair state...");
        const token0 = await pair.token0();
        const token1 = await pair.token1();
        const reserves = await pair.getReserves();
        const totalSupply = await pair.totalSupply();

        console.log("Token0:", token0);
        console.log("Token1:", token1);
        console.log("Reserve0:", ethers.formatEther(reserves[0]));
        console.log("Reserve1:", ethers.formatEther(reserves[1]));
        console.log("Total Supply:", ethers.formatEther(totalSupply));

        console.log("\nStep 2: Checking balances in pair...");
        const wflrBalance = await wflr.balanceOf(PAIR_ADDRESS);
        const usdcBalance = await usdc.balanceOf(PAIR_ADDRESS);
        console.log("WFLR in pair:", ethers.formatEther(wflrBalance));
        console.log("USDC in pair:", ethers.formatEther(usdcBalance));

        const amount0 = wflrBalance - reserves[0];
        const amount1 = usdcBalance - reserves[1];
        console.log("\nAmount to be minted:");
        console.log("amount0:", ethers.formatEther(amount0));
        console.log("amount1:", ethers.formatEther(amount1));

        if (totalSupply == BigInt(0)) {
            const product = amount0 * amount1;
            console.log("\nLiquidity calculation (first mint):");
            console.log("amount0 * amount1 =", product.toString());
            console.log("sqrt(product) =", Math.sqrt(Number(product)).toString());
            console.log("sqrt - 1000 =", (Math.sqrt(Number(product)) - 1000).toString());

            if (Math.sqrt(Number(product)) - 1000 <= 0) {
                console.log("\n❌ ERROR FOUND: Liquidity would be <= 0!");
                console.log("Need MORE tokens to satisfy minimum liquidity of 1000 wei");
                console.log("Suggested: At least 0.00001 of each token");
                return;
            }
        }

        console.log("\nStep 3: Testing mint with callStatic (simulation)...");
        try {
            const result = await pair.mint.staticCall(signer.address);
            console.log("✅ Static call succeeded! Expected liquidity:", ethers.formatEther(result));

            console.log("\nStep 4: Executing actual mint...");
            const tx = await pair.mint(signer.address, { gasLimit: 10000000 });
            console.log("Transaction hash:", tx.hash);
            const receipt = await tx.wait();

            if (receipt?.status === 1) {
                console.log("\n🎉 SUCCESS!");
                const finalReserves = await pair.getReserves();
                console.log("Reserve0:", ethers.formatEther(finalReserves[0]));
                console.log("Reserve1:", ethers.formatEther(finalReserves[1]));
            } else {
                console.log("\n❌ Transaction reverted");
            }
        } catch (staticError: any) {
            console.log("\n❌ Static call FAILED. Decoding error...\n");

            // Try to decode the error
            if (staticError.data) {
                console.log("Error data:", staticError.data);

                // Try to decode common errors
                const errorSignatures = {
                    "0x08c379a0": "Error(string)",  // Standard revert
                    "0x4e487b71": "Panic(uint256)", // Panic codes
                };

                const errorSig = staticError.data.slice(0, 10);
                console.log("Error signature:", errorSig);

                if (errorSig === "0x08c379a0") {
                    try {
                        const reason = ethers.AbiCoder.defaultAbiCoder().decode(
                            ["string"],
                            "0x" + staticError.data.slice(10)
                        );
                        console.log("📝 Revert reason:", reason[0]);
                    } catch (e) {
                        console.log("Could not decode error string");
                    }
                } else if (errorSig === "0x4e487b71") {
                    try {
                        const code = ethers.AbiCoder.defaultAbiCoder().decode(
                            ["uint256"],
                            "0x" + staticError.data.slice(10)
                        );
                        console.log("📝 Panic code:", code[0].toString());
                        const panicCodes: Record<string, string> = {
                            "1": "Assertion failed",
                            "17": "Arithmetic overflow/underflow",
                            "18": "Division by zero",
                            "33": "Array access out of bounds",
                            "34": "Storage encoding error",
                            "49": "Pop on empty array",
                            "50": "Array index out of bounds",
                            "65": "Memory allocation error",
                            "81": "Invalid internal function call"
                        };
                        console.log("Meaning:", panicCodes[code[0].toString()] || "Unknown panic");
                    } catch (e) {
                        console.log("Could not decode panic code");
                    }
                }
            }

            console.log("\nFull error message:", staticError.message);

            // Additional diagnostics
            console.log("\n🔍 Additional checks:");
            const token0Contract = await ethers.getContractAt("IERC20", token0);
            const token1Contract = await ethers.getContractAt("IERC20", token1);

            const bal0 = await token0Contract.balanceOf(PAIR_ADDRESS);
            const bal1 = await token1Contract.balanceOf(PAIR_ADDRESS);
            console.log("Token0 balance (via IERC20):", ethers.formatEther(bal0));
            console.log("Token1 balance (via IERC20):", ethers.formatEther(bal1));
        }
    } catch (error: any) {
        console.log("\n💥 Unexpected error:");
        console.log(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
