import {
  toValue,
  watch,
  type MaybeRefOrGetter,
  type WatchOptions,
  type WatchStopHandle,
} from "vue";

export function useDebouncedWatch<T>(
  source: MaybeRefOrGetter<T>,
  callback: (value: T, oldValue: T | undefined) => void,
  delay: MaybeRefOrGetter<number> = 300,
  options?: WatchOptions,
): WatchStopHandle {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return watch(
    () => toValue(source),
    (value, oldValue, onCleanup) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        callback(value, oldValue);
      }, toValue(delay));

      onCleanup(() => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      });
    },
    options,
  );
}
