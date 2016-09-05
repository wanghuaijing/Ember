import Ember from 'ember';

export default Ember.Component.extend({
  resize: function () {
    let $ = Ember.$;
    this.$('.site-body').css('minHeight', $(window).height());
  },
  didInsertElement: function () {
    let $ = Ember.$;
    $(window).on('resize',this.resize);
    this.resize();
  },
  willDestroyElement: function () {
    let $ = Ember.$;
    $(window).off('resize',this.resize);
  }
});
