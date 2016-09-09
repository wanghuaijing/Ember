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
    TUAN_WAIT:{
      desc:'团购',
      value:10
    }
  },
  returnOrder:{
    ALL: {
      desc: '全部',
      value:null
    },
    AUDIT_ING:{
      desc:'审核中',
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
      desc:'全部'
    },
    {
      desc:'广告',
      value:'广告'
    },
    {
      desc:'商品',
      value:'商品'
    }
  ]
});
