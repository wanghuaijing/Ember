import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['order-view'],
  enum: Ember.inject.service(),
  showCancel: Ember.computed('order', function () {
    if(!this.get('order'))return;
    let status = this.get('order').OrderStatus;
    let orderTypes = this.get('enum').orderType;
    if(orderTypes.NOT_PAYED&&orderTypes.NOT_OUT_TICKET){
      return status === orderTypes.NOT_PAYED.value || status === orderTypes.NOT_OUT_TICKET.value;
    }
  }),
  showOutTicket: Ember.computed('order', function () {
    if(!this.get('order'))return;
    let status = this.get('order').OrderStatus;
    let orderTypes = this.get('enum').orderType;
    if(orderTypes.NOT_OUT_TICKET){
      return status === orderTypes.NOT_OUT_TICKET.value;
    }
  }),
  showRefund: Ember.computed('order', function () {
    if(!this.get('order'))return;
    let status = this.get('order').OrderStatus;
    let orderTypes = this.get('enum').orderType;
    console.log(1)
    if(orderTypes.REFUNDS_UNCHECK){
      return status === orderTypes.REFUNDS_UNCHECK.value;
    }
  }),
  actions:{
    operate(type){
      this.get('onOperate') && this.get('onOperate')(type, this.get('order'));
    }
  }
});
