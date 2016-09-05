import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('login');
  this.route('main', function() {
    this.route('recommend', function() {
      this.route('new');
      this.route('list');
      this.route('stickie');
    });

    this.route('account', function() {
      this.route('baseinfo');
      this.route('security');
    });

    this.route('circle', function() {
      this.route('new');
      this.route('list');
    });
    this.route('help');

    this.route('shop', function() {
      this.route('order', function() {});
      this.route('orderdetail');
      this.route('stock');
      this.route('goods');
      this.route('goodsdetail');
      this.route('salescount');
      this.route('salesmoney');
      this.route('goodstemplate');
      this.route('goodsclassify');
      this.route('templatedetail');
      this.route('merchant');
      this.route('merchantDetaile');
    });

    this.route('ordermanage', function() {
      this.route('orderlist');
      this.route('orderdrawback');
    });
  });
});

export default Router;
