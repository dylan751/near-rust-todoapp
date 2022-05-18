import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import { login, logout } from '../utils';
import '../global.css';
import Todos from '../components/Todos/Todos';
import Notification from '../components/Notification/Notification';

function TodosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [todoList, setTodoList] = useState([]);

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = useState(false);
  const [method, setMethod] = useState('');

  const onClickDeleteButton = async (todoId) => {
    await window.contract.delete_todo({ todo_id: todoId });

    setMethod('delete_todo');
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);

    setIsLoading(true);
  };

  const onClickAddButton = async (event) => {
    event.preventDefault();

    // get elements from the form using their id attribute
    const { fieldset, todoTitle } = event.target.elements;

    // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
    const newTodoTitle = todoTitle.value;

    // disable the form while the value gets updated on-chain
    fieldset.disabled = true;

    try {
      // make an update call to the smart contract
      await window.contract.create_todo({
        // pass the value that the user entered in the greeting field
        title: newTodoTitle,
      });
    } catch (e) {
      alert(
        'Something went wrong! ' +
          'Maybe you need to sign out and back in? ' +
          'Check your browser console for more info.'
      );
      throw e;
    } finally {
      // re-enable the form, whether the call succeeded or failed
      fieldset.disabled = false;
    }

    // show Notification
    setMethod('create_todo');
    setShowNotification(true);

    todoTitle.value = ''; // Reset input field

    // remove Notification again after css animation completes
    // this allows it to be shown again next time the form is submitted
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);

    setIsLoading(true);
  };

  const onClickChangeStateButton = async (todoId) => {
    await window.contract.update_todo_state({ todo_id: todoId });

    setMethod('update_todo_state');
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);

    setIsLoading(true);
  };

  const onClickChangeTitleButton = async (todoId, title) => {
    await window.contract.update_todo_title({ todo_id: todoId, title });

    setMethod('update_todo_title');
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 11000);

    setIsLoading(true);
  };

  const getAllTodos = async () => {
    if (window.walletConnection.isSignedIn()) {
      // window.contract is set by initContract in index.js
      const todoListFromContract = await window.contract.get_all_todos({
        account_id: window.walletConnection.getAccountId(),
      });
      setTodoList(todoListFromContract);
    }
  };

  useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (isLoading) {
        getAllTodos();
        setIsLoading(false);
      }
    },

    // This works because signing into NEAR Wallet reloads the page
    [isLoading]
  );

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main className="welcome">
        <h1>Welcome!</h1>
        <p className="description">
          To make use of this Todo App, you need to sign in. The button below
          will sign you in using NEAR Wallet.
        </p>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    );
  }

  return (
    <div className={'app'}>
      <button className="link" style={{ float: 'right' }} onClick={logout}>
        Sign out
      </button>
      <main>
        <h1>
          <label className="account-id" htmlFor="greeting">
            {
              ' ' /* React trims whitespace around tags; insert literal space character when needed */
            }
            {window.accountId}!
          </label>
        </h1>
        <Todos
          todoList={todoList}
          onClickDeleteButton={onClickDeleteButton}
          onClickAddButton={onClickAddButton}
          onClickChangeStateButton={onClickChangeStateButton}
          onClickChangeTitleButton={onClickChangeTitleButton}
        />
      </main>
      {showNotification && <Notification method={method} />}
    </div>
  );
}

export default TodosPage;
