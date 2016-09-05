import Ember from 'ember';
import restoreScrollMixin from '../../../mixins/restore-scroll';

export default Ember.Route.extend(restoreScrollMixin, {
  http: Ember.inject.service(),
  model(){
    return {
      '1':'顾客不想买了',
      '2':'顾客买错了',
      '3':'缺货',
      '4':'商品质量有问题',
      '5':'其他'
    };
  }
});
