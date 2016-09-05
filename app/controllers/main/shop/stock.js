import Ember from 'ember';
import pagingDataMixin from '../../../mixins/paging-data';

export default Ember.Controller.extend(pagingDataMixin, {
  http: Ember.inject.service(),
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
        dataType: 3
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
  actions: {
    
  }
});
