import { BigInt, BigDecimal, store } from "@graphprotocol/graph-ts"
import { Pair, Token, Factory, Transaction, Mint, Burn, Swap } from "../generated/schema"
import { Mint as MintEvent, Burn as BurnEvent, Swap as SwapEvent, Sync as SyncEvent } from "../generated/templates/Pair/Pair"
import { convertTokenToDecimal } from "./helpers"

export function handleSync(event: SyncEvent): void {
    let pair = Pair.load(event.address.toHexString())
    if (pair === null) return

    let token0 = Token.load(pair.token0)
    let token1 = Token.load(pair.token1)
    if (token0 === null || token1 === null) return

    pair.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals)
    pair.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals)

    // Logic for reserveUSD calculation would go here using a price oracle subgraph
    // For now, we update the raw reserves
    pair.save()
}

export function handleSwap(event: SwapEvent): void {
    let pair = Pair.load(event.address.toHexString())
    if (pair === null) return

    let token0 = Token.load(pair.token0)
    let token1 = Token.load(pair.token1)
    if (token0 === null || token1 === null) return

    let amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals)
    let amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals)
    let amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals)
    let amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals)

    // Track Volume
    let amount0Total = amount0In.plus(amount0Out)
    let amount1Total = amount1In.plus(amount1Out)

    // Update pair stats
    pair.txCount = pair.txCount.plus(BigInt.fromI32(1))
    pair.save()

    // Create Swap entity
    let swap = new Swap(event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString()))
    swap.transaction = event.transaction.hash.toHexString()
    swap.timestamp = event.block.timestamp
    swap.pair = pair.id
    swap.sender = event.params.sender
    swap.amount0In = amount0In
    swap.amount1In = amount1In
    swap.amount0Out = amount0Out
    swap.amount1Out = amount1Out
    swap.to = event.params.to
    swap.amountUSD = BigDecimal.fromString("0") // Would calculate real USD value here
    swap.save()
}

export function handleMint(event: MintEvent): void {
    // Logic for tracking liquidity additions
}

export function handleBurn(event: BurnEvent): void {
    // Logic for tracking liquidity removals
}
