import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return <div className="modal-backdrop"><div className="modal-card">{children}</div></div>;
}
