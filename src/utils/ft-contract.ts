import { Contract } from "near-api-js";
import { wallet, config } from "./near";

const ftContract = new Contract(wallet.account(), config.ZNG_FT_CONTRACT, {
  viewMethods: ["ft_metadata", "ft_balance_of", "storage_balance_of"],
  changeMethods: ["ft_transfer", "ft_transfer_call"],
});

export default ftContract;