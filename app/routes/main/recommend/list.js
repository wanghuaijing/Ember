import Ember from 'ember';

export default Ember.Route.extend({
  http:Ember.inject.service(),
  model(){
    return this.get('http').request('/recommend/categories');
  }
});
