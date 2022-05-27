use crate::*;

#[near_bindgen]
impl StakingContract {
    pub(crate) fn internal_unstake(&mut self, account_id: AccountId, amount: u128) {
        // Check xem số lượng token user muốn unstake có < số lượng token user đang stake ko
        let upgradable_account = self.accounts.get(&account_id).unwrap();
        let mut account: Account = Account::from(upgradable_account);

        assert!(
            amount <= account.stake_balance,
            "ERR_AMOUNT_MUST_LESS_THAN_STAKE_BALANCE"
        );

        let new_reward = self.internal_calculate_account_reward(&account);

        // Update account data
        account.pre_reward += new_reward;
        account.stake_balance -= amount;
        account.last_block_balance_change = env::block_index();
        account.unstake_balance += amount;
        account.unstake_start_timestamp = env::block_timestamp();
        // Cho phép user withdraw ở 1 epoch sau khi unstake
        account.unstake_available_epoch = env::epoch_height() + 1;

        if account.stake_balance == 0 {
            self.total_staker -= 1;
        }

        self.accounts
            .insert(&account_id, &UpgradableAccount::from(account));

        // Thay đổi 1 số thông tin trong staking pool sau khi user unstake
        let new_contract_reward = self.internal_calculate_global_reward();
        self.pre_reward += new_contract_reward;
        self.last_block_balance_change = env::block_index();
        self.total_stake_balance -= amount;
    }

    pub(crate) fn internal_withdraw(&mut self, account_id: AccountId) -> Account {
        let upgradable_account = self.accounts.get(&account_id).unwrap();
        let account = Account::from(upgradable_account);

        assert!(
            account.unstake_balance > 0,
            "ERR_UNSTAKE_BALANCE_EQUAL_ZERO"
        );
        // Epoch ở thời điểm hiện tại phải > unstake epoch (cơ chế khoá unstake amount trong 1 epoch mới cho user withdraw)
        assert!(
            account.unstake_available_epoch <= env::epoch_height(),
            "ERR_DISABLED_WITHDRAW"
        );

        let new_account = Account {
            stake_balance: account.stake_balance,
            pre_reward: account.pre_reward,
            last_block_balance_change: account.last_block_balance_change,
            unstake_balance: 0, // Withdraw hết số unstake -> đưa unstake về 0
            unstake_start_timestamp: 0,
            unstake_available_epoch: 0,
            new_account_data: account.new_account_data,
        };

        self.accounts.insert(&account_id, &UpgradableAccount::from(new_account));

        account
    }

    pub(crate) fn internal_deposit_and_stake(&mut self, account_id: AccountId, amount: u128) {
        // Validate data
        let upgradable_account = self.accounts.get(&account_id);
        assert!(upgradable_account.is_some(), "ERR_ACCOUNT_NOT_FOUND");
        assert_eq!(self.paused, false, "ERR_CONTRACT_PAUSED");
        assert_eq!(
            self.ft_contract_id,
            env::predecessor_account_id(),
            "ERR_INVALID_FT_CONTRACT_ID"
        );

        let mut account = Account::from(upgradable_account.unwrap());

        // Nếu đây là deposit lần đầu của user -> staker_count += 1 (thêm 1 staker vào pool)
        if account.stake_balance == 0 {
            self.total_staker += 1;
        }

        // Nếu user đã từng deposit -> Phải tính lại rewward
        let new_reward = self.internal_calculate_account_reward(&account);

        // Update account data
        account.pre_reward += new_reward;
        account.stake_balance += amount;
        account.last_block_balance_change = env::block_index();

        self.accounts
            .insert(&account_id, &UpgradableAccount::from(account));

        // Update pool data
        let new_contract_reward = self.internal_calculate_global_reward();
        self.total_stake_balance += amount;
        self.pre_reward += new_contract_reward;
        self.last_block_balance_change = env::block_index();
    }

    // Thêm 1 account mới vào LookupMap 'accounts'
    pub(crate) fn internal_register_account(&mut self, account_id: AccountId) {
        let account = Account {
            stake_balance: 0,
            pre_reward: 0,
            last_block_balance_change: env::block_index(),
            unstake_balance: 0,
            unstake_start_timestamp: 0,
            unstake_available_epoch: 0,
            new_account_data: U128(0),
        };

        self.accounts
            .insert(&account_id, &UpgradableAccount::from(account));
    }

    // Tính new_reward của 1 account (từ thời điểm thay đổi lượng stake gần nhất đến htai)
    pub(crate) fn internal_calculate_account_reward(&self, account: &Account) -> Balance {
        // lấy block cuối cùng:
        // Nếu contract đã bị paused -> block cuối = self.pause_in_block (block tại thời điểm contract khoá)
        // Nếu contract chưa bị paused -> block cuối trong là block htai
        let lasted_block = if self.paused {
            self.pause_in_block
        } else {
            env::block_index()
        };

        // diff_block = block cuối - block gần nhất mà user thay đổi lượng token
        let diff_block = lasted_block - account.last_block_balance_change;
        let reward: Balance =
            (account.stake_balance * self.config.reward_numerator as u128 * diff_block as u128)
                / self.config.reward_denumerator as u128;

        reward
    }

    // Tính new_reward của cả pool (từ thời điểm thay đổi lượng stake gần nhất đến htai)
    pub(crate) fn internal_calculate_global_reward(&self) -> Balance {
        // lấy block cuối cùng:
        // Nếu contract đã bị paused -> block cuối = self.pause_in_block (block tại thời điểm contract khoá)
        // Nếu contract chưa bị paused -> block cuối trong là block htai
        let lasted_block = if self.paused {
            self.pause_in_block
        } else {
            env::block_index()
        };

        // diff_block = block cuối - block gần nhất mà user thay đổi lượng token
        let diff_block = lasted_block - self.last_block_balance_change;
        let reward: Balance =
            (self.total_stake_balance * self.config.reward_numerator as u128 * diff_block as u128)
                / self.config.reward_denumerator as u128;

        reward
    }
}
