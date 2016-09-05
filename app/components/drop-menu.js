import Ember from 'ember';

export default Ember.Component.extend({
  tools: Ember.inject.service(),
  classNames: ['drop-menu', 'animated'],
  didInsertElement(){
    let $ = Ember.$;
    this.set('eventID', this.get('tools').guid());
    let $drop = this.$().closest('.drop-down');
    let that = this;
    $drop.on('click.dropDown' + this.get('eventID'), function () {
      $(this).toggleClass('open');
      if(!$(this).hasClass('open')){
        that.get('onClose') && that.get('onClose')();
      }
      else{
        that.get('onOpen') && that.get('onOpen')();
      }
    });

    $('body').on('click.dropDown' + this.get('eventID'), function (e) {
      if (!(e.target === $drop.get(0) || $(e.target).closest('.drop-down').get(0) === $drop.get(0))) {
        $drop.removeClass('open');
      }
    });
  },
  willDestroyElement(){
    let $ = Ember.$;
    this.$().closest('.drop-down').off('click.dropDown' + this.get('eventID'));
    $('body').off('click.dropDown' + this.get('eventID'));
  }
});
