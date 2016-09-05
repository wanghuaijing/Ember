import Ember from 'ember';
import RestoreScrollMixin from 'lf-manage/mixins/restore-scroll';
import { module, test } from 'qunit';

module('Unit | Mixin | restore scroll');

// Replace this with your real tests.
test('it works', function(assert) {
  let RestoreScrollObject = Ember.Object.extend(RestoreScrollMixin);
  let subject = RestoreScrollObject.create();
  assert.ok(subject);
});
