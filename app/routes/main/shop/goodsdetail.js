import Ember from 'ember';

export default Ember.Route.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  time: null,
  setupController: function (controller, model) {
    this._super(controller, model);
    controller.set('goodsData', null);
    controller.load(this.get('cacheFactory._store.newGoodsCache'));
    if (controller.get('isAdd')) {
      this.saveCacheTiming(controller);
    }
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
