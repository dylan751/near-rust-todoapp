import { Near, keyStores, utils } from "near-api-js";
import { functionCall } from "near-api-js/lib/transaction";
import BN from "bn.js";
import getConfig from "./config";
import SpecialWallet from "./SpecialWallet";

const env: string = process.env.NEAR_ENV || "development";
export const config: any = getConfig(env);

export const near = new Near({
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  headers: {},
  ...config,
});

export const STAKING_STORAGE_AMOUNT = "0.01";
export const FT_STORAGE_AMOUNT = "0.01";
export const ONE_YOCTO_NEAR = "0.000000000000000000000001";

export const wallet = new SpecialWallet(near, config.VBI_STAKING_CONTRACT);

export const getGas = (gas: string) =>
  gas ? new BN(gas) : new BN("100000000000000");
export const getAmount = (amount: string) =>
  amount ? new BN(utils.format.parseNearAmount(amount)) : new BN("0");

export interface ViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface FunctionCallOptions extends ViewFunctionOptions {
  gas?: string;
  amount?: string;
}

export interface Transaction {
  receiverId: string;
  functionCalls: FunctionCallOptions[];
}

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const nearTransactions = await Promise.all(
    transactions.map((t, i) => {
      return wallet.createTransaction({
        receiverId: t.receiverId,
        nonceOffset: i + 1,
        actions: t.functionCalls.map((fc) =>
          functionCall(
            fc.methodName,
            fc.args,
            getGas(fc.gas),
            getAmount(fc.amount)
          )
        ),
      });
    })
  );

  return await wallet.requestSignTransactions(nearTransactions, callbackUrl);
};

export const login = async () => {
  await wallet.requestSignIn(config.VBI_STAKING_CONTRACT);
};

export const logout = () => {
  wallet.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
};

/**
 * Parse token amount to human readable value
 * @param amount
 * @param decimals
 */
export function parseTokenWithDecimals(amount: number, decimals: number) {
  let amountD = amount / Math.pow(10, decimals);
  return Math.floor(amountD * 100) / 100;
}

/**
 * Parse token balance to token amount for transfer
 * @param amount
 * @param decimals
 */
export function parseTokenAmount(amount: number, decimals: number) {
  let parsedNumber: { dec: number; num: number } = parseFloatToInt(amount);
  let decBN = new BN(decimals - parsedNumber.dec);
  let ten = new BN(10);
  let amountBN = new BN(parsedNumber.num);
  return amountBN.mul(ten.pow(decBN));
}

/**
 * Return int number and decimals
 * @param num float number
 */
function parseFloatToInt(num: number) {
  if (!num)
    return {
      num: 0,
      dec: 0,
    };
  let numString: string[] = num.toString().split(".");

  if (numString.length == 1) {
    return {
      num: parseInt(numString[0]),
      dec: 0,
    };
  }

  if (numString.length == 2) {
    return {
      num: parseInt(numString.join("")),
      dec: numString[1].length,
    };
  }
}

export const toReadableNumber = (
  decimals: number,
  number: string = "0"
): number => {
  if (!decimals) return new BN(number).toNumber();

  const wholeStr = number.substring(0, number.length - decimals) || "0";
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, "0")
    .substring(0, decimals);

  let data = `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, "");
  let decimalNum = data.split(".");

  return decimalNum.length == 1
    ? parseInt(decimalNum[0])
    : parseFloat(`${decimalNum[0]}.${decimalNum[1].substring(0, 2)}`);
};

export const toReadableNumberString = (
  decimals: number,
  number: string = "0"
): string => {
  if (!decimals) return number;

  const wholeStr = number.substring(0, number.length - decimals) || "0";
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, "0")
    .substring(0, decimals);

  let data = `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, "");
  let decimalNum = data.split(".");
  return decimalNum.length == 1
    ? formatNumber(parseInt(decimalNum[0]))
    : `${formatNumber(parseInt(decimalNum[0]))}.${decimalNum[1].substring(
        0,
        2
      )}`;
};

export function formatNumber(num: number) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
