/**
 * Created by qizhang on 4/19/16.
 */
import Ember from 'ember'
export  default Ember.Service.extend({
  orderType: {
    ALL: {
      desc: '全部',
      value: 0
    },
    NOT_PAYED: {
      desc: '待付款',
      value: 1
    },
    NOT_OUT_TICKET: {
      desc: '待发货',
      value: 2
    },
    HAS_SEND: {
      desc: '已发货',
      value: 3
    },
    COMPLETE: {
      desc: '已完成',
      value: 4
    },
    CLOSED: {
      desc: '已关闭',
      value: 5
    },
    TUAN_NOT_TICKET:{
      desc:'团购待确认',
      value:10
    }
  },
  returnOrder:{
    ALL: {
      desc: '全部',
      value:null
    },
    AUDIT_FAIL:{
      desc:'审核不通过',
      value:0
    },
    REFUNDS_UNCHECK: {
      desc: '退款待审核',
      value: 1
    },
    RETURN_GOODS: {
      desc: '退货中',
      value: 2
    },
    REFUNDS_ING: {
      desc: '退款中',
      value: 3
    },
    REFUNDS_DONE: {
      desc: '已退款',
      value: 4
    },
    REFUNDS_FAIL:{
      desc:'退款失败',
      value:5
    }
  },
  goodsCategory:[
    {
      name:'全部',
      value:0
    },
    {
      name:'票务',
      value:0
    },
    {
      name:'实物',
      value:1
    }
  ],
  bannerType:[
    {
      desc:'商品',
      value:'商品'
    }
  ],
  shippingType:{
    EXPRESS_SHIPPING:{
      desc:'运送中',
      value:0
    },
    EXPRESS_GET:{
      desc:'揽件',
      value:1
    },
    EXPRESS_ERROR:{
      desc:"疑难",
      value:2
    },
    EXPRESS_SIGN_IN:{
      desc:"签收",
      value:3
    },
    EXPRESS_BACK_SIGN:{
      desc:'退签',
      value:4
    },
    EXPRESS_START:{
      desc:"派送",
      value:5
    },
    EXPRESS_BACKING:{
      desc:"退回",
      value:6
    }


  },
  bannerSeq:[
    {
      value:1,
      desc:'顺序为1'
    },
   {
      value:2,
      desc:'顺序为2'
    },
    {
      value:3,
      desc:'顺序为3'
    },
   {
      value:4,
      desc:'顺序为4'
    },
    {
      value:5,
      desc:'顺序为5'
    }
  ],
  activityEnum:{
    1:'新用户注册',
    2:'首单购买'


  }
});
