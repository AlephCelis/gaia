'use strict';

var Calendar = require('./calendar'),
    assert = require('chai').assert;

marionette('day view', function() {
  var app;
  var client = marionette.client();

  setup(function() {
    app = new Calendar(client);
    app.launch({ hideSwipeHint: true });
    // Go to day view
    app.waitForElement('dayButton').click();
    app.waitForDayView();
  });

  test('header copy should not overflow', function() {
    var header = app.waitForElement('monthYearHeader');
    // XXX: we don't use app.checkOverflow() because of Bug 971691
    // 20 chars is a "safe" limit if font-family is Fira Sans
    assert.operator(header.text().length, '<', 21);
  });

  suite('events longer than 2h', function() {
    setup(function() {
      app.createEvent({
        title: 'Lorem Ipsum',
        location: 'Dolor Amet',
        startHour: 0,
        duration: 3
      });
      app.waitForDayView();
    });

    test('click after first hour', function() {
      // click will happen at middle of element and middle is after first hour,
      // so this should be enough to trigger the event details (Bug 972666)
      client.findElement('#day-view .active .day-events .hour-2').click();

      app.waitForViewEventView();

      var title = app.findElement('viewEventViewTitle');

      assert.equal(
        title.text(),
        'Lorem Ipsum',
        'title should match'
      );
    });

    test('click after event end', function() {
      // click will happen at middle of element so this should be enough to
      // trigger the create event (since .hour-3 is after event duration)
      client.findElement('#day-view .active .day-events .hour-3').click();
      assert.ok(app.isAddEventViewActive(), 'should go to add event view');
    });
  });

});
