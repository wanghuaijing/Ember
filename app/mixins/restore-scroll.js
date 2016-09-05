import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    willTransition(){
      this.set('scrollTop', document.body.scrollTop);
    },
    didTransition(){
      let that = this;
      Ember.run.later(function () {
        document.body.scrollTop = that.get('scrollTop');
      })
    }
  }
});
