import { ethers } from "hardhat";

async function main() {
    // Calculate error signature for "Clapswap: LOCKED"
    const errorString = "Clapswap: LOCKED";
    const hash = ethers.keccak256(ethers.toUtf8Bytes(`Error(string)`));
    console.log("Error(string) selector:", hash.slice(0, 10));

    // The actual error data we received
    const errorData = "0xec442f05";
    console.log("\nReceived error signature:", errorData);

    // Compute what LOCKED would look like
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(["string"], [errorString]);
    console.log("Encoded 'Clapswap: LOCKED':", ethers.keccak256(encoded).slice(0, 10));

    // Check the pair's lock state
    const PAIR_ADDRESS = "0xbEaF27BC6edb5ada6E66B64a921007300F8A87D6";
    const pair = await ethers.getContractAt("ClapswapPair", PAIR_ADDRESS);

    // Unfortunately we can't read the private `unlocked` variable directly
    // But let's see if we can figure it out another way

    console.log("\nPair address:", PAIR_ADDRESS);
    console.log("\nThe error signature 0xec442f05 is a custom error!");
    console.log("It's likely a Solidity custom error, not a require() revert");
    console.log("\nLet me check if the Pair contract was compiled with custom errors...");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
