import Ember from 'ember';

export default Ember.Component.extend({
  percentChanged: Ember.observer('percent', function () {
    this.set('percentStyles', new Ember.Handlebars.SafeString('width:' + this.get('percent')));
  }),
  accept: "image/*",
  didInsertElement(){
    let that = this;
    let $file = that.$().find('input[type="file"]');
    this.$('.thumb').on('click', function () {
      $file.click();
    });

    $file.on('change', function () {
      that.get('onFileChange')($file.get(0));
    });
  },
  willDestroyElement(){
    this.$('input[type="file"]').off('change');
    this.$('.thumb').off('click');
  }
});
