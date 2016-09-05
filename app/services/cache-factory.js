import Ember from 'ember';

const storageName = 'lf-manage';
export default Ember.Service.extend({
  _store: {},
  init(){
    this.set('_store', store.get(storageName) || {});
  },
  addOrUpdate (key, value) {
    let _store = this.get('_store');
    this.set('_store.' + key, value);
    store.set(storageName, _store);
  },
  remove (key){
    let _store = this.get('_store');
    this.set('_store.' + key, null);
    store.set(storageName, _store);
  },
  removeAll(){
    this.set('_store', {});
    store.remove(storageName);
  }
});
