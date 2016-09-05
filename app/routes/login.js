import Ember from 'ember';

export default Ember.Route.extend({
  cacheFactory: Ember.inject.service(),
  beforeModel(){
    if (this.get('cacheFactory._store.tokens')) {
      this.transitionTo('main');
    }
  },
  afterModel(){
    Ember.$('body').addClass('login-page');
  }
});
