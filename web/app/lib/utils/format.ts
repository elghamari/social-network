export function sleep(duration: number) {
  return new Promise((res) => {
    setTimeout(res, duration);
  });
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
