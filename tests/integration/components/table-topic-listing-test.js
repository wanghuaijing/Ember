import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('table-topic-listing', 'Integration | Component | table topic listing', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{table-topic-listing}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#table-topic-listing}}
      template block text
    {{/table-topic-listing}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
