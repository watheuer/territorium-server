var pool = require('./connectionPool');

class Model {
  constructor() {
    this.validators = [];  // list of validator functions
    this.errors = [];
    this.saved = false;
  }

  get valid() {
    var ret = true;
    for (var i = 0; i < this.validators.length; i++) {
      if (!this.validators[i](this)) ret = false; 
    }
    return ret;
  }

  loadRow(row) {
    Object.assign(this, row);
    this.saved = true;
  }

  registerValidator(func) {
    // push validator function. should write error message to first argument
    this.validators.push(func);
  }
}

module.exports = Model;
