import { getRoiBgColor } from "@/lib/utils";

interface ROIBadgeProps {
  roi: number;
}

export function ROIBadge({ roi }: ROIBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getRoiBgColor(roi)}`}
    >
      {roi.toFixed(1)}%
    </span>
  );
}
