import Ember from 'ember';

export default Ember.Route.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  timer: null,
  model(){
    return this.get('http').request('/recommend/categories');
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.setCache(this.get('cacheFactory._store.newRecommendCache'));
    this.saveCacheTiming(controller);
  },
  //timer to  save cache
  saveCacheTiming(controller){
    var self = this;
    this.set('timer', Ember.run.later(function () {
      controller.saveCache();
      self.saveCacheTiming(controller);
    }, 10000));
  },
  actions: {
    //cancel the timer for saving cache
    willTransition(){
      Ember.run.cancel(this.get('timer'));
      return true;
    }
  }
});
