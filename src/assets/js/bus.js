function Bus () {
  this.subs = []
}

Bus.prototype.on = function (name, handler) {
  if (!this.subs[name]) {
    this.subs[name] = []
  }
  this.subs[name].push(handler)
}

Bus.prototype.emit = function (name, ...payload) {
  var subs = this.subs[name];
  if (subs) {
    subs.forEach(fn => {
      fn(...payload)
    })
  }
}

export default Bus