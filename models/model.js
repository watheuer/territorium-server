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
    if (this.saved) return true;

    // check each property
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
    // push validator function
    // this function should push error message to first argument
    this.validators.push(func);
  }

  save() {
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
            reject(new Error(`${model.singularName} could not be saved.`));
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

  load(id) {
    var model = this;
    return new Promise(function(resolve, reject) {
      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        const query = `SELECT * FROM ${model.tableName} WHERE id=${id}`;
        client.query(query, (err, result) => {
          done();  // release db connection
          if (err) {
            reject(new Error(`${model.singularName} could not be found.`));
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

  static deleteFromTable(tableName, id) {
    return new Promise(function(resolve, reject) {
      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        var query = `DELETE FROM ${tableName} WHERE id='${id}'`;
        client.query(query, (err, result) => {
          done();  // release db connection
          if (err) {
            reject(new Error(`Failed to delete from ${tableName}.`));
          } else {
            resolve(id);
          }
        });
      });
    });
  }

  // FOR TESTING ONLY, SERIOUSLY
  static clearTable(tableName) {
    return new Promise(function(resolve, reject) {
      pool.connect((err, client, done) => {
        if (err) {
          reject(new Error('Could not connect to database.'));
          return;
        }

        var query = `DELETE FROM ${tableName};`;
        client.query(query, (err, result) => {
          done();  // release db connection
          if (err) {
            reject(new Error(`Failed to delete from ${tableName}.`));
          } else {
            resolve();
          }
        });
      });
    });
  }
}

module.exports = Model;
