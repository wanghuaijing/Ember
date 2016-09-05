import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';

export default Ember.Controller.extend(pagingDataMixin, {
        init(){
            this._super(...arguments);
            let nowYear = new Date().getFullYear();
            let years = [];
            for (let i = 2014; i <= nowYear; i++) {
                years.push(i);
            }
            this.set('years', years);
        },
        http: Ember.inject.service(),
        count: 10,
        load(page){
            let count = this.get('count');
            if (this.get('pageRequest')) {
                this.get('pageRequest')[0].request.abort();
                this.get('pageRequest')[1].request.abort();
            }

            let that = this;
            Ember.run.later(function () {
                that.loadPageBegin(page);
                let url = '/Mall2/StatisticalData/Lists';
                let params = {
                    q: that.get('keyword'),
                    beginTime: that.get('beginTime'),
                    endTime: that.get('endTime'),
                    dataType: 2
                };
                let promises = [that.get('http')
                    .request(url, {
                        data: Ember.$.extend({}, {
                            skip: (page - 1) * count,
                            count: count
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
                        values[0].Data && values[0].Data.forEach(function (one, i) {
                            one.Rank = (that.get('currentPage') - 1) * count + i + 1;
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
        }
    })
    .reopen({
        showSalesOfMonthDialog: false,
        loadSalesOfMonth(time){
            this.set('chartData', null);
            let http = this.get('http');
            let that = this;
            that.set('isLoadingSalesOfMonth', true);
            let promise = http.request('/Mall2/StatisticalData/Detail', {
                data: {
                    dataType: 2,
                    goodsID: this.get('activeGoods').ID,
                    time: time + '-1',
                    timeType: 1
                }
            });

            this.set('loadingSalesOfMonthRequest', promise.request);

            promise.then(function (value) {
                    let data = value.Data;
                    let tempData = {
                        labels: [],
                        datasets: [{label: that.get('activeGoods').Name, data: []}]
                    };
                    for (let key in data) {
                        tempData.labels.push(key + '月');
                        tempData.datasets[0].data.push(data[key].SaleMoney);
                    }
                    that.set('chartData', tempData);
                })
                .catch(function (error) {
                    if (!error.abort) {
                        that.get('messager').alert(error.msg);
                    }
                })
                .finally(()=>that.set('isLoadingSalesOfMonth', false));
        },
        actions: {
            toggleSalesOfMonthDialog(val, item){
                this.set('showSalesOfMonthDialog', val);
                this.set('activeGoods', item);
                this.set('chartData', null);
                this.set('activeYear', this.get('years')[0]);
                this.loadSalesOfMonth(this.get('years')[0]);
            },
            searchSalesOfMonth(){
                this.loadSalesOfMonth();
            },
            yearChange(val){
                this.set('activeYear', val * 1);
                this.get('loadingSalesOfMonthRequest').abort();
                let that = this;
                Ember.run.later(function () {
                    that.loadSalesOfMonth(val);
                });
            },
            modalClose(){
                this.get('loadingSalesOfMonthRequest').abort();
            }
        }
    });
