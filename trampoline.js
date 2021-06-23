const factorial = trampoline(function _factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return () => _factorial(n - 1, n * acc);
}) 

function trampoline(f) {
  return function trampolined(...args) {
    let result = f.bind(null, ...args);

    while (typeof result === 'function') result = result();

    return result;
  };
}

console.log(factorial(100000000).toString())



// function iterate(n) {
//   if (n > 0) {
//     let a = n * iterate(n - 1);
//     console.log(a)
//   }
//   return n;
// }

// // const iterate = trampoline(function _iterate(n) {
// //   if (n > 0) {
// //     let a = n * iterate(n - 1);
// //     console.log(a)
// //   }
// //   return _iterate(n);
// // })

// console.log(iterate(100));

