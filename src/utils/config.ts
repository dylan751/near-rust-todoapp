const CONTRACT_NAME = process.env.CONTRACT_NAME || "todo-app";

function getConfig(env: string) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        contractName: CONTRACT_NAME,
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
        ZNG_STAKING_CONTRACT: "staking.vbidev.near",
        ZNG_FT_CONTRACT: "ft.vbidev.near",
        ZNG_FAUCET_FT_CONTRACT: "faucet-vbic.vbidev.near",
        ZNG_SIMPLE_POOL_CONTRACT: "simple-pool.vbidev.near",
        WRAP_NEAR_CONTRACT: "wrap.near",
      };
    case "development":
    case "testnet":
      return {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        contractName: CONTRACT_NAME,
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
        ZNG_STAKING_CONTRACT: "staking.duongnh.testnet",
        ZNG_FT_CONTRACT: "ft.duongnh.testnet",
        ZNG_FAUCET_FT_CONTRACT: "faucet-vbic.vbidev.testnet",
        ZNG_SIMPLE_POOL_CONTRACT: "simple-pool.vbidev.testnet",
        WRAP_NEAR_CONTRACT: "wrap.testnet",
      };
    default:
      throw Error(
        `Unconfigured environment '${env}'. Can be configured in src/config.js.`
      );
  }
}

export default getConfig;
