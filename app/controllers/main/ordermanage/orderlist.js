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
                let url = '/Mall2/Order/Admin';
                let params = {
                    q: that.get('keyword'),
                    type: that.get('orderType') || that.get('enum').orderType.ALL.value,
                    why: that.get('showCloseReasonSelect') ? that.get('closeReason') : null
                }
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
                            let isBack = true;
                            item.Vendors.Goods&&item.Vendors.Goods.map(function(goods){
                                if(goods.RefundContent){
                                }else {
                                    isBack = false;
                                }
                            });
                            that.get('orderTypes').some(function (type) {
                                if (item.OrderStatus === type.value) {
                                    item.OrderStatusName = type.desc;
                                    item.isBack = isBack;
                                    return true;
                                }
                                return false;
                            });
                        });
                        that.loadPageComplete(values[1].Count, values[0].Data);
                    })
                    .catch(function (error) {
                        console.log(error)
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('isLoading', false));
            });
        },
        enum: Ember.inject.service(),
        http: Ember.inject.service(),
        orderType: 0,
        goodsCategory:0,
        keyword: '',
        closeReason: '',
        closeReasons: Ember.computed('model', function () {
            let model = this.get('model')
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
        orderTypes: Ember.computed('enum.orderType', function () {
            let types = [];
            let orderTypeEnum = this.get('enum.orderType');
            for (var key in orderTypeEnum) {
                types.push({
                    value: orderTypeEnum[key].value * 1,
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
                console.log(type)
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
                    case "shipping":
                        that.openShippingDialog(order);
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

                that.set('isOrderDeleting', true);
                that.get('http')
                    .request(`/Mall2/Order/Cancel/Admin?id=${that.get('deletingOrder').ID}&why=${that.get('deleteReason')}`, {
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
        logisticsInfo:{},
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
                        let isRefund = true;
                        orderData.Vendors.Goods&&orderData.Vendors.Goods.forEach(function(item){
                            if(item.RefundContent){
                                item.isRefund = true
                            }else {
                                item.isRefund = true
                                isRefund = false;
                            }
                        });
                        orderData.isRefund = isRefund;
                        that.set('outTicketOrderDetail', orderData);
                    })
                    .catch(function (error) {
                        if (!error.abort) {
                            that.get('messager').alert(error.msg);
                        }
                    })
                    .finally(()=>that.set('outTicketLoadingDetail', false));
                //获取物流公司信息
                that.get('http').request(`/Mall2/Order/Shipping/Company`)
                    .then(function(res){
                        that.set('companyList',res.Data);
                    })
                    .catch(function(error){
                        console.log(error)
                    })
            });
        },
        //出票
        outTicket(){
            let that = this;
            that.set('orderOutTicketing', true);
            let logisticsInfo = this.get('logisticsInfo');
            let outTicketOrderDetail = this.get('outTicketOrderDetail');
            that.get('http')
                .request(`/Mall2/Order/Shipping?id=${that.get('outTicketOrder').ID}`, {
                    type: 'post',
                    data:logisticsInfo
                })
                .then(function () {
                    that.set('showOutTicketDialog', false);
                    if(outTicketOrderDetail.Vendors.Goods[0].IsEntity){
                        that.get('messager').alert('发货成功')
                    }else {
                        that.get('messager').alert('出票成功!');
                    }
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
                this.set('logisticsInfo',{})
            },
            outTicket(){
                this.outTicket();
            },
            changeCompany(value){
                let companyList = this.get('companyList');
                let name  = '';
                companyList&&companyList.some(function(item){
                    if(item.ID==value){
                        name = item.Name;
                        return true
                    }
                });
                this.set('logisticsInfo.CompanyID',value);
                this.set('logisticsInfo.CompanyName',name);
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
        actionLink: Ember.computed('isRefundOK', function () {
            return this.get('http.host') + `/Mall2/Order/Refund/Check?op=${this.get('isRefundOK')}`;
        }),
        openRefundDialog(order){
            this.set('showRefundDialog', true);
            this.set('refundOrder', order);
        },
        actions: {
            toggleRefundDialog(val){
                this.set('showRefundDialog', val);
            },
            refundOrder(){
                let that = this;
                that.set('isOrderRefunding', true);
                that.get('http')
                    .request(`/Mall2/Order/Refund/Check?op=${that.get('isRefundOK')}`, {
                        type: 'post',
                        data: {
                            Order_no: this.get('refundOrder').ID,
                            Description: this.get('refundReason')
                        }
                    })
                    .then(function (res) {
                        that.set('showRefundDialog', false);
                        that.set('showGoPayDialog', true);
                        //that.get('messager').alert('即将跳转到付款页面，付款完成后请刷新列表!');
                        //window.open(res.Data.replace(/.*(?=http:\/\/)/gi), '');
                        this.set('actionLink',res.Data.replace(/.*(?=http:\/\/)/gi), '');
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
    })
    .reopen({
        //查看物流
        showShippingDialog:false,
        outShippingLoading:false,
        shippingType:Ember.computed('enum.shippingType',function(){
           return this.get('enum').shippingType
        }),
        openShippingDialog(order){
            this.set('showShippingDialog',true);
            this.set('outShippingLoading',true);
            let that = this;
            let shippingNum = order.ShippingNum;
            let shippingType = this.get('shippingType');
            console.log(shippingType)
            this.get('http').request(`/Mall2/Order/Shipping?deliveryNo=${shippingNum}`)
                .then(function(res){
                    res.Data.OrderNo = order.OrderNo;
                    for(var item in shippingType){
                        if(shippingType[item].value==res.Data.state){
                            res.Data.stateName=shippingType[item].desc;
                        }
                    }
                    that.set('shippingDetail',res.Data);
                    that.set('outShippingLoading',false)
                }).catch(function(error){
                console.log(error);
                if (!error.abort) {
                    that.get('messager').alert(error.msg);
                }
            })
        },
        actions:{
            toggleShippingDialog(val){
                this.set('showShippingDialog',val)
            }

        }
    })

