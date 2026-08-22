interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = '8px',
  style,
}: SkeletonProps) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function TaskListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 1px 2px rgba(15,23,42,.02)',
          }}
        >
          <Skeleton width="22px" height="22px" borderRadius="50%" />
          <Skeleton width="6px" height="6px" borderRadius="50%" />
          <Skeleton width="45%" height="16px" />
          <div style={{ flex: 1 }} />
          <Skeleton width="60px" height="14px" />
          <Skeleton width="70px" height="20px" borderRadius="6px" />
        </div>
      ))}
    </div>
  );
}
