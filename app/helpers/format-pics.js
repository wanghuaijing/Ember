import Ember from 'ember';

export function formatPics(params/*, hash*/) {
  let picString = params[0];
  if(picString instanceof Array){
    return picString
  }else {
    return picString.split('|');
  }
}

export default Ember.Helper.helper(formatPics);
