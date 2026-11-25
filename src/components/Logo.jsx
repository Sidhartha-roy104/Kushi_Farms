export default function Logo({ variant = 'dark', height = 44 }) {
  const isLight = variant === 'light';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(isLight
          ? {
              background: 'rgba(255, 255, 255, 0.96)',
              padding: '6px 14px',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.14)'
            }
          : {})
      }}
    >
      <img
        src="/logo.webp"
        alt="Kushi Dairy"
        height={height}
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </span>
  );
}
