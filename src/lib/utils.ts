/** Format gold pieces with commas: 1234567 -> "1,234,567" */
export function formatGP(amount: number): string {
  return amount.toLocaleString("en-US");
}

/** Short GP format: 1234567 -> "1.2M", 12345 -> "12.3K" */
export function formatGPShort(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

/** Calculate net margin accounting for 1% GE tax on the sell price */
export function calculateNetMargin(buyPrice: number, sellPrice: number): number {
  const tax = Math.floor(sellPrice * 0.01);
  return sellPrice - buyPrice - tax;
}

/** Calculate ROI percentage (net margin / buy price * 100) */
export function calculateROI(buyPrice: number, sellPrice: number): number {
  if (buyPrice <= 0) return 0;
  const netMargin = calculateNetMargin(buyPrice, sellPrice);
  return (netMargin / buyPrice) * 100;
}

/** Get item icon URL from OSRS Wiki */
export function getItemIconUrl(itemName: string): string {
  const encoded = encodeURIComponent(itemName.replace(/ /g, "_"));
  return `https://oldschool.runescape.wiki/images/${encoded}_detail.png`;
}

/** Get small item icon URL */
export function getItemSmallIconUrl(itemName: string): string {
  const encoded = encodeURIComponent(itemName.replace(/ /g, "_"));
  return `https://oldschool.runescape.wiki/images/${encoded}.png`;
}

/** ROI color class based on threshold */
export function getRoiColor(roi: number): string {
  if (roi >= 5) return "text-profit";
  if (roi >= 2) return "text-yellow-400";
  return "text-loss";
}

/** ROI background color class */
export function getRoiBgColor(roi: number): string {
  if (roi >= 5) return "bg-profit/20 text-profit";
  if (roi >= 2) return "bg-yellow-400/20 text-yellow-400";
  return "bg-loss/20 text-loss";
}

/** Debounce function */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** cn - merge class names (simple version) */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
