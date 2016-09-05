import Ember from 'ember';
import ServicesInitializer from 'lf-manage/initializers/services';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | services', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  ServicesInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
