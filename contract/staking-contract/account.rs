use crate::*;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AccountV1 {
    pub stake_balance: Balance,
    // Để tính lượng reward cho user
    // Timeline: t1 ---------> t2 ----------> now
    // Balance: 100k          200k
    // Giả sử đến t2 user deposit thêm 100k
    // -> Cách tính reward = (Reward từ t1->t2 ứng với 100k (pre_reward)) + (reward từ t2->now ứng với 200k)
    pub pre_reward: Balance,
    pub last_block_balance_change: BlockHeight,
    // Cho phép user unstake, nhưng lượng Token unstake sẽ bị locked lại trong 1 epoch
    // VD: User unstake ở epoch 100 -> sang epoch 101 user mới đc rút về ví
    pub unstake_balance: Balance,
    // Thời điểm user unstake
    pub unstake_start_timestamp: Timestamp,
    pub unstake_available_epoch: EpochHeight,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Account {
    pub stake_balance: Balance,
    // Để tính lượng reward cho user
    // Timeline: t1 ---------> t2 ----------> now
    // Balance: 100k          200k
    // Giả sử đến t2 user deposit thêm 100k
    // -> Cách tính reward = (Reward từ t1->t2 ứng với 100k (pre_reward)) + (reward từ t2->now ứng với 200k)
    pub pre_reward: Balance,
    pub last_block_balance_change: BlockHeight,
    // Cho phép user unstake, nhưng lượng Token unstake sẽ bị locked lại trong 1 epoch
    // VD: User unstake ở epoch 100 -> sang epoch 101 user mới đc rút về ví
    pub unstake_balance: Balance,
    // Thời điểm user unstake
    pub unstake_start_timestamp: Timestamp,
    pub unstake_available_epoch: EpochHeight,
    pub new_account_data: U128,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub enum UpgradableAccount {
    V1(AccountV1),
    Current(Account),
}

impl From<UpgradableAccount> for Account {
    fn from(upgradable_account: UpgradableAccount) -> Self {
        match upgradable_account {
            UpgradableAccount::Current(account) => account,
            UpgradableAccount::V1(account_v1) => Account {
                stake_balance: account_v1.stake_balance,
                pre_reward: account_v1.pre_reward,
                last_block_balance_change: account_v1.last_block_balance_change,
                unstake_balance: account_v1.unstake_balance,
                unstake_start_timestamp: account_v1.unstake_start_timestamp,
                unstake_available_epoch: account_v1.unstake_available_epoch,
                new_account_data: U128(100),
            },
        }
    }
}

impl From<Account> for UpgradableAccount {
    fn from(account: Account) -> Self {
        UpgradableAccount::Current(account)
    }
}

// Struct để hiển thị thông tin Account trả về client
#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AccountJson {
    pub account_id: AccountId,
    pub stake_balance: U128,
    pub unstake_balance: U128,
    pub reward: U128,
    // Nếu tgian từ lúc user request unstake đã vượt qua 1 epoch thì cho withdraw
    pub can_withdraw: bool,
    pub unstake_start_timestamp: Timestamp,
    pub unstake_available_epoch: EpochHeight,
    // Đối chiếu xem ở epoch htai thì user có thể withdraw chưa
    pub current_epoch: EpochHeight,
    pub new_account_data: U128,
}

impl AccountJson {
    pub fn from(account_id: AccountId, new_reward: Balance, account: Account) -> Self {
        AccountJson {
            account_id,
            stake_balance: U128(account.stake_balance),
            unstake_balance: U128(account.unstake_balance),
            // Timeline: t1 ---------> t2 ----------> now
            // Balance: 100k          200k
            // Giả sử đến t2 user deposit thêm 100k
            // pre_reward: Phần thưởng từ t1 - > t2
            // new_reward: Phần thưởng từ t2 -> now
            // reward từ t1 -> now = pre_reward + new_reward
            reward: U128(account.pre_reward + new_reward),
            can_withdraw: account.unstake_available_epoch <= env::epoch_height(),
            unstake_start_timestamp: account.unstake_start_timestamp,
            unstake_available_epoch: account.unstake_available_epoch,
            current_epoch: env::epoch_height(),
            new_account_data: account.new_account_data,
        }
    }
}
