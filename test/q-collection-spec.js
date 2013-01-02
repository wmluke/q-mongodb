var QCollection = require('../q-mongodb').QCollection,
    Q = require('q'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    testCase = require('nodeunit').testCase;

var mongo = new Server('localhost', 27017, {auto_reconnect: false, poolSize: 4});
var db = new Db('qcollection-unit-test', mongo, {safe: false, native_parser: false});
var collection = 'articles';
var dbOpenPromise = Q.ncall(db.open, db);
var qCollection = new QCollection(dbOpenPromise, collection);

exports.DescribeQCollection = testCase({
    tearDown: function (done) {
        dbOpenPromise.then(function (db) {
            db.dropCollection(collection, function (error, result) {
                if (error) {
                    console.error(error);
                }
                done();
            });
        });
    },

    'it should read a document': function (test) {
        test.expect(4);

        var article = {
            title: ':title',
            author: ':author',
            content: ':content'
        };

        qCollection.insert(article)
            .then(function (results) {
                return results[0];
            })
            .then(function (article) {
                qCollection.read(article._id)
                    .then(function (result) {
                        test.ok(result._id);
                        test.equals(result.title, ':title');
                        test.equals(result.author, ':author');
                        test.equals(result.content, ':content');
                        test.done();
                    });
            })
            .fail(function (error) {
                test.ifError(error);
                test.done();
            });
    },


    'it should insert a document': function (test) {
        test.expect(4);

        var article = {
            title: ':title',
            author: ':author',
            content: ':content'
        };

        qCollection.insert(article)
            .then(function (results) {
                var result = results[0];
                test.ok(result._id);
                test.equals(result.title, ':title');
                test.equals(result.author, ':author');
                test.equals(result.content, ':content');
                test.done();
            })
            .fail(function (error) {
                test.ifError(error);
                test.done();
            });
    },

    'it should save a document': function (test) {
        test.expect(4);

        var article = {
            title: ':title',
            author: ':author',
            content: ':content'
        };

        qCollection.save(article)
            .then(function (result) {
                test.ok(result._id);
                test.equals(result.title, ':title');
                test.equals(result.author, ':author');
                test.equals(result.content, ':content');
                test.done();
            })
            .fail(function (error) {
                test.ifError(error);
                test.done();
            });
    },

    'it should update a document': function (test) {
        test.expect(10);

        var article = {
            title: ':title',
            author: ':author',
            content: ':content'
        };

        qCollection.insert(article)
            .then(function (results) {
                var result = results[0];
                test.ok(result._id);
                test.equals(result.title, ':title');
                test.equals(result.author, ':author');
                test.equals(result.content, ':content');
                return result;
            })
            .then(function (result) {
                result.title = ':new-title';
                return qCollection.update({_id: result._id}, result)
                    .then(function (result) {
                        test.ok(result);
                        test.equals(1, result[0]);
                        test.equals(true, result[1].updatedExisting);
                        test.equals(1, result[1].n);
                        test.equals(null, result[1].err);
                        test.equals(1, result[1].ok);
                        test.done();
                    });
            })
            .fail(function (error) {
                test.ifError(error);
                test.done();
            });
    },

    'it should remove a document': function (test) {
        test.expect(7);

        var article = {
            title: ':title',
            author: ':author',
            content: ':content'
        };

        qCollection.insert(article)
            .then(function (results) {
                var doc = results[0];
                test.ok(doc._id);
                test.equals(doc.title, ':title');
                test.equals(doc.author, ':author');
                test.equals(doc.content, ':content');
                return doc;
            })
            .then(function (doc) {
                return qCollection.remove({_id: doc._id})
                    .then(function (removeResult) {
                        test.ok(removeResult);
                        test.equals(1, removeResult);
                        return doc;
                    });
            })
            .then(function (doc) {
                return qCollection.read(doc._id)
                    .then(function (result) {
                        test.equals(null, result);
                        test.done();
                    });
            })
            .fail(function (error) {
                test.ifError(error);
                test.done();
            });
    }
});

exports.cleanUp = {
    'drop database': function (t) {
        dbOpenPromise
            .then(function (db) {
                db.dropDatabase();
                db.close();
                t.done();
            })
            .fail(function (error) {
                console.error(error);
                t.done();
            });
    }
};
