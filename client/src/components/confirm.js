
import React from "react";

function ConfirmWindow({ title, message, onConfirm, onCancel, confirmButtonMessage }) {
  return (
    <div className="confirm">
      <div className="confirm-box">
        <h2>{title}</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
        <div className="modal-actions">
          <button className="confirm-button" onClick={onConfirm}>{confirmButtonMessage}</button>
          <button className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmWindow;