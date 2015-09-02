d3.chart('SunburstChart', {

  initialize: function () {

    var svg = this.base.node(),
      width = +svg.getAttribute('width'),
      height = +svg.getAttribute('height');

    var color = d3.scale.category20c();

    var partition = d3.layout.partition()
      .size([2*Math.PI, (height/2)-20])
      .value(function (point) {
        return point.value;
      }).sort(function (a, b) {
        return b.depth - a.depth;
      });

    // Start position of arcs
    var enterArc = d3.svg.arc()
      .startAngle(function (point) {return point.x})
      .endAngle(function (point) {return point.x + point.dx})
      .innerRadius(function (point) {return point.y})
      .outerRadius(function (point) {return point.y});

    var arc = d3.svg.arc()
      .startAngle(function (point) {return point.x})
      .endAngle(function (point) {return point.x + point.dx})
      .innerRadius(function (point) {return point.y})
      .outerRadius(function (point) {return point.y + point.dy});

    var arcsBase = this.base.append('g')
      .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

    this.layer('Arcs', arcsBase, {
      dataBind: function (data) {
        return this.data([data]).selectAll('path')
          .data(partition.nodes, function (node) {
            return node.id;
          });
      },

      insert: function () {
        return this.append('path');
      },

      events: {
        enter: function () {
          var chart = this.chart();

          this.attr('d', enterArc).style('fill', function (point) {
              return color((point.children ? point : point.parent).id);
            });
        },

        'first:merge:transition': function () {
          var chart = this.chart();

          // var totalDelay = 0;

          this.duration(function (d) {
            //if(!d.depth) chart.totalVal = d.value;
            return 700 //(d.value/chart.totalVal)*10000;
          }).delay(function (d, i) {
            // var delay = totalDelay;
            // if(d.depth) totalDelay += (d.value/chart.totalVal)*10000;

            // return delay;
            return d.depth*400
          }).attr('d', arc);
        },

        'merge:transition': function () {
          this.duration(700).attr('d', arc);
        }
      }
    });

  },

  transform: function (data) {
    return data;
  }

});