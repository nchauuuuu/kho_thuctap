import { useEffect, useState } from "react";

const TOAST_EVENT = "kho-cafe-toast";

export function showToast(message, type = "success") {
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { message, type },
    })
  );
}

function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let timerId;

    const handleToast = (event) => {
      setToast({
        message: event.detail?.message || "Thao tác thành công.",
        type: event.detail?.type || "success",
      });

      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => setToast(null), 2800);
    };

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener(TOAST_EVENT, handleToast);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className={`app-toast ${toast.type}`} role="status" aria-live="polite">
      <i
        className={
          toast.type === "danger"
            ? "bi bi-exclamation-circle"
            : "bi bi-check-circle"
        }
      ></i>
      <span>{toast.message}</span>
    </div>
  );
}

export default Toast;
