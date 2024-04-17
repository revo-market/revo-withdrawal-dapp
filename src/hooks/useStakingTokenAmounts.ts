import {useReadContract, useReadContracts} from "wagmi";
import {farmBotAbi} from "../constants/abis/farmBot";
import {Address} from "viem";
import {liquidityPoolAbi} from "../constants/abis/liquidityPool";
import {InvalidateQueryFilters, useQueryClient} from "@tanstack/react-query";
import {useCallback} from "react";

/**
 * Convert an amount of Revo Farm Points (RFP) to an amount of staking tokens
 *  that the RFP is worth
 *
 * @param rfpAmount
 * @param farmBotAddress
 * @param lpAddress
 * @returns [stakingToken0Amount, stakingToken1Amount]
 */
export function useStakingTokenAmounts(rfpAmount: BigInt, farmBotAddress: Address, lpAddress: Address): { stakingToken0Amount: string | undefined, stakingToken1Amount: string | undefined, status: 'error' | 'pending' | 'success', invalidate: () => Promise<void> } {
  const fpContract = {
    address: farmBotAddress,
    abi: farmBotAbi
  } as const
  const lpContract = {
    abi: liquidityPoolAbi,
    address: lpAddress
  } as const
  const {data, status, queryKey} = useReadContracts({
    contracts: [
      {...fpContract, functionName: 'getLpAmount', args: [rfpAmount]},
      {...lpContract, functionName: 'getReserves'},
      {...lpContract, functionName: 'totalSupply'},
    ]
  })
  const queryClient = useQueryClient()
  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries(queryKey as InvalidateQueryFilters)
  }, [queryClient, queryKey])
  if (!data) {
    return {
      stakingToken0Amount: undefined,
      stakingToken1Amount: undefined,
      status,
      invalidate
    }
  }
  const [{result: lpAmount}, {result: reserves}, {result: lpTotalSupply}] = data
  const stakingToken0Amount = (BigInt((reserves as [string, string] | undefined)?.[0] ?? 0) * BigInt(lpAmount as string ?? 0) / BigInt(lpTotalSupply as string ?? 1)).toString();
  const stakingToken1Amount = (BigInt((reserves as [string, string] | undefined)?.[1] ?? 0) * BigInt(lpAmount as string ?? 0) / BigInt(lpTotalSupply as string ?? 1)).toString(); // todo eventually make more DRY
  return {
    stakingToken0Amount,
    stakingToken1Amount,
    status,
    invalidate
  }
}
