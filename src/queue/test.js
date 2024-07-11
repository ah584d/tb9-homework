// Section 1

class Promise {
  constructor(args) {
    this.resolve = this.resolve.bind(this);

    this.args = args;
    this.cb = undefined;
    this.arg = undefined;
    this.args(this.resolve);
  }

  resolve(arg) {
    if (this.cb) {
      this.cb(arg);
    } else {
      this.arg = arg;
    }
  }

  then(cb) {
    if (this.arg) {
      cb(this.arg);
    } else {
      this.cb = cb;
    }
  }
}

// Section 2
const p = new Promise((resolve) => {
  console.log("action");
  setTimeout(() => resolve(1), 1000);
  // resolve(1);
});

p.then((value) => {
  console.log("first print1", value);
    return new Promise((resolve) => {
      setTimeout(() => resolve(value + 2), 1000);
    });
});

// Section 3
/*
.then((value) => {
	console.log('last print1', value);
	return value + 1;
})
*/
