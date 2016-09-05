import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    pageChange(page){
      this.set('currentPage', page);
      this.get('onPageChange') && this.get('onPageChange')(page);
    }
  }
});
