import { Contract } from "near-api-js";
import {
  wallet,
  config,
  Transaction,
  executeMultipleTransactions,
  getGas,
  STAKING_STORAGE_AMOUNT,
  ONE_YOCTO_NEAR,
} from "./near";

const stakingContract = new Contract(
  wallet.account(),
  config.ZNG_STAKING_CONTRACT,
  {
    viewMethods: [
      "get_account_info",
      "get_account_reward",
      "get_pool_info",
      "storage_balance_of",
    ],
    changeMethods: ["storage_deposit", "harvest", "unstake", "withdraw"],
  }
);

const stakeToken = async (amount: string) => {
  // Execute multi transaction: 1. deposit staking storage, 2. ft transfer call
  // batch transaction
  let ftTransferCall: Transaction = {
    receiverId: config.ZNG_FT_CONTRACT,
    functionCalls: [
      {
        methodName: "ft_transfer_call",
        args: {
          receiver_id: config.ZNG_STAKING_CONTRACT,
          amount,
          msg: "",
        },
        gas: "60000000000000",
        amount: ONE_YOCTO_NEAR,
      },
    ],
  };

  let transactions: Transaction[] = [ftTransferCall];

  // Check storage balance
  //@ts-ignore
  let storageStatus: string = await stakingContract.storage_balance_of({
    account_id: wallet.getAccountId(),
  });

  if (!parseInt(storageStatus)) {
    let stakingDepositStorage: Transaction = {
      receiverId: config.ZNG_STAKING_CONTRACT,
      functionCalls: [
        {
          methodName: "storage_deposit",
          args: {},
          gas: "10000000000000",
          amount: STAKING_STORAGE_AMOUNT,
        },
      ],
    };

    transactions.unshift(stakingDepositStorage);
  }

  await executeMultipleTransactions(transactions);
};

const unstake = async (amount: string) => {
  //@ts-ignore
  await stakingContract.unstake({ amount }, 30000000000000, 1);
};

const harvest = async () => {
  //@ts-ignore
  await stakingContract.harvest({}, 60000000000000, 1);
};

const withdraw = async () => {
  //@ts-ignore
  await stakingContract.withdraw({}, 60000000000000, 1);
};

export { stakingContract, stakeToken, unstake, harvest, withdraw };
