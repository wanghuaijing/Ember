import Ember from 'ember';

export default Ember.Mixin.create({
  //loading state
  isLoading: false,
  //current page
  currentPage: 1,
  //total page
  totalPage: null,
  //each page's count
  count: 20,
  //load data
  pageDataList: [],
  resetPageData(){
    this.setProperties({
      errorMsg: null,
      pageDataList: [],
      totalCount: 0,
      totalPage: null,
      isLoading: true,
      currentPage: 1
    });
  },
  loadPageBegin(page){
    this.setProperties({
      errorMsg: null,
      pageDataList: [],
      totalCount: 0,
      isLoading: true,
      currentPage: page || 1
    });
  },
  loadPageComplete(totalCount, data){
    let pageCount = totalCount / this.get('count');
    this.set('isLoading', false);
    this.set('totalPage', pageCount >= 1 ? Math.ceil(pageCount) : 0);
    this.set('totalCount', totalCount);
    this.set('pageDataList', data);
  },
  actions:{
    search(page){
      if (!page) {
        this.resetPageData();
      }
      this.load(page || 1);
    }
  }
});
