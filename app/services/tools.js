import Ember from 'ember';

export default Ember.Service.extend({
  guid(){
    let str = 'xxxxxxxxxxxxxxxxxxx';
    return str.replace(/x/g, function () {
      let a = Math.floor(Math.random() * 16);
      return a.toString(16);
    });
  }
});
