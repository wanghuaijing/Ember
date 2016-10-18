import Ember from 'ember';
import RSVP from 'rsvp';
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
            '7':'系统超时',
            "8":"退款成功"
        };
        /*return new RSVP.Promise(function(resolve){
            Ember.run.later(function () {
                that.get('http').request(`/Mall2/Order/Why?includeSystem=${true}`, {type: 'get', async: false})
                    .then(function (res) {
                        let reasons = [];
                        for (var key in res.Data) {
                            reasons.push({
                                value: key,
                                text: res.Data[key]
                            });
                        }
                        reasons.unshift({value: '', text: '不限原因'});
                        resolve(reasons)
                    })
                    .catch(function (error) {
                        console.log(error)
                    });
            })
        })*/
    },
/*    setupController(controller, model) {
        console.log(model); // "Hold Your Horses"
    }*/
});
