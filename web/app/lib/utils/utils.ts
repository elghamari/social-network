export function sleep(duration = 500) {
  return new Promise((res) => {
    setTimeout(res, duration);
  });
}
