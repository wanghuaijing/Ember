import Ember from 'ember';

export default Ember.Route.extend({
    http: Ember.inject.service(),
    model(){
        return {
            "0":"其他",
            "1":"不想买了",
            "2":"买错了",
            "3":"价格波动",
            "4":"卖家缺货",
            "5":"同城见面交易",
        };
    }
});
