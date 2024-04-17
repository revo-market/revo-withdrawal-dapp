import styles from "./styles/Home.module.css";
import {useEffect, useMemo, useState} from "react";
import {useAccount, useContractRead, useWriteContract} from "wagmi";
import {farmBrokerBotAbi} from "./constants/abis/farmBrokerBot";
import {
  BROKER_BOT_ADDRESS,
  DEFAULT_MIN_AMOUNT_OUT_PERCENT,
  MAX_UINT256,
  MCUSD_MCEUR_FARM_BOT_ADDRESS, MCUSD_MCEUR_LP_ADDRESS
} from "./constants";
import {erc20abi} from "./constants/abis/erc20";
import {useTransactionDeadline} from "./hooks/useTransactionDeadline";
import {useStakingTokenAmounts} from "./hooks/useStakingTokenAmounts";
import BigNumber from "bignumber.js";

function WriteButton({onClick, text, disabled}: { onClick: () => void, text: string, disabled: boolean }) {
  const className = disabled ? 'btn-disabled' : 'btn'
  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {text}
    </button>
  )
}

function RevoClosureNotice() {
  return (
    <div>
      <p>
        Revo's auto-compounding farm bots are no longer operating. This dapp is for withdrawing your funds.
      </p>
    </div>
  )
}

function ConnectYourWalletReminder() {
  return (
    <div>
      <p>
        Connect your wallet to start using the app.
      </p>
    </div>
  )
}

function BalanceDisplay({balanceUSD}: { balanceUSD: string }) {
  // TODO eventually make more general to handle PACT-CELO pool
  return (
    <div>
      <p>
        Your balance in mcUSD-mcEUR pool: ~${balanceUSD}
      </p>
    </div>
  )
}

function TransactionButtons({onClickApprove, onClickWithdraw, approveStatus, balanceUSD, isConnected}: {
  onClickApprove: () => void,
  onClickWithdraw: () => void,
  approveStatus: string,
  balanceUSD: string,
  isConnected: boolean
}) {
  // todo eventually: check if the user has already approved enough to withdraw
  return (
    <div className={`flex flex-row flex-nowrap justify-center gap-4`}>
      <WriteButton text={'Approve'} onClick={onClickApprove}
                   disabled={approveStatus === 'success' || !isConnected}/>
      <WriteButton onClick={onClickWithdraw} text={'Withdraw'}
                   disabled={approveStatus !== 'success' || !isConnected || new BigNumber(balanceUSD).isEqualTo(0)}/>
    </div>
  )
}

