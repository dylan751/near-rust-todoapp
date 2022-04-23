// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, setup_alloc, AccountId};

setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct TodoApp {
    records: LookupMap<AccountId, String>,
    todos: UnorderedMap<usize, Todo>,
    owner: AccountId,
}

impl Default for TodoApp {
    fn default() -> Self {
        Self {
            records: LookupMap::new(b"records".to_vec()),
            todos: UnorderedMap::new(b"todos".to_vec()),
            owner: env::signer_account_id(),
        }
    }
}

#[derive(Clone, Deserialize, Serialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Todo {
    id: usize,
    is_done: bool,
    title: String,
    author: AccountId,
}

#[near_bindgen]
impl TodoApp {
    pub fn create_todo(&mut self, title: String) -> usize {
        let rand_num: usize = *env::random_seed().get(0).unwrap() as usize;
        let author = env::signer_account_id();

        let todo = Todo {
            id: rand_num,
            is_done: false,
            title,
            author,
        };

        self.todos.insert(&todo.id, &todo);
        todo.id
    }

    pub fn delete_todo(&mut self, todo_id: usize) -> usize {
        // Check if current user is the owner or not
        let account_id = env::signer_account_id();
        assert_eq!(account_id, self.owner, "Only owner can delete todos!");

        self.todos.remove(&todo_id);
        todo_id
    }

    // Get 1 post
    pub fn get_todo(&self, todo_id: usize) -> Todo {
        self.todos.get(&todo_id).unwrap().clone()
    }

    // Get all posts
    pub fn get_all_todos(&self) -> Vec<Todo> {
        self.todos.values_as_vector().to_vec()
    }

    pub fn update_todo_state(&mut self, todo_id: usize) -> Todo {
        // Check if current user is the owner or not
        let account_id = env::signer_account_id();
        assert_eq!(account_id, self.owner, "Only owner can update todo state!");

        let todo = self.todos.get(&todo_id).unwrap();
        assert_eq!(account_id, todo.author, "Only owner can update todo state!");

        let new_todo = Todo {
            id: todo.id,
            is_done: !todo.is_done, // Revert the state of the todo
            title: todo.title,
            author: todo.author,
        };

        // Update
        self.todos.insert(&todo_id, &new_todo);
        new_todo
    }

    pub fn update_todo_title(&mut self, todo_id: usize, title: String) -> Todo {
        // Check if current user is the owner or not
        let account_id = env::signer_account_id();
        assert_eq!(account_id, self.owner, "Only owner can update todos!");

        let todo = self.todos.get(&todo_id).unwrap();
        assert_eq!(account_id, todo.author, "Only owner can update todos!");

        let new_todo = Todo {
            id: todo.id,
            is_done: todo.is_done,
            title, // Update new title
            author: todo.author,
        };

        // Update
        self.todos.insert(&todo_id, &new_todo);
        new_todo
    }
}

/*
 * The rest of this file holds the inline tests for the code above
 *
 * To run from contract directory:
 * cargo test -- --nocapture
 * 
 * From project root, to run in combination with frontend tests:
 * yarn test
 *
 */
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    // mock the context for testing, notice "signer_account_id" that was accessed above from env::
    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 19,
        }
    }

    #[test]
    fn test_create_todo() {
        let context = get_context(vec![], false);
        testing_env!(context);

        let mut contract = TodoApp::default();
        let todo_id = contract.create_todo("Cleaning House".to_string());
        let todo = contract.get_todo(todo_id);
        assert_eq!(todo.title, "Cleaning House".to_string());

        // Create another todo
        let todo_id = contract.create_todo("Washing dishes".to_string());
        let todo = contract.get_todo(todo_id);
        assert_eq!(todo.title, "Washing dishes".to_string());
    }
}
