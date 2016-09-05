import Ember from 'ember';

export default Ember.Component.extend({
  show: false,
  style: Ember.computed('width', function () {
    var width = this.get('width');
    return new Ember.Handlebars.SafeString('width:' + width);
  }),
  showToggled: Ember.observer('show', function () {
    if (this.get('show')) {
      this.showModal();
    }
    else {
      this.hideModal();
    }
  }),
  hideModal: function () {
    let that = this;
    let onClose = this.get('onModalClose');
    let onClosed = this.get('onModalClosed');
    let $ = Ember.$;
    let $body = $('body');
    let bodyEl = $body.get(0);
    onClose && onClose();
    if (that.get('fade')) {
      Ember.run.later(function () {
        that.$('.modal').hide();
        $body.removeClass('modal-open');
        $body.css('marginRight', '');
        onClosed && onClosed();
      }, 300);
    }
    else {
      that.$('.modal').hide();
      $(bodyEl).css('marginRight', '');
      onClosed && onClosed();
    }
  },
  showModal: function () {
    let $ = Ember.$;
    let onShow = this.get('onModalShow');
    let onShowed = this.get('onModalShowed');
    let $body = $('body');
    let bodyEl = $body.get(0);
    $(bodyEl).css('marginRight', window.innerWidth - bodyEl.scrollWidth);
    onShow && onShow();
    this.$('.modal').show();
    $body.height();
    $body.addClass('modal-open');
    if (this.get('fade')) {
      Ember.run.later(function () {
        onShowed && onShowed();
      },300);
    }
    onShowed && onShowed();
  },
  didRender(){
    if (this.get('show')) {
      this.$('.modal').scrollTop(0);
    }
  },
  actions: {
    close: function () {
      this.set('show', false);
    },
    confirm:function(){
      this.get('confirm')(()=>{this.set('show',false)})
    }
  }
});
