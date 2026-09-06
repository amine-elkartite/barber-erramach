import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export default function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button className="modal-close" onClick={onClose} aria-label="Fermer">
        <X />
      </button>
      {children}
    </dialog>
  );
}
