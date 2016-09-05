import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'img',
  placeholder: './images/default-placeholder.png',
  //attributeBindings: ['placeholder:src'],
  didInsertElement(){
    this.loadImage();
    let that = this;
    this.$().on('click', function () {
      that.get('onClick') && that.get('onClick')();
    });
  },
  willDestroyElement(){
    this.$().off('click');
  },
  imgFileChanged: Ember.observer('original', function () {
    this.loadImage();
  }),
  loadImage(){
    var img = new Image(), that = this;
    if(!that.get('original'))return;
    if (that.get('tagName') === 'img') {
      that.$().attr('src', this.get('placeholder'));
    }
    else {
      that.$().css('backgroundImage', `url('${this.get('placeholder')}')`);
    }
    Ember.$(img).one('load', function () {
      if (img.src != that.get('original')) {
        return;
      }
      if (that.$()) {
        if (that.get('tagName') === 'img') {
          that.$().attr('src', img.src);
        }
        else {
          that.$().css('backgroundImage', `url('${img.src}')`);
        }
        that.$().addClass('entrance fade-in');
      }
    });
    img.src = this.get('original');
  }
});
