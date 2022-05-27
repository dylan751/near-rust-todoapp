use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Clone, Copy)]
#[serde(crate = "near_sdk::serde")]
pub struct Config {
    pub reward_numerator: u32,
    pub reward_denumerator: u64,
}

impl Default for Config {
    fn default() -> Self {
        // APR 15% - 18%
        Self {
            reward_numerator: 715,
            reward_denumerator: 1_000_000_000,
        } // Reward per block
    }
}
