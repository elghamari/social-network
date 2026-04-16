let message: string | null = null;
let listener: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string) {
  if (timer) clearTimeout(timer);

  message = msg;
  listener?.();

  timer = setTimeout(() => {
    message = null;
    listener?.();
  }, 5000);
}

export function dismissToast() {
  if (timer) clearTimeout(timer);
  message = null;
  listener?.();
}

export function getToast() {
  return message;
}

export function subscribe(fn: () => void) {
  listener = fn;
  return () => {
    listener = null;
  };
}
