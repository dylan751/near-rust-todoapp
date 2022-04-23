import React, { useState, useEffect } from "react";
import TodoList from "./TodoList";
import styles from "./Todos.module.css";

const Todos = ({
  todoList,
  onClickDeleteButton,
  onClickAddButton,
  onClickChangeStateButton,
  onClickChangeTitleButton,
}) => {
  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = useState(true);

  // use React Hooks to store greeting in component state
  const [greeting, setGreeting] = useState();

  return (
    <div className="todo-section">
      <h2>Todo List</h2>
      <div className="todo">
        <form onSubmit={onClickAddButton} className="todo-form">
          <fieldset id="fieldset">
            <input
              autoComplete="off"
              defaultValue={greeting}
              id="todoTitle"
              onChange={(e) => setButtonDisabled(e.target.value === greeting)}
              placeholder="What needs to be done?"
              style={{ flex: 1 }}
            />
            <button disabled={buttonDisabled}>Add</button>
          </fieldset>
        </form>
        <TodoList
          todoList={todoList}
          onClickDeleteButton={onClickDeleteButton}
          onClickChangeStateButton={onClickChangeStateButton}
          onClickChangeTitleButton={onClickChangeTitleButton}
        />
      </div>
    </div>
  );
};

export default Todos;
