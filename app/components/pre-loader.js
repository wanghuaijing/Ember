import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['preloader'],
  classNameBindings: ['type', 'colorClass'],
  type: 'wp',
  colorClass: Ember.computed('color', function () {
    return 'preloader-' + (this.get('color') || 'primary');
  }),
  visible: true
});
