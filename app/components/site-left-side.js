import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['site-left-side'],
  //classNameBindings: ['collapsed'],
  collapsed: false,
  actions: {
    toggle(isCollapsed){
      let {$} = Ember;
      this.set('collapsed', isCollapsed);
      if (isCollapsed) {
        $('body').addClass('collapsed');
        this.$().css('left', 10 - this.$().width());
        var $root = this.$();
        Ember.run.later(function () {
          $root.one('mouseenter', function () {
            $root.attr('style', '');
          })
        }, 300);
      }
      else {
        $('body').removeClass('collapsed');
      }
    }
  }
});
