import { Pool, Position, NonfungiblePositionManager, nearestUsableTick } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import { Percent, Token, CurrencyAmount } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'

async function getPoolImmutables(poolContract) {
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
        poolContract.factory(),
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.maxLiquidityPerTick(),
    ])

    const immutables = {
        factory,
        token0,
        token1,
        fee,
        tickSpacing,
        maxLiquidityPerTick,
    }
    return immutables
}

async function getPoolState(poolContract) {
    const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])

    const PoolState = {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    }

    return PoolState
}

export async function FetchPrice(token0, token1, poolContract, ChainId) {
    const [immutables, state] = await Promise.all([getPoolImmutables(poolContract), getPoolState(poolContract)])
    const TokenA = new Token(ChainId, immutables.token0, token0.decimals, token0.symbol, token0.name)
    const TokenB = new Token(ChainId, immutables.token1, token1.decimals, token1.symbol, token1.name)
    // console.log(token0, token1, poolContract, ChainId);
    const pool = new Pool(
        TokenA,
        TokenB,
        immutables.fee,
        state.sqrtPriceX96.toString(),
        state.liquidity.toString(),
        state.tick
    )
    // console.log(pool.token0Price, pool.token0Price.toFixed(4));
    return pool.token0Price.toFixed(4);
}

    // async function FetchPrice() {
    //     const [immutables, state] = await Promise.all([getPoolImmutables(), getPoolState()])
    //     const TokenA = new Token(1, immutables.token0, 6, 'USDC11', 'USD Coin22222')
    //     const TokenB = new Token(1, immutables.token1, 6, 'DAI11', 'DAI111111')
    //     const pool = new Pool(
    //         TokenA,
    //         TokenB,
    //         immutables.fee,
    //         state.sqrtPriceX96.toString(),
    //         state.liquidity.toString(),
    //         state.tick
    //     )
    //     console.log(pool.token1Price);
    // }