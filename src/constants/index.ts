import {Address} from "viem"


export enum FarmBot {
  mcUSD_mcEUR = 'mcUSD_mcEUR',
  PACT_CELO = 'PACT_CELO',
}

export const FARM_BOT_ADDRESSES: Record<FarmBot, Address> = {
  [FarmBot.mcUSD_mcEUR]: '0xCB34fbfC3b9a73bc04D2eb43B62532c7918d9E81',
  [FarmBot.PACT_CELO]:
    '0xec17fb85529a6a48cb6ed7e3c1d1a7cc57d742c1',
}

export const FARM_BOT_LP_ADDRESSES: Record<FarmBot, Address> = {
  [FarmBot.mcUSD_mcEUR]: '0xF94fEA0C87D2b357DC72b743b45A8cB682b0716E',
  [FarmBot.PACT_CELO]: '0x39AC98447f28612D3583e46E57cb106337FCAe3F',
}

export const FARM_BOT_STAKING_TOKENS: Record<FarmBot, [string, string]> = {
  [FarmBot.mcUSD_mcEUR]: ['mcUSD', 'mcEUR'],
  [FarmBot.PACT_CELO]: ['PACT', 'CELO'],
}

export const BROKER_BOT_ADDRESS = '0x97d0D4ae7841c9405A80fB8004dbA96123e076De'
export const MAX_UINT256 = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
export const CELO_BLOCK_TIME_MS = 5000
export const DEFAULT_TX_DEADLINE_SECONDS = 60 * 5
export const DEFAULT_MIN_AMOUNT_OUT_PERCENT = 97
