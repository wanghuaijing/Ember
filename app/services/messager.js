import Ember from 'ember';

export default Ember.Service.extend({
  queue: [],
  alert(msg){
    this.get('queue').pushObject({
      msg: msg
    });
  }
});
