'use strict';

var _ = require('lodash');

module.exports = Entity;

function Entity() {
}

Entity.prototype.toJSON = Entity.prototype._get = function () {
  var entity = {};
  for (var ix in this) {
    if (this.hasOwnProperty(ix) && ix.substr(0, 1) !== '_') {
      entity[ix] = _.cloneDeep(this[ix]);
    }
  }
  return entity;
};

Entity.prototype._set = function (data) {
  for (var ix in this) {
    if (data && this.hasOwnProperty(ix)) {
      if (data[ix] !== undefined) {
        this[ix] = data[ix];
      } else if (this._map && data[this._map[ix]] !== undefined) {
        this[ix] = data[this._map[ix]];
      }
    }
  }
  return this;
};

Entity.prototype._reset = function () {
  var clean = new this.constructor();
  this._set(clean._get());
  return this;
};

function getField(fields, ix, data, entity) {
  var field = fields[ix];
  var def;
  var dName = field;

  if (Array.isArray(field)) {
    def = field[1];
    dName = field[2] || field[0];
    field = field[0];
  }

  var fieldData = recursiveGet(data, field, def);

  if (def === undefined && (fieldData === null || fieldData === undefined)) {
    throw new Error('Mandatory field missing: ' + field + ' - ' + def);
  } else {
    entity[dName] = fieldData;
  }
}
/**
 *
 * @param {[]} fields - The fields we want
 * @return {{}}
 * @private
 */
Entity.prototype._getFields = function (fields) {
  var data = this._get();
  var entity = {};
  for (var ix in fields) {
    getField(fields, ix, data, entity);
  }
  return entity;
};

function recursiveGet(obj, name, def) {

  var splitName = name.split('.');

  if (obj[name] !== undefined && obj[name] !== null) {

    return obj[name];

  } else if (splitName.length > 1 && obj[splitName[0]]) {

    obj = obj[splitName[0]];
    splitName.shift();

    return recursiveGet(obj, splitName.join('.'), def);

  } else {

    return def;

  }
}

Entity.prototype.toString = function () {
  var pkData = [];
  var obj = this;
  this._pk.forEach(function (key) {
    pkData.push(obj[key].toString());
  });
  var pk = pkData.join('::');
  if (pk.replace(':', '').length === 0) {
    return '';
  }
  return pk;
};

Entity.prototype._setPk = function (pkData) {
  var data = pkData.split('::');
  //TODO isArray?
  if (this._pk && this._pk.length === data.length) {
    for (var ix in this._pk) {
      this[this._pk[ix]] = data[ix];
    }
  }
};