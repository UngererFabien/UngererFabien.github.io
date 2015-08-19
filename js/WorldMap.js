d3.chart('WorldMapChart', {

  initialize: function () {
    var _this = this;

    var canvas = this.base.append('canvas')
      .attr('width', 700)
      .attr('height', 500);
      

    var canvasNode = canvas.node(),
      width = +canvasNode.getAttribute('width'),
      height = +canvasNode.getAttribute('height');

    var context = canvasNode.getContext('2d');
    context.lineWidth = 0.5;

    var projection = d3.geo.equirectangular()
      .scale((width + 1) / 2 / Math.PI)
      .translate([width / 2, height / 1.8]);

    var path = d3.geo.path()
      .projection(projection)
      .context(context);

    var zoom = d3.behavior.zoom()
      .translate([width / 2, height / 1.8])
      .scale(1)
      .scaleExtent([1, 8]);

    d3.json('/json/world-110m.json', function (err, world) {
      var countries = topojson.feature(world, world.objects.countries);
      var boundary = topojson.mesh(world, world.objects.countries);

      function fillMap (translatePos) {
        projection.translate(translatePos);

        context.beginPath();
        path(countries);
        context.fillStyle = '#cecfd3';
        context.fill();

        context.beginPath();
        path(boundary);
        context.strokeStyle = '#fff';
        context.stroke();
      }

      function renderWorld () {
        var t = zoom.translate(),
          s = zoom.scale();

        if(t[0] > width+width/2) {
          zoom.translate([t[0]-width, t[1]]);
          t = zoom.translate();
        } else if (t[0] < width/2) {
          zoom.translate([t[0]+width, t[1]]);
          t = zoom.translate();
        }

        context.clearRect(0, 0, width, height);

        context.save();

        fillMap(t);
        fillMap([t[0] > width/2 ? t[0]-width : t[0]+width, t[1]]);

        context.restore();
      }

      canvas.call(zoom.on('zoom', renderWorld));

      renderWorld();

    });

    // this.layer('world', this.base.append('g'), {

    //   dataBind: function (data) {
        
    //   },

    //   insert: function () {
        
    //   },

    //   events: {
        
    //   }
    // });
  },

  transform: function (data) {

    return data;
  }

});