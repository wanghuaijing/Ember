import Ember from 'ember';

export default Ember.Route.extend({
  cacheFactory: Ember.inject.service(),
  beforeModel(){
    if(!this.get('cacheFactory._store.tokens')){
      this.transitionTo('login');
    }
  },
  model(){
    Ember.$('body').removeClass('login-page');
  },
  setupController(controller, model){
    this._super(...arguments);
    controller.setTheme(this.get('cacheFactory._store.theme') || 'primary');
  },
  actions: {
    loading(transition, originRoute) {
      let controller = this.controllerFor('main');
      controller.set('currentlyError', false);
      controller.set('currentlyLoading', true);
      let that = this;
      transition.promise
        .catch(function(err){
          //if(err.code === 401 || err.code === -15){
          //  let controller = that.controllerFor('login');
          //  that.get('cacheFactory').removeAll();
          //  controller.set('errorMsg', '你的账号在别处登录,请重新登录');
          //  that.transitionTo('login');
          //}
        })
        .finally(function () {
        controller.set('currentlyLoading', false);
      });
    }
  }
});
