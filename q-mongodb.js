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

    this.read = function (id) {
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.findOne, collection, {_id: id});
        });
    };

    this.findOne = function (selector, options) {
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.findOne, collection, selector, options);
        });
    };


    this.find = function (selector, options) {
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.find, collection, selector, options);
        });

    };

    /**
     * @param doc {Object|Array}
     * @return {*}
     */
    this.insert = function (doc) {
        return qOpen
            .then(function (db) {
                var collection = db.collection(collectionName);
                return Q.ncall(collection.insert, collection, _.isArray(doc) ? doc : [doc], {safe: true});
            });
    };

    this.update = function (selector, doc) {
        return qOpen
            .then(function (db) {
                var collection = db.collection(collectionName);
                var id = doc._id;
                selector = selector || {};
                doc._id = new ObjectID(id);
                selector._id = new ObjectID(id);
                return Q.ncall(collection.update, collection, selector, doc, {safe: true});
            });
    };

    this.save = function (doc) {
        return qOpen
            .then(function (db) {
                var collection = db.collection(collectionName);
                return Q.ncall(collection.save, collection, doc, {safe: true});
            });
    };

    this.remove = function (selector, options) {
        return qOpen.then(function (db) {
            var collection = db.collection(collectionName);
            return Q.ncall(collection.remove, collection, selector, options);
        });
    };

};

module.exports = {
    QDb: QDb,
    QCollection: QCollection
};