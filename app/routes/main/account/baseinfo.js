import Ember from 'ember';

export default Ember.Route.extend({
  http: Ember.inject.service(),
  cacheFactory: Ember.inject.service(),
  model(){
    let userInfo = this.get('cacheFactory._store.userInfo');
    return this.get('http').request(`/UserInfo?username=${userInfo.Name}`);
  },
  setupController: function (controller, model) {
    this._super(controller, model);
    this.get('cacheFactory').addOrUpdate('userInfo', model.Data);
    controller.set('userInfoData', Ember.$.extend({}, model.Data));
  }
});
