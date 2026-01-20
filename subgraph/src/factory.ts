import { PairCreated } from "../generated/Factory/Factory"
import { Factory, Pair, Token } from "../generated/schema"
import { Pair as PairTemplate } from "../generated/templates"
import { fetchTokenSymbol, fetchTokenName, fetchTokenDecimals, fetchTokenTotalSupply } from "./helpers"
import { BigInt, BigDecimal, Address } from "@graphprotocol/graph-ts"

export function handlePairCreated(event: PairCreated): void {
    let factory = Factory.load("1")
    if (factory === null) {
        factory = new Factory("1")
        factory.pairCount = 0
        factory.totalVolumeUSD = BigDecimal.fromString("0")
        factory.totalLiquidityUSD = BigDecimal.fromString("0")
        factory.txCount = BigInt.fromI32(0)
    }
    factory.pairCount = factory.pairCount + 1
    factory.save()

    let token0 = Token.load(event.params.token0.toHexString())
    if (token0 === null) {
        token0 = new Token(event.params.token0.toHexString())
        token0.symbol = fetchTokenSymbol(event.params.token0)
        token0.name = fetchTokenName(event.params.token0)
        token0.decimals = fetchTokenDecimals(event.params.token0)
        token0.totalSupply = fetchTokenTotalSupply(event.params.token0)
        token0.tradeVolumeUSD = BigDecimal.fromString("0")
        token0.totalLiquidity = BigDecimal.fromString("0")
        token0.save()
    }

    let token1 = Token.load(event.params.token1.toHexString())
    if (token1 === null) {
        token1 = new Token(event.params.token1.toHexString())
        token1.symbol = fetchTokenSymbol(event.params.token1)
        token1.name = fetchTokenName(event.params.token1)
        token1.decimals = fetchTokenDecimals(event.params.token1)
        token1.totalSupply = fetchTokenTotalSupply(event.params.token1)
        token1.tradeVolumeUSD = BigDecimal.fromString("0")
        token1.totalLiquidity = BigDecimal.fromString("0")
        token1.save()
    }

    let pair = new Pair(event.params.pair.toHexString())
    pair.token0 = token0.id
    pair.token1 = token1.id
    pair.reserve0 = BigDecimal.fromString("0")
    pair.reserve1 = BigDecimal.fromString("0")
    pair.totalSupply = BigDecimal.fromString("0")
    pair.reserveUSD = BigDecimal.fromString("0")
    pair.volumeUSD = BigDecimal.fromString("0")
    pair.txCount = BigInt.fromI32(0)
    pair.save()

    PairTemplate.create(event.params.pair)
}
