import React from "react";
import styles from "./EditTodoModal.module.css";

const EditTodoModal = ({
  isShowModal,
  setIsShowModal,
  onClickChangeTitleButton,
  todoId,
}) => {
  const onClickSubmit = (event) => {
    event.preventDefault();
    const { todoTitle } = event.target.elements;
    const newTodoTitle = todoTitle.value;

    onClickChangeTitleButton(todoId, newTodoTitle);
    setIsShowModal(false);
  };

  const onClickCancel = () => {
    setIsShowModal(false);
  };

  return (
    <div className="edit-todo-modal">
      <form onSubmit={onClickSubmit} className="modal-form">
        <h3>Update your task</h3>
        <input id="todoTitle" type="text" placeholder="New title" />
        <div className="modal-btn-group">
          <button type="button" onClick={onClickCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">Save</button>
        </div>
      </form>
    </div>
  );
};

export default EditTodoModal;
