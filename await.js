// function sleep(ms) {
//   return new Promise((resolve, reject) => setTimeout(resolve), ms);
// } 

// console.log(11111111);
// await sleep(2000)
// console.log(2222222)

let AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

let af = new AsyncFunction('a', 'b', 'return a + b')

af(10, 20).then(console.log)