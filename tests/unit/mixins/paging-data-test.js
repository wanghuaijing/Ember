import Ember from 'ember';
import PagingDataMixin from 'lf-manage/mixins/paging-data';
import { module, test } from 'qunit';

module('Unit | Mixin | paging data');

// Replace this with your real tests.
test('it works', function(assert) {
  let PagingDataObject = Ember.Object.extend(PagingDataMixin);
  let subject = PagingDataObject.create();
  assert.ok(subject);
});
