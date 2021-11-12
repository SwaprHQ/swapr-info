export default function memoize(func) {
  // Create a new cache, just for this function
  let cache = new Map();

  const memoized = function (...args) {
    // First argument as the cache key.
    let key = args[0];

    // Return the cached value if one exists
    if (cache.has(key)) {
      return cache.get(key);
    }

    // Otherwise, compute the result and save it
    // before returning it.
    let result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };

  return memoized;
}