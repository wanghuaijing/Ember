import Ember from 'ember';

export default Ember.Controller.extend({
  cacheFactory: Ember.inject.service(),
  http: Ember.inject.service(),
  userInfo: Ember.computed('cacheFactory._store.userInfo', function () {
    return this.get('cacheFactory._store.userInfo');
  }),
  avatarSrc: Ember.computed('cacheFactory._store.userInfo.PhotoUrl', function () {
    if (this.get('cacheFactory._store.userInfo')) {
      return `${this.get('http').get('host')}/UserAvatar?pid=${this.get('cacheFactory._store.userInfo.ID')}&${this.get('cacheFactory._store.userInfo.PhotoUrl')}`;
    }
  }),
  currentTheme: Ember.computed('cacheFactory._store.theme', function () {
    return this.get('cacheFactory._store.theme');
  }),
  setTheme(theme){
    ['primary', 'info', 'caution', 'success', 'danger', 'dark'].forEach(function (item) {
      Ember.$('body').removeClass(`theme-${item}`);
    });
    Ember.$('body').addClass(`theme-${theme}`);
    this.get('cacheFactory').addOrUpdate('theme', theme);
  },
  actions: {
    logout(){
      this.get('cacheFactory').removeAll();
      //this.transitionToRoute('login');
      //for clear controller
      window.location.reload();
    },
    toggleThemeDialog(isShow){
      this.set('toggleThemeDialog', isShow);
    },
    changeTheme(theme){
      this.setTheme(theme);
    }
  }
});
