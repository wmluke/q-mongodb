var QDb = require('../q-mongodb').QDb,
    QCollection = require('../q-mongodb').QCollection,
    Q = require('q'),
    Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    testCase = require('nodeunit').testCase;

var mongo = new Server('localhost', 27017, {auto_reconnect: false, poolSize: 4});
var db = new Db('qdb-unit-test', mongo, {safe: false, native_parser: false});
var collection = 'articles';
var qdb;


function ifNonTestError(err, done) {
    if (err) {
        console.error(new Error(err));
        done();
        process.exit(0);
    }
}

exports.DescribeQDb = testCase({
    setUp: function (done) {
        qdb = QDb.open(db);
        qdb.connect()
            .then(function () {
                done();
            })
            .fail(function (err) {
                ifNonTestError(err, done);
                done(err);
            });
    },
    tearDown: function (done) {
        qdb.dropDatabase()
            .then(function () {
                return qdb.close();
            })
            .then(function () {
                done();
            })
            .fail(function (err) {
                ifNonTestError(err, done);
                done(err);
            });
    },

    'it should open a DB': function (test) {
        test.expect(2);

        qdb.connect()
            .then(function (db) {
                test.ok(db);
                test.equals(db.state, 'connected');
                test.done();
            })
            .fail(function (err) {
                test.ifError(err);
                test.done();
            });


    },

    'it should open a DB and get a collection': function (test) {
        test.expect(1);

        var qCollection = qdb.collection(collection);

        test.ok(qCollection instanceof QCollection);

        test.done();
    }
});