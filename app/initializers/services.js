export function initialize(application) {
  // application.inject('route', 'foo', 'service:foo');

   application.inject('controller', 'messager', 'service:messager');
}

export default {
  name: 'services',
  initialize
};
