export function FormatTime(timeStr: string): string {
  const now = Date.now();
  const t = new Date(timeStr).getTime();

  if (isNaN(t)) return "Unknown time"; 

  const tSince = now - t;

  const seconds = Math.floor(tSince / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 5) {
    return "just now";
  } else if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  } else if (months < 12) {
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else {
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  }
}
export function formatDate(strDate: string): string {
  const date = new Date(strDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
