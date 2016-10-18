import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';

export default Ember.Controller.extend(pagingDataMixin, {
        load(page){
            if (this.get('pageRequest')) {
                this.get('pageRequest')[0].request.abort();
                this.get('pageRequest')[1].request.abort();
            }
            let that = this;
            Ember.run.later(function () {
                that.loadPageBegin(page);
                let url = '/Mall2/RefundOrder/Admin';
                let params = {
                    q: that.get('keyword'),
                    type: that.get('orderType') || that.get('enum').returnOrder.ALL.value,
                    why: that.get('showCloseReasonSelect') ? that.get('closeReason') : null
                };
                let promises = [that.get('http')
                    .request(url, {
                        data: Ember.$.extend({}, {
                            skip: (page - 1) * that.get('count'),
                            count: that.get('count')
                        }, params)
                    }),
                    that.get('http')
                        .request(url, {
                            data: Ember.$.extend({}, {
                                count: 0
                            }, params)
                        })
                ];

                that.set('pageRequest', promises);
                Ember.RSVP.all(promises)
                    .then(function (values) {
                        values[0].Data && values[0].Data.forEach(function (item) {
                            that.get('orderTypes').some(function (type) {
                                if (item.Vendors.Goods[0].RefundContent[0].RefundStatus === type.value) {
                                    item.OrderStatusName = type.desc;
                                    item.isBack = true;
                                    return true;
                                }
                                return false;
                            });
                        });
                        that.loadPageComplete(values[1].Count, values[0].Data);
                    })
                    .catch(function (error) {
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('isLoading', false));
            });
        },
        enum: Ember.inject.service(),
        http: Ember.inject.service(),
        goodsCategory:0,
        keyword: '',
        closeReason: '',
        closeReasons: Ember.computed('model', function () {
            let model = this.get('model');
            let reasons = [];
            for (var key in model) {
                reasons.push({
                    value: key,
                    text: model[key]
                });
            }
            reasons.unshift({value: '', text: '不限原因'});
            return reasons;
        }),
        goodsCategorys: Ember.computed('enum.goodsCategory',function(){
            let goodsCategory = this.get('enum.goodsCategory');
            return goodsCategory
        }),
        orderTypes: Ember.computed('enum.returnOrder', function () {
            let types = [];
            let orderTypeEnum = this.get('enum.returnOrder');
            for (var key in orderTypeEnum) {
                types.push({
                    value: orderTypeEnum[key].value&&orderTypeEnum[key].value * 1,
                    desc: orderTypeEnum[key].desc
                });
            }
            return types;
        }),
        showCloseReasonSelect: Ember.computed('orderType', function () {
            if (this.get('orderType') == this.get('enum').orderType.CLOSED.value) {
                return true;
            }
            return false;
        }),
        actions: {
            orderTypeChange: function (type) {
                this.set('orderType', type * 1);
            },
            closeReasonChange: function (type) {
                this.set('closeReason', type);
            },
            goodsCategoryChange:function(type){
                this.set('goodsCategory',type)
            }
        }
    })
    .reopen({
        actions: {
            orderOperate: function (type, order) {
                let that = this;
                switch (type) {
                    case 'detail':
                        that.transitionToRoute('main.shop.orderdetail', {
                            queryParams: {
                                orderID: order.ID
                            }
                        });
                        break;
                    case 'delete':
                        that.openDeleteDialog(order);
                        break;
                    case 'outTicket':
                        that.openOutTicketDialog(order);
                        break;
                    case 'refund':
                        that.openRefundDialog(order);
                        break;
                }
            }
        }
    })
    .reopen({
        deleteReason: '',
        showDeleteDialog: false,
        isOrderDeleting: false,
        deletingOrder: null,
        openDeleteDialog(order){
            if (this.get('isOrderDeleting')) {
                this.get('messager').alert('另一个操作正在进行中,请稍等');
            }
            this.set('deleteReason', this.get('closeReasons')[1].value);
            this.set('showDeleteDialog', true);
            this.set('deletingOrder', order);
        },
        actions: {
            toggleDeleteDialog(val){
                this.set('showDeleteDialog', val);
            },
            deleteReasonChange(value){
                this.set('deleteReason', value);
            },
            deleteOrder(){
                let that = this;
                if (that.get('isOrderDeleting')) {
                    return;
                }
                let reasonValue = that.get('deleteReason');
                let reasonText = this.get('closeReasons').findBy('value',reasonValue).text;
                that.set('isOrderDeleting', true);
                that.get('http')
                    .request(`/Mall2/Order/Cancel/Admin?id=${that.get('deletingOrder').ID}&code=${reasonValue}&why=${reasonText}`, {
                        type: 'delete'
                    })
                    .then(function () {
                        that.set('showDeleteDialog', false);
                        that.load();
                    })
                    .catch(function (error) {
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('isOrderDeleting', false));
            }
        }
    })
    .reopen({
        showOutTicketDialog: false,
        orderOutTicketing: false,
        outTicketOrder: null,
        outTicketLoadingDetail: null,
        outTicketLoadingDetailRequest: null,
        openOutTicketDialog(order){
            //防止错误操作
            if (this.get('orderOutTicketing')) {
                this.get('messager').alert('另一个操作正在进行中,请稍等');
            }
            this.set('showOutTicketDialog', true);
            this.set('outTicketOrder', order);
            this.loadOrderDetail();
        },
        loadOrderDetail(){
            if (this.get('outTicketLoadingDetail')) {
                this.get('outTicketLoadingDetailRequest').request.abort();
            }
            let that = this;
            Ember.run.later(function () {
                that.set('outTicketLoadingDetail', true);
                let promise = that.get('http')
                    .request('/Mall2/Order/Detail/Admin', {
                        data: {
                            id: that.get('outTicketOrder').ID
                        }
                    });

                that.set('outTicketLoadingDetailRequest', promise);

                promise.then(function (value) {
                        let orderData = value.Data;
                        let orderTypes = that.get('enum.orderType');
                        for (let key in orderTypes) {
                            if (orderTypes[key].value === orderData.OrderStatus) {
                                orderData.OrderStatusName = orderTypes[key].desc;
                                break;
                            }
                        }
                        that.set('outTicketOrderDetail', orderData);
                    })
                    .catch(function (error) {
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('outTicketLoadingDetail', false));
            });
        },
        //出票
        outTicket(){
            let that = this;
            that.set('orderOutTicketing', true);
            that.get('http')
                .request(`/Mall2/Order/Shipping?id=${that.get('outTicketOrder').ID}`, {
                    type: 'post',
                    data: {
                        delivery: null
                    }
                })
                .then(function () {
                    that.set('showOutTicketDialog', false);
                    that.get('messager').alert('出票成功!');
                    that.load();
                })
                .catch(function (error) {
                    if (!error.abort) {
                        if (error.code == -6) {
                            return that.get('messager').alert('订单当前状态不是"待发货",可能已被操作过,请刷新列表');
                        }
                        that.get('messager').alert(error.msg);
                    }
                })
                .finally(()=>that.set('orderOutTicketing', false));
        },
        actions: {
            toggleOutTicketDialog(val){
                this.set('showOutTicketDialog', val);
            },
            outTicket(){
                this.outTicket();
            }
        }
    })
    //审核退款
    .reopen({
        showRefundDialog: false,
        showGoPayDialog: false,
        refundOrder: null,
        refundReason: '',
        isOrderRefunding: null,
        isRefundOK: 1,
        outRefundLoadingDetail:false,
        actionLink: Ember.computed('isRefundOK', function () {
            return this.get('http.host') + `/Mall2/Order/Refund/Check?op=${this.get('isRefundOK')}`;
        }),
        loadRefundOrderDetail(order,self){
            let id = order.ID;
            let purchaseID = order.Vendors.Goods[0].Purchase.PurchaseID;
            self.set('currentRefundOrder',order);
            if (self.get('outRefundLoadingDetail')) {
                self.get('outRefundLoadingDetailRequest').request.abort();
            }
            let that = self ;
            Ember.run.later(function () {
                that.set('Refund', true);
                let promise = that.get('http')
                    .request(`/Mall2/Order/Refund?orderID=${id}&purchaseID=${purchaseID}`);

                that.set('outRefundLoadingDetailRequest', promise);

                promise.then(function (value) {
                        let orderData = value.Data;
                        let orderTypes = that.get('enum.returnOrder');
                        for (let key in orderTypes) {
                            if (orderTypes[key].value === orderData.RefundStatus) {
                                orderData.OrderStatusName = orderTypes[key].desc;
                                break;
                            }
                        }
                        that.set('refundOrder', orderData);
                        that.set('Refund', false);
                    })
                    .catch(function (error) {
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('outRefundLoadingDetail', false));
            });
        },
        openRefundDialog(order){
            this.set('showRefundDialog', true);
            this.get('loadRefundOrderDetail')(order,this)
        },
        actions: {
            toggleRefundDialog(val){
                this.set('showRefundDialog', val);
            },
            opChange(value){
                let isRefundOK = this.get('isRefundOK');
                if(isRefundOK==1){
                    this.set('isRefundOK',0)
                }else {
                    this.set('isRefundOK',1)
                }
            },
            refundOrder(type){
                let refunType = type==0;
                let that = this;
                that.set('isOrderRefunding', true);
                that.get('http')
                    .request(`/Mall2/Order/Refund/Check?op=${that.get('isRefundOK')}`, {
                        type: 'post',
                        data: {
                            ApplyRefundID: this.get('refundOrder')[0].ID,
                            Description: this.get('refundOrder')[0].RefundReason||'默认退款',
                            Amount:this.get('refundOrder')[0].RefundedMoney*100,
                            IsRefundNow:refunType
                        }
                    })
                    .then(function (res) {
                        that.set('showRefundDialog', false);
                        if(that.get('isRefundOK')==1){
                            if(res.Data){
                                that.set('showGoPayDialog', true);
                                that.get('messager').alert('即将跳转到付款页面，付款完成后请刷新列表!');
                                let externalHttp = res.Data.replace(/需要打开地址进行下一步退款操作:/g,'');
                                window.open(externalHttp, '');
                                that.set('actionLink',externalHttp);
                            }else {
                                that.set('actionLink','')
                            }
                        }
                    })
                    .catch(function (error) {
                        if (!error.abort) {
                            if (error.code == -6) {
                                return that.get('messager').alert('订单当前状态不是"待退款审核",可能已被操作过,请刷新列表');
                            }
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('isOrderRefunding', false));
            }
        }
    });

