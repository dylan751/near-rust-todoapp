use crate::*;

pub(crate) fn assert_at_least_on_yocto() {
    assert!(
        env::attached_deposit() >= 1,
        "Required attached deposit of at least 1 yoctoNEAR"
    )
}

pub(crate) fn assert_one_yocto() {
    assert_eq!(
        env::attached_deposit(),
        1,
        "Required attached deposit of exactly 1 yoctoNEAR"
    )
}

pub(crate) fn refund_deposit(storage_used: u64) {
    // Phí yêu cầu trả = phí storage của 1 byte * số lượng byte storage sử dụng
    let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit();

    assert!(attached_deposit >= required_cost, "Must attach {} yoctoNear to cover storage", required_cost);

    let refund = attached_deposit - required_cost;
    if refund > 0 {
        Promise::new(env::predecessor_account_id()).transfer(refund);
    }
}