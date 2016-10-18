import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['order-view'],
  enum: Ember.inject.service(),
  showCancel: Ember.computed('order', function () {
    if(!this.get('order'))return;
    let status = this.get('order').OrderStatus;
    let isBack = this.get('order').isBack;
    let orderTypes = this.get('enum').orderType;
    if(isBack){
      return false
    }else {
      if(orderTypes.NOT_PAYED&&orderTypes.NOT_OUT_TICKET){
        return status === orderTypes.NOT_PAYED.value;
      }else {
        return false
      }
    }
  }),
  showOutTicket: Ember.computed('order', function () {
    if(!this.get('order'))return;
    let status = this.get('order').OrderStatus;
    let orderTypes = this.get('enum').orderType;
    let isBack = this.get('order').isBack;
    if(isBack){
      return false
    }else{
      if(orderTypes.NOT_OUT_TICKET){
        return status === orderTypes.NOT_OUT_TICKET.value;
      }else {
        return false
      }
    }
  }),
  showShipping:Ember.computed('order',function(){
    if(!this.get('order'))return;
    let status = this.get('order').OrderStatus;
    let orderTypes = this.get('enum').orderType;
    let isBack = this.get('order').isBack;
    let goods = this.get('order').Vendors.Goods
    if(isBack){
      return false
    }else {
      if(orderTypes.HAS_SEND&&orderTypes.COMPLETE){
        return status ===orderTypes.COMPLETE.value||status === orderTypes.HAS_SEND.value;
      }else {
        return false
      }
    }
  }),
  showRefund: Ember.computed('order', function () {
    if(!this.get('order'))return;
    let isBack = this.get('order').isBack;
    if(isBack){
      let status = this.get('order').Vendors.Goods[0].RefundContent[0].RefundStatus;
      let orderTypes = this.get('enum').returnOrder;
      if(orderTypes.REFUNDS_UNCHECK){
        return status === orderTypes.REFUNDS_UNCHECK.value;
      }else {
        return false
      }
    }else {
      return false
    }
  }),
  showRefresh:Ember.computed('order', function () {
    if(!this.get('order'))return;
    let isBack = this.get('order').isBack;
    if(isBack){
      let status = this.get('order').Vendors.Goods[0].RefundContent[0].RefundStatus;
      let orderTypes = this.get('enum').returnOrder;
      if(status === orderTypes.RETURN_GOODS.value){
        return true
      }else {
        return false
      }
    }else {
      return false
    }
  }),
  actions:{
    operate(type){
      this.get('onOperate') && this.get('onOperate')(type, this.get('order'));
    }
  }
});
