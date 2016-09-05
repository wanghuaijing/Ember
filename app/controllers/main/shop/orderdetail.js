import Ember from 'ember';

export default Ember.Controller.extend({
  http: Ember.inject.service(),
  enum: Ember.inject.service(),
  queryParams: ['orderID'],
  load(){
    let orderID = this.get('orderID');
    if (this.get('pageRequest')) {
      this.get('pageRequest').request.abort();
    }
    let that = this;
    Ember.run.later(function () {
      that.set('isLoading', true);
      let promise = that.get('http')
        .request('/Mall2/Order/Detail/Admin', {
          data: {
            id: that.get('orderID')
          }
        });

      that.set('pageRequest', promise);

      promise.then(function (value) {
          let orderData = value.Data;
          let orderTypes = that.get('enum.orderType');
          for (let key in orderTypes) {
            if (orderTypes[key].value === orderData.OrderStatus) {
              orderData.OrderStatusName = orderTypes[key].desc;
              break;
            }
          }
          that.set('orderData', orderData);
        })
        .catch(function (error) {
          if (!error.abort) {
            that.get('messager').alert(error.msg);
          }
        })
        .finally(()=>that.set('isLoading', false));
    });
  },
  actions: {
    goBack(){
      window.history.go(-1);
    }
  }
});
