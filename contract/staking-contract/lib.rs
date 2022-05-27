use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Balance, BlockHeight, BorshStorageKey, EpochHeight,
    PanicOnDefault, Promise, PromiseOrValue, Timestamp,
};

pub use crate::account::AccountJson;
use crate::account::*;
use crate::config::*;
use crate::core_impl::*;
use crate::enumeration::*;
use crate::internal::*;
use crate::utils::*;

mod account;
mod config;
mod core_impl;
mod enumeration;
mod internal;
mod utils;

#[derive(BorshDeserialize, BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
    AccountKey,
}

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct StakingContractV1 {
    pub owner_id: AccountId,
    pub ft_contract_id: AccountId,
    pub config: Config,               // Cấu hình công thức trả thưởng cho user
    pub total_stake_balance: Balance, // Số lượng user stake trong contract
    pub total_paid_reward_balance: Balance, // Số lượng thưởng trả cho user
    pub total_staker: Balance,        // Tổng số account đang stake trong contract
    pub pre_reward: Balance,
    pub last_block_balance_change: BlockHeight,
    pub accounts: LookupMap<AccountId, UpgradableAccount>, // Thông tin chi tiết của account map theo accountId
    pub paused: bool, // Khi mình đã hết lượng token để trả cho user -> pause contract lại, user ko thể deposit và reward ko thể đc trả nx
    pub pause_in_block: BlockHeight, // Khi owner thay đổi staking contract sang trạng thái pause -> lưu thông tin block tại thời điểm đấy
}

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[near_bindgen]
pub struct StakingContract {
    pub owner_id: AccountId,
    pub ft_contract_id: AccountId,
    pub config: Config,               // Cấu hình công thức trả thưởng cho user
    pub total_stake_balance: Balance, // Số lượng user stake trong contract
    pub total_paid_reward_balance: Balance, // Số lượng thưởng trả cho user
    pub total_staker: Balance,        // Tổng số account đang stake trong contract
    pub pre_reward: Balance,
    pub last_block_balance_change: BlockHeight,
    pub accounts: LookupMap<AccountId, UpgradableAccount>, // Thông tin chi tiết của account map theo accountId
    pub paused: bool, // Khi mình đã hết lượng token để trả cho user -> pause contract lại, user ko thể deposit và reward ko thể đc trả nx
    pub pause_in_block: BlockHeight, // Khi owner thay đổi staking contract sang trạng thái pause -> lưu thông tin block tại thời điểm đấy
    pub new_data: U128,
}

#[near_bindgen]
impl StakingContract {
    #[init]
    pub fn new_default_config(owner_id: AccountId, ft_contract_id: AccountId) -> Self {
        Self::new(owner_id, ft_contract_id, Config::default())
    }

    #[init]
    pub fn new(owner_id: AccountId, ft_contract_id: AccountId, config: Config) -> Self {
        StakingContract {
            owner_id,
            ft_contract_id,
            config,
            total_stake_balance: 0,
            total_paid_reward_balance: 0,
            total_staker: 0,
            pre_reward: 0,
            last_block_balance_change: env::block_index(),
            accounts: LookupMap::new(StorageKey::AccountKey),
            paused: false,
            pause_in_block: 0,
            new_data: U128(0),
        }
    }

    #[payable]
    // Deposit vào storage để tạo account
    pub fn storage_deposit(&mut self, account_id: Option<AccountId>) {
        assert_at_least_on_yocto();
        let account = account_id.unwrap_or_else(|| env::predecessor_account_id()); // Nếu user ko truyền tham số account_id -> lấy predecessor_account_id (account của contract)
        let account_stake = self.accounts.get(&account);

        if account_stake.is_some() {
            // Nếu đã tồn tại account, refund toàn bộ token deposit
            // TH này, account đã ký rồi và mình ko sử dụng thêm data -> storage used = 0
            refund_deposit(0);
        } else {
            // Tạo account mới
            let before_storage_usage = env::storage_usage();
            self.internal_register_account(account.clone());

            let after_storage_usage = env::storage_usage();

            // Refund lại token deposit còn thừa (lượng deposit trừ đi phí tạo account mới)
            refund_deposit(after_storage_usage - before_storage_usage);
        }
    }

    // Check account đã đăng ký hay chưa
    // User đã đăng ký -> return 1
    // chưa đăng ký -> return 0
    // Sau này, nếu check user chưa đăng ký -> trc khi thực hiện function nào phải gọi thêm hàm storage_deposit, ngược lại thì bỏ qua
    pub fn storage_balance_of(&self, account_id: AccountId) -> U128 {
        let account = self.accounts.get(&account_id);

        if account.is_some() {
            U128(1)
        } else {
            U128(0)
        }
    }

    // Lấy thông tin pool có đang bị paused hay ko (do contract không đủ Near để duy trì storage_data)
    pub fn is_paused(&self) -> bool {
        self.paused
    }

    pub fn get_new_data(&self) -> U128 {
        self.new_data
    }

    // Migrate function: Dùng để update struct cho smart contract on-chain
    // Note: Sau khi migrate xong thì nên xoá hàm này đi (vì vđề bảo mật)
    #[private]
    #[init(ignore_state)]
    pub fn migrate() -> Self {
        let contract_v1: StakingContractV1 = env::state_read().expect("Can not read state data!");

        StakingContract {
            owner_id: contract_v1.owner_id,
            ft_contract_id: contract_v1.ft_contract_id,
            config: contract_v1.config,
            total_stake_balance: contract_v1.total_stake_balance,
            total_paid_reward_balance: contract_v1.total_paid_reward_balance,
            total_staker: contract_v1.total_staker,
            pre_reward: contract_v1.pre_reward,
            last_block_balance_change: contract_v1.last_block_balance_change,
            accounts: contract_v1.accounts,
            paused: contract_v1.paused,
            pause_in_block: contract_v1.pause_in_block,
            new_data: U128(10),
        }
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use super::*; // import các thư viện trên
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, MockedBlockchain};

    // Xây dựng mock context cho blockchain phục vụ unit tests
    fn get_context(is_view: bool) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(0)
            .signer_account_id(accounts(0))
            .predecessor_account_id(accounts(0))
            .is_view(is_view);

        builder
    }

    #[test]
    fn test_init_contract() {
        let context = get_context(false);
        test_env(context.build());

        let config = Config {
            reward_numerator: 500,
            reward_denumerator: 100000,
        };

        let contract =
            StakingContract::new(accounts(1).to_string(), "ft_contract".to_string(), config);

        assert_eq!(contract.owner_id, accounts(1).to_string());
        assert_eq!(contract.ft_contract_id, "ft_contract".to_string());
        assert_eq!(contract.reward_numerator, contract.config.reward_numerator);
        assert_eq!(contract.paused, false);
    }
}
