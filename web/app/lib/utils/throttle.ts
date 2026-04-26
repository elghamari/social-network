export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let wait = false;

  return (...args: Parameters<T>) => {
    if (wait) return;

    func(...args);
    wait = true;

    setTimeout(() => {
      wait = false;
    }, delay);
  };
};