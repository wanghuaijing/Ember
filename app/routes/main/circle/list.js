import Ember from 'ember';

export default Ember.Route.extend({
  http: Ember.inject.service(),
  model(){
    return this.get('http').request('/Thread/Category')
  },
  setupController(controller, modal){
    this._super(...arguments);
    let categorys = modal.Data;
    if (!controller.get('categoryID')) {
      controller.set('categoryID', categorys[0].ID);
    }
    else {
      let hasThis = categorys.some(each=>each.ID === controller.get('categoryID'));
      if (!hasThis) {
        controller.set('categoryID', categorys[0].ID);
      }
    }
  }
});
