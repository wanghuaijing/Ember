import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function (controller, model) {
    controller.load();
    controller.set('orderData', null);
  }
});
