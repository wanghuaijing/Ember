import Ember from 'ember';

export default Ember.Route.extend({
  http: Ember.inject.service(),
  model(){
    return this.get('http').request('/Thread/Category')
  },
  setupController(controller, model){
    this._super(...arguments);
    //;if (!controller.get('formData.CID')) {
    //  controller.set('formData.CID', model.Data[0].ID);
    //}
    controller.reset()
  }
});