export default function App() {
  // TODO add styling, loading and success states for approve/withdraw buttons
  const {isConnected, address} = useAccount()
  const [isConnectHighlighted, setIsConnectHighlighted] = useState(!isConnected);

  useEffect(() => {
    if (isConnected) {
      setIsConnectHighlighted(false);
    }
  }, [isConnected]);

  const {data: balanceOfRFPData, status: balanceOfRFPStatus} = useContractRead({
    abi: erc20abi,
    address: MCUSD_MCEUR_FARM_BOT_ADDRESS,
    functionName: 'balanceOf',
    args: [address],
  })


  const {
    stakingToken0Amount,
    stakingToken1Amount,
    status: stakingTokenAmountsStatus,
    invalidate: invalidateStakingTokenAmounts
  } = useStakingTokenAmounts(BigInt(balanceOfRFPData as string ?? '0'), MCUSD_MCEUR_FARM_BOT_ADDRESS, MCUSD_MCEUR_LP_ADDRESS)

  const {
    writeContract: approveWriteContract,
    data: approveData,
    status: approveStatus
  } = useWriteContract()

  const {
    writeContract: withdrawWriteContract,
    data: withdrawData,
    status: withdrawStatus
  } = useWriteContract()

  useEffect(() => {
    if (withdrawStatus === 'success') {
      console.log(`withdrawStatus success, invalidating staking token amounts`)
      void invalidateStakingTokenAmounts()
    }
  }, [withdrawStatus, invalidateStakingTokenAmounts])

  function onClickApprove() {
    approveWriteContract?.({
      address: MCUSD_MCEUR_FARM_BOT_ADDRESS,  // todo eventually: support PACT pool too
      abi: erc20abi,
      functionName: 'approve',
      args: [BROKER_BOT_ADDRESS, balanceOfRFPData ?? MAX_UINT256],
    })
  }

  const txDeadline = useTransactionDeadline()
  const balanceUSD = useMemo(() => {
    console.log(`recalculating balanceUSD with stakingToken0Amount ${stakingToken0Amount}`)
    if (stakingToken0Amount === undefined) {
      return '-'
    }
    return (new BigNumber(stakingToken0Amount).times(2).dividedBy(new BigNumber(10).exponentiatedBy(18))).toFixed(2)
  }, [stakingToken0Amount])

  function onClickWithdraw() {
    const amountToWithdraw = (BigInt(balanceOfRFPData as string ?? '0')).toString();
    const amount0Min = (BigInt(stakingToken0Amount ?? 0) * BigInt(DEFAULT_MIN_AMOUNT_OUT_PERCENT) / BigInt(100)).toString();
    const amount1Min = (BigInt(stakingToken1Amount ?? 0) * BigInt(DEFAULT_MIN_AMOUNT_OUT_PERCENT) / BigInt(100)).toString();
    withdrawWriteContract?.({
      address: BROKER_BOT_ADDRESS,
      abi: farmBrokerBotAbi,
      functionName: 'withdrawFPForStakingTokens',
      args: [MCUSD_MCEUR_FARM_BOT_ADDRESS,
        amountToWithdraw,
        amount0Min,
        amount1Min,
        txDeadline],
    })
  }

  const closeAll = () => {
    setIsConnectHighlighted(false);
  };
  return (
    <>
      <header>
        <div
          className={styles.backdrop}
          style={{
            opacity:
              isConnectHighlighted
                ? 1
                : 0,
          }}
        />
        <div className={styles.header}>
          <div>
            <img
              src="/revo-logo.png"
              alt="Revo Logo"
              height="87.5"
              width="436"
            />
          </div>
          <div className={styles.buttons}>
            <div
              onClick={closeAll}
              className={`${styles.highlight} ${
                isConnectHighlighted
                  ? styles.highlightSelected
                  : ``
              }`}
            >
              <w3m-button/>
            </div>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <h1>Withdraw Funds</h1>
            <div className={styles.content}>
              <RevoClosureNotice/>
              <br/>
              {isConnected ? <BalanceDisplay balanceUSD={balanceUSD}/> :
                <ConnectYourWalletReminder/>}
              <br/>
              {isConnected && <TransactionButtons onClickApprove={onClickApprove} isConnected={isConnected}
                                                  approveStatus={approveStatus} onClickWithdraw={onClickWithdraw}
                                                  balanceUSD={balanceUSD}/>}
              {/*{balanceOfRFPStatus && <p>Balance of RFP status: {balanceOfRFPStatus}</p>}*/}
              {/*{<p>Balance of RFP: {(balanceOfRFPData as any)?.toString()}</p>}*/}
              {/*{approveStatus && <p>Approve Status: {approveStatus}</p>}*/}
              {/*{approveData && <p>Approve Data: {approveData}</p>}*/}
              {/*{withdrawData && <p>Withdraw Data: {withdrawData}</p>}*/}
              {/*{withdrawStatus && <p>Withdraw Status: {withdrawStatus}</p>}*/}
              {/*{stakingTokenAmountsStatus && <p>Staking token amounts status: {stakingTokenAmountsStatus}</p>}*/}
              {/*{stakingToken0Amount && <p>Staking token 0 amount: {stakingToken0Amount}</p>}*/}
              {/*{stakingToken1Amount && <p>Staking token 1 amount: {stakingToken1Amount}</p>}*/}
            </div>
          </div>
          <div className={styles.footer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              height={16}
              width={16}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
            <a
              href="https://docs.revo.market"
              target="_blank"
            >
              Check out the full documentation here
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
