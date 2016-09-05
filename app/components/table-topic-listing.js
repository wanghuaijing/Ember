import Ember from 'ember';
import config from '../config/environment';

export default Ember.Component.extend({
  tagName: 'tr',
  classNames: ['table-c-one'],
  listShowImg: Ember.computed('topic.ListShowPic', function () {
    let pic = this.get('topic.ListShowPic');
    if (pic) {
      pic = config.APP.APIHOST + '/File?quality=4&pid=' + pic;
    }
    else {
      pic = '/images/default-placeholder.png';
    }

    return pic;

    //return new Ember.Handlebars.SafeString('background-image:url(\'' + pic + '\')');
  }),
  didInsertElement(){
    if(this.get('animate')) {
      this.$().addClass('animated slideInRight').css({
        'animation-delay': 0.05 * this.get('index') + 's',
        'animation-fill-mode': 'backwards'
      });
    }
  }
});
