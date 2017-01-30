var pool = require('./connectionPool');

function pgStringify(columns) {
  return '(' + columns.join(', ') + ')';
}

function pgValues(values) {
  var str = '(';
  for (var i = 0; i < values.length; i++) {
    str += `'${values[i]}'`;
    if (i + 1 != values.length) str += ', ';
  }
  str += ')';
  return str;
}

class Model {
  constructor(singularName, tableName) {
    // database consistency
    this.saveColumns = [];
    this.saved = false;
    this.singularName = singularName;
    this.tableName = tableName;

    // validation
    this.validators = [];  // list of validator functions
    this.errors = [];
  }

  get valid() {
    var ret = true;
    for (var i = 0; i < this.validators.length; i++) {
      if (!this.validators[i](this)) ret = false; 
    }
    return ret;
  }
  get dbColumns() {
    // get columns with id
    return this.saveColumns.concat('id');
  }
  addColumn(key, value) {
    this[key] = value;
    this.saveColumns.push(key);
  }
  loadRow(row) {
    Object.assign(this, row);
    this.saved = true;
  }
  registerValidator(func) {
    // push validator function. should write error message to first argument
    this.validators.push(func);
  }

  // database operations
  save() {
    // Return promise for postgres insert
    var model = this;
    return new Promise(function(resolve, reject) {
      if (!model.valid) {
        reject(new Error(`Invalid ${model.singularName}.`));
        return;
      }

      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        var values = [];
        for (var i = 0; i < model.saveColumns.length; i++) {
          values.push(model[model.saveColumns[i]]);
        }
        const query = `INSERT INTO ${model.tableName} ${pgStringify(model.saveColumns)} VALUES ${pgValues(values)} RETURNING *`;
        client.query(query, (err, result) => {
          done();  // release db connection
          if (err) {
            console.log(err.message);
            reject(new Error(`${model.singularName} already exists.`));
          } else {
            // update object in memory
            model.saved = true;
            model.loadRow(result.rows[0]);
            resolve(model);
          }
        });
      });
    });
  }
}

module.exports = Model;
