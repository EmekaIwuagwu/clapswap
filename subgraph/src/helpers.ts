import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts"
import { ERC20 } from "../generated/Factory/ERC20"

export function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let symbolValue = "unknown"
    let symbolResult = contract.try_symbol()
    if (!symbolResult.reverted) {
        symbolValue = symbolResult.value
    }
    return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let nameValue = "unknown"
    let nameResult = contract.try_name()
    if (!nameResult.reverted) {
        nameValue = nameResult.value
    }
    return nameValue
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    let decimalValue = BigInt.fromI32(18)
    let decimalResult = contract.try_decimals()
    if (!decimalResult.reverted) {
        decimalValue = BigInt.fromI32(decimalResult.value)
    }
    return decimalValue
}

export function fetchTokenTotalSupply(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    let totalSupplyValue = BigInt.fromI32(0)
    let totalSupplyResult = contract.try_totalSupply()
    if (!totalSupplyResult.reverted) {
        totalSupplyValue = totalSupplyResult.value
    }
    return totalSupplyValue
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
    if (exchangeDecimals == BigInt.fromI32(0)) {
        return tokenAmount.toBigDecimal()
    }
    return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
    let bd = BigDecimal.fromString("1")
    for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
        bd = bd.times(BigDecimal.fromString("10"))
    }
    return bd
}
