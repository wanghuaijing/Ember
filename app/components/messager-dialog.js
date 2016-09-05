import Ember from 'ember';

export default Ember.Component.extend({
  init(){
    this._super(...arguments);
    //TODO: 保证观察属性会正确执行
    this.get('messager');
  },
  messager: Ember.inject.service(),
  message: null,
  queueChange: Ember.observer('messager.queue.[]', function () {
    if (this.get('messager.queue').length === 0) {
      return this.set('message', null);
    }
    if (!this.get('message')) {
      //Ember.run.later(()=> {
      this.set('message', {
        msg: this.get('messager.queue')[0].msg
        //})
      });
    }
  }),
  actions: {
    close(){
      this.set('message', null);
      Ember.run.later(()=> {
        this.get('messager.queue').removeAt(0);
      });
    }
  }
});
