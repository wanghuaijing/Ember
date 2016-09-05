import Ember from 'ember';

export default Ember.Route.extend({
  http: Ember.inject.service(),
  model(){
    return this.get('http').request('/recommend/hot');
  },
  setupController(controller, model){
    controller.initialServerBannerList(model);
  },
  actions: {
    willTransition(){
      //cancel the edit state when transition begin
      this.controller.clearEditState();
      return true;
    }
  }
});
