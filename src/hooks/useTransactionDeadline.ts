import {useBlock} from 'wagmi'
import {CELO_BLOCK_TIME_MS, DEFAULT_TX_DEADLINE_SECONDS} from "../constants";

export function useTransactionDeadline(): BigInt {
  const {data} = useBlock({query: {refetchInterval: CELO_BLOCK_TIME_MS}})
  const timeToWait = BigInt(DEFAULT_TX_DEADLINE_SECONDS);
  return data?.timestamp ? data.timestamp + timeToWait : BigInt(Math.ceil(Date.now() / 1000)) + timeToWait
}
