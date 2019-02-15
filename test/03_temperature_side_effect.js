var Rx = require('rx'),
  Observable = Rx.Observable,
  Subject = Rx.Subject,
  AsyncSubject = Rx.AsyncSubject,
  ReplaySubject = Rx.ReplaySubject;

QUnit.module('Temperature side effects');

var __ = 'Fill in the blank';
var onNext = Rx.ReactiveTest.onNext,
  onCompleted = Rx.ReactiveTest.onCompleted,
  subscribe = Rx.ReactiveTest.subscribe;

test('so, you said hot?', function() {
  var scheduler = new Rx.TestScheduler();

  var source = scheduler.createHotObservable(
    onNext(300, 'Hello'),
    onCompleted(400),
  );

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 250, function() {
    source.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 350, function() {
    source.subscribe(mockObserver2);
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('cold?', function() {
  var scheduler = new Rx.TestScheduler();

  var source = scheduler.createColdObservable(
    onNext(300, 'Hello'), // relative time now!
    onCompleted(400),
  );

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 250, function() {
    source.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 350, function() {
    source.subscribe(mockObserver2);
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('timer: hot or cold?', function() {
  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 10, function() {
    source.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 200, function() {
    source.subscribe(mockObserver2);
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('multicasting: cold to hot with publish/connect', function() {
  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var connectableSource = source.publish();

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 10, function() {
    connectableSource.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 200, function() {
    connectableSource.subscribe(mockObserver2);
  });

  scheduler.scheduleAbsolute(null, 300, function() {
    connectableSource.connect();
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('multicasting: cold to hot with publish/refCount', function() {
  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var hotSource = source.publish().refCount();

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 10, function() {
    hotSource.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 200, function() {
    hotSource.subscribe(mockObserver2);
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('managing subscriptions with publish/connect', function() {
  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var connectableSource = source.publish();

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 10, function() {
    connectableSource.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 200, function() {
    connectableSource.subscribe(mockObserver2);
  });

  var connection;
  scheduler.scheduleAbsolute(null, 300, function() {
    connection = connectableSource.connect();
  });

  scheduler.scheduleAbsolute(null, 600, function() {
    connection.dispose();
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('reconnect?', function() {
  var scheduler = new Rx.TestScheduler();

  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var connectableSource = source.publish();

  var mockObserver1 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 10, function() {
    connectableSource.subscribe(mockObserver1);
  });

  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 200, function() {
    connectableSource.subscribe(mockObserver2);
  });

  var connection;
  scheduler.scheduleAbsolute(null, 300, function() {
    connection = connectableSource.connect();
  });

  scheduler.scheduleAbsolute(null, 600, function() {
    connection.dispose();
  });

  scheduler.scheduleAbsolute(null, 660, function() {
    connectableSource.connect();
  });

  scheduler.start();

  collectionAssert.assertEqual(mockObserver1.messages, [__]);

  collectionAssert.assertEqual(mockObserver2.messages, [__]);
});

test('subscribe side effects', function() {
  var scheduler = new Rx.TestScheduler();

  var result = 0;
  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var hotSource = source
    .publish()
    .refCount()
    .tap(function(x) {
      result += x;
    });

  var mockObserver = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 1000, function() {
    hotSource.subscribe(mockObserver);
  });

  scheduler.advanceBy(900);

  equal(__, result);

  scheduler.advanceBy(2000);

  equal(__, result);
});

test('subscribe side effects, twice', function() {
  var scheduler = new Rx.TestScheduler();

  var result = 0;
  var source = Observable.timer(50, 100, scheduler)
    .skip(1)
    .take(3);

  var hotSource = source
    .publish()
    .refCount()
    .tap(function(x) {
      result += x;
    });

  var mockObserver = scheduler.createObserver();
  var mockObserver2 = scheduler.createObserver();
  scheduler.scheduleAbsolute(null, 1000, function() {
    hotSource.subscribe(mockObserver);
  });
  scheduler.scheduleAbsolute(null, 1100, function() {
    hotSource.subscribe(mockObserver2);
  });

  scheduler.advanceBy(2000);

  equal(__, result);
});

function createMessage(expected, actual) {
  return (
    'Expected: [' +
    expected.toString() +
    ']\r\nActual: [' +
    actual.toString() +
    ']'
  );
}

// Using QUnit testing for assertions
var collectionAssert = {
  assertEqual: function(actual, expected) {
    var comparer = Rx.internals.isEqual,
      isOk = true;

    if (expected.length !== actual.length) {
      ok(
        false,
        'Not equal length. Expected: ' +
          expected.length +
          ' Actual: ' +
          actual.length,
      );
      return;
    }

    for (var i = 0, len = expected.length; i < len; i++) {
      isOk = comparer(expected[i], actual[i]);
      if (!isOk) {
        break;
      }
    }

    ok(isOk, createMessage(expected, actual));
  },
};
