d3.chart('BarChart', {

  initialize: function () {
    var _this = this;

    var svg = this.base.node();
    this.width = +svg.getAttribute('width');
    this.height = +svg.getAttribute('height');

    this.layer('VerticalBars', this.base.append('g'), {

      dataBind: function (data) {
        return;
      },

      insert: function () {
        return;
      },

      events: {
        
      }

    });

  },

  transform: function (data) {
    
    return data;
  }

});