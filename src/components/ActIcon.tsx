interface Props {
  k: string;
  size?: number;
  color?: string;
}

export const ActIcon = ({ k, size = 22, color = "currentColor" }: Props) => {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (k) {
    case "music":
      return (
        <svg {...p}>
          <path d="M9 18V6l10-2v12" />
          <circle cx="7" cy="18" r="2" fill={color} />
          <circle cx="17" cy="16" r="2" fill={color} />
        </svg>
      );
    case "dance":
      return (
        <svg {...p}>
          <circle cx="12" cy="5" r="2" fill={color} stroke="none" />
          <path d="M12 7v6M9 13l3-2 3 2M8 20l4-7 4 7M6 11l3-1M18 11l-3-1" />
        </svg>
      );
    case "swim":
      return (
        <svg {...p}>
          <path d="M2 16c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1M2 19c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1 2 1 4 1" />
          <circle cx="15" cy="8" r="2" fill={color} stroke="none" />
          <path d="M5 12l4-2 5 1 5-3" />
        </svg>
      );
    case "park":
      return (
        <svg {...p}>
          <path d="M12 2l4 6h-2l3 5h-2l3 5H6l3-5H7l3-5H8z" />
          <path d="M12 18v4" />
        </svg>
      );
    case "gym":
      return (
        <svg {...p}>
          <path d="M5 9v6M19 9v6M3 11v2M21 11v2M5 12h14" />
        </svg>
      );
    case "beach":
      return (
        <svg {...p}>
          <circle cx="6" cy="7" r="3" />
          <path d="M6 10v8M2 14l8-2 8 2M2 19c2 0 2 1 4 1s2-1 4-1 2 1 4 1 2-1 4-1" />
        </svg>
      );
    case "pizza":
      return (
        <svg {...p}>
          <path d="M12 3l9 18-9-3-9 3z" />
          <circle cx="10" cy="11" r="1" fill={color} stroke="none" />
          <circle cx="14" cy="13" r="1" fill={color} stroke="none" />
          <circle cx="11" cy="16" r="1" fill={color} stroke="none" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="6" />
        </svg>
      );
  }
};
