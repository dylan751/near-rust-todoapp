import React, { useState } from "react";
import styles from "./TodoList.module.css";
import EditTodoModal from "./EditTodoModal";
import { RiDeleteBin2Line, RiEdit2Line } from "react-icons/ri";

const TodoList = ({
  todoList,
  onClickDeleteButton,
  onClickChangeStateButton,
  onClickChangeTitleButton,
}) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [currTodo, setCurrTodo] = useState();
  const onClickEditButton = (todoId) => {
    setCurrTodo(todoId);
    setIsShowModal(true);
  };

  return (
    <ul className="todo-list">
      {todoList &&
        todoList.map((todo) => (
          <li key={todo.id} className="todo-item">
            <button
              id="toggle-btn"
              className={todo.is_done ? "done-checkmark" : ""}
              onClick={() => onClickChangeStateButton(todo.id)}
            ></button>
            <span className={todo.is_done ? "done" : ""}>{todo.title}</span>
            <div className="group-btn">
              <button onClick={() => onClickEditButton(todo.id)}>
                <div className="icon">
                  <RiEdit2Line />
                </div>
              </button>
              <button
                id="delete-btn"
                onClick={() => onClickDeleteButton(todo.id)}
              >
                <div className="icon">
                  <RiDeleteBin2Line />
                </div>
              </button>
            </div>
          </li>
        ))}
      {isShowModal && (
        <EditTodoModal
          isShowModal={isShowModal}
          setIsShowModal={setIsShowModal}
          onClickChangeTitleButton={onClickChangeTitleButton}
          todoId={currTodo}
        />
      )}
    </ul>
  );
};

export default TodoList;
