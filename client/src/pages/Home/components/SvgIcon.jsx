export default function SvgIcon({
  path,
  className = 'w-6 h-6',
  strokeWidth = 2,
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d={path}
      />
    </svg>
  );
}
