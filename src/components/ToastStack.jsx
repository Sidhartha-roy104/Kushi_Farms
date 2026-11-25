import { useCart } from '../context/CartContext';

export default function ToastStack() {
  const { toasts } = useCart();

  return (
    <div className="toast-stack" id="toastStack" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast"
          style={
            t.fading
              ? {
                  opacity: 0,
                  transform: 'translateY(-6px)',
                  transition: 'all 0.24s ease'
                }
              : undefined
          }
        >
          <span className="toast-dot"></span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
