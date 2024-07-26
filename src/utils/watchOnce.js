import store from '@/store/index.js';

export default function watchOnce(...args) {
  const unwatch = store.watch(args[0], () => {
    args[1]();
    unwatch();
  });
}
