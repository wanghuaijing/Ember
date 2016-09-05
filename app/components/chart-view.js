import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'canvas',
  setup: false,
  update: true,

  /**
   * Construction handler
   * This will create the canvas and check the given
   * input values since Chart.js can react pretty odd
   * when getting wrong and/or missing values.
   */
  didInsertElement: function () {
    let canvas = this.get('element');
    let context = canvas.getContext('2d');

    canvas.width = $(canvas).parent().width();
    canvas.height = $(canvas).parent().height();

    let data = this.get('data');
    let type = this.get('type').charAt(0).toUpperCase() + this.get('type').slice(1);
    if (!type.match(/(Line|Bar|Radar|PolarArea|Pie|Doughnut)/)) type = "Line";
    let options = (this.get('options') !== undefined) ? this.get('options') : {};

    this.setProperties({
      '_data': data,
      '_type': type,
      '_canvas': canvas,
      '_context': context,
      '_options': options
    });
    this.chartRender();
  },

  /**
   * Render the chart to the canvas
   * This function is separated from the event hook to
   * allow data overwriting which more or less results
   * in updating the chart.
   */
  chartRender: function () {
    let that = this;
    if (that.get('setup')) {
      this.get('_chart').destroy();
    }
    let chart = new Chart(this.get('_context'), {
      type: that.get('_type').toLocaleLowerCase(),
      data: that.get('data'),
      options: that.get('_options')
    });
    this.setProperties({
      '_chart': chart,
      'setup': true
    });
  },

  /**
   * Chart Update Handler
   * This will re-render the chart whenever its data or
   * options changes, if the 'update' property is set to true
   */
  chartUpdate: function () {
    if (this.get('update') === true && this.get('setup') == true) {
      this.chartRender();
    }
  }
    .observes('data', 'options')
})
;
