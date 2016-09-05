import Ember from 'ember';

export function formatPics(params/*, hash*/) {
  let picString = params[0];
  let pics = picString.split('|');
  return pics;
}

export default Ember.Helper.helper(formatPics);
