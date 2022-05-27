use near_sdk::{ext_contract, Gas, PromiseResult};

use crate::*;

pub const DEPOSIT_ONE_YOCTO: Balance = 1;
pub const NO_DEPOSIT: Balance = 0;
pub const FT_TRANSFER_GAS: Gas = 10_000_000_000_000;
pub const FT_HARVEST_CALLBACK_GAS: Gas = 10_000_000_000_000;
pub trait FungibleTokenReceiver {
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128>;
}

#[ext_contract(ext_ft_contract)]
pub trait FungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}

#[ext_contract(ext_self)]
pub trait ExtStakingContract {
    fn ft_transfer_callback(&mut self, amount: U128, account_id: AccountId);
    fn ft_withdraw_callback(&mut self, account_id: AccountId, old_account: Account); // Trong TH bị lỗi: sử dụng old_account để rollback lại token cho user
}

#[near_bindgen]
impl FungibleTokenReceiver for StakingContract {
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        self.internal_deposit_and_stake(sender_id, amount.0);

        // Nếu internal_deposit_and_stake() thành công -> Trả về U128(0) (dùng hết token của user để deposit, ko trả lại gì cả)
        PromiseOrValue::Value(U128(0))
        // Nếu internal_deposit_and_stake() lỗi -> gọi hàm ft_resolve_transfer() để rollback toàn bộ token cho users
    }
}

#[near_bindgen]
impl StakingContract {
    // Function unstake
    #[payable]
    pub fn unstake(&mut self, amount: U128) {
        assert_one_yocto();

        let account_id = env::predecessor_account_id();

        self.internal_unstake(account_id, amount.0); // amount.0 để chuyển về dạng u128
    }

    #[payable]
    pub fn withdraw(&mut self) -> Promise {
        assert_one_yocto();
        let account_id = env::predecessor_account_id();
        // Thực hiện withdraw, trả về giá trị account trước khi withdraw (phòng khi lỗi thì có thể rollback)
        let old_account = self.internal_withdraw(account_id.clone());

        // Sau khi trừ unstake_balance -> thực hiện cross contract call để transfer ft token sang
        ext_ft_contract::ft_transfer(
            account_id.clone(),
            U128(old_account.unstake_balance),
            Some("Staking contract withdraw".to_string()),
            &self.ft_contract_id,
            DEPOSIT_ONE_YOCTO,
            FT_TRANSFER_GAS,
        )
        .then(ext_self::ft_withdraw_callback(
            account_id.clone(),
            old_account,
            &env::current_account_id(),
            NO_DEPOSIT,
            FT_HARVEST_CALLBACK_GAS,
        ))
    }

    // Function user sẽ call để rút token ra (yêu cầu user deposit 1 yoctoNEAR)
    #[payable]
    pub fn harvest(&mut self) -> Promise {
        assert_one_yocto();
        let account_id = env::predecessor_account_id();
        let upgradable_account = self.accounts.get(&account_id).unwrap();
        let account = Account::from(upgradable_account);

        // Calculate reward
        let new_reward: Balance = self.internal_calculate_account_reward(&account);
        let current_reward = account.pre_reward + new_reward;

        assert!(current_reward > 0, "ERR_REWARD_EQUAL_ZERO");

        // Transfer toàn bộ current_reward từ staking contract sang tài khoản của user
        ext_ft_contract::ft_transfer(
            account_id.clone(),
            U128(current_reward),
            Some("Staking contract harvest".to_string()),
            &self.ft_contract_id,
            DEPOSIT_ONE_YOCTO,
            FT_TRANSFER_GAS,
        )
        .then(ext_self::ft_transfer_callback(
            U128(current_reward),
            account_id.clone(),
            &env::current_account_id(),
            NO_DEPOSIT,
            FT_HARVEST_CALLBACK_GAS,
        ))
    }

    #[private]
    pub fn ft_transfer_callback(&mut self, amount: U128, account_id: AccountId) -> U128 {
        // Check env::promise_results_count() = 1. Vì chỉ có 1 contract. Nếu = 2 -> Bị duplicate hoặc bị lỗi
        assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULT");

        // Check promise result[0]
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Failed => env::panic(b"ERROR_CALLBACK"),
            // TH thành công -> Cập nhập lại reward cho user
            PromiseResult::Successful(_value) => {
                let upgradable_account = self.accounts.get(&account_id).unwrap();
                let mut account = Account::from(upgradable_account);

                // Đưa reward của user về 0 rồi cập nhật lại các thông tin khác
                account.pre_reward = 0;
                account.last_block_balance_change = env::block_index();

                // Cập nhật lại thông tin account
                self.accounts
                    .insert(&account_id, &UpgradableAccount::from(account));

                self.total_paid_reward_balance += amount.0;
                amount
            }
        }
    }

    pub fn ft_withdraw_callback(&mut self, account_id: AccountId, old_account: Account) -> U128 {
        // Kiểm tra có kết quả ko
        assert_eq!(env::promise_results_count(), 1, "ERR_TOO_MANY_RESULTS");
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(_value) => U128(old_account.unstake_balance),
            // Nếu thất bại -> Rollback data (insert lại old_account)
            PromiseResult::Failed => {
                self.accounts
                    .insert(&account_id, &UpgradableAccount::from(old_account));
                U128(0)
            }
        }
    }
}
