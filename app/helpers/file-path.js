import Ember from 'ember';
import env from '../config/environment';

export function filePath(params) {
  let quality = params[1];
  let id = params[0];
  return `${env.APP.APIHOST}/file?pid=${id}` + (quality ? `&quality=${quality}` : '');
}

export default Ember.Helper.helper(filePath);
