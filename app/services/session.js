import Ember from 'ember';

export default Ember.Service.extend({
  isAuthored: Ember.computed('cacheFactory._store', function () {
    let _store = this.get('cacheFactory._store');
  })
});
