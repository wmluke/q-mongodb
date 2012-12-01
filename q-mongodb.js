var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    ObjectID = require('mongodb').ObjectID,
    _ = require('underscore'),
    Q = require('q');


var QDbOpen = function (db) {
    var _qOpen = Q.ncall(db.open, db);

    this.connect = function () {
        return _qOpen;
    };

    this.collection = function (name) {
        return new QCollection(_qOpen, name);
    };

    this.dropDatabase = function () {
        return _qOpen.then(function (db) {
            return Q.ncall(db.dropDatabase, db);
        });
    };

    this.close = function (force) {
        return _qOpen.then(function (db) {
            return Q.ncall(db.close, db, force);
        });
    };
};


var QDb = {
    open: function (a, b, c) {
        if (a instanceof Db) {
            return new QDbOpen(a);
        }
        var db = new Db(a, b, c);
        return new QDbOpen(db);
    }
};


var QCollection = function (qOpen, collectionName) {

    var __self__ = this;

    this.createObjectId = function (id) {
        return new ObjectID(id);
    };

    this.read = function (id, options) {
        return __self__.findOne({_id: id}, options);
    };

    this.findOne = function (selector, options) {
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.findOne, collection, selector || {}, options || {});
        });
    };

    this.find = function (selector, options) {
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.find, collection, selector || {}, options || {})
                .then(function (cursor) {
                    return new QCursor(cursor);
                });
        });

    };

    /**
     * @param doc {Object|Array}
     * @param options {Object}
     * @return {*}
     */
    this.insert = function (doc, options) {
        options = _.extend({safe: true}, options);
        return qOpen
            .then(function (db) {
                var collection = db.collection(collectionName);
                return Q.ncall(collection.insert, collection, _.isArray(doc) ? doc : [doc], options);
            });
    };

    this.update = function (selector, doc, options) {
        options = _.extend({safe: true}, options);
        return qOpen
            .then(function (db) {
                var collection = db.collection(collectionName);
                return Q.ncall(collection.update, collection, selector || {}, doc, options);
            });
    };

    this.save = function (doc, options) {
        options = _.extend({safe: true}, options);
        return qOpen
            .then(function (db) {
                var collection = db.collection(collectionName);
                return Q.ncall(collection.save, collection, doc, options);
            });
    };

    this.remove = function (selector, options) {
        options = _.extend({safe: true}, options);
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.remove, collection, selector || {}, options);
        });
    };
};

var QCursor = function (cursor) {

    this.cursor = cursor;

    /**
     * @return {QCursor}
     */
    this.limit = function (number) {
        cursor.limit(number);
        return this;
    };

    /**
     * @return {QCursor}
     */
    this.skip = function (number) {
        cursor.skip(number);
        return this;
    };

    this.count = function () {
        return Q.ncall(cursor.count, cursor);
    };

    this.toArray = function () {
        return Q.ncall(cursor.toArray, cursor);
    };
};

module.exports = {
    QDb: QDb,
    QCollection: QCollection,
    QCursor: QCursor
};