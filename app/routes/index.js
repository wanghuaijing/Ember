import Ember from 'ember';

export default Ember.Route.extend({
  cacheFactory: Ember.inject.service(),
  redirect(){
    if (!this.get('cacheFactory._store.tokens')) {
      this.transitionTo('login');
    }
    else{
      this.transitionTo('main');
    }
  }
});
