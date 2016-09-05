import Ember from 'ember';

export default Ember.Route.extend({
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
