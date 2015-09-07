d3.chart('SolarTerminatorChart', {

  initialize: function () {
    var _this = this;

    this.width = 700;
    this.height = 500;

    this.canvas = this.base.append('canvas')
      .attr('width', this.width)
      .attr('height', this.height);

    var canvasNode = this.canvas.node();

    this.context = canvasNode.getContext('2d');
    this.context.lineWidth = 0.5;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';

    this.svg = this.base.append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    var initTranslate = [0, -100];

    // map generation commande : 
    // topojson -q 1e5 --projection='width = 1080, height = 720, d3.geo.equirectangular().translate([width/2, height/2]).scale((width) / 2 / Math.PI)' countries=ne_50m_admin_0_countries.shp -o world.json
    
    // map.json values
    var map = {width: 1080, height: 720};

    // var translate, scale, area; // variables for zoom
    this.scale; this.area;

    this.zoom = d3.behavior.zoom()
      .translate(initTranslate)
      .scale(1)
      .scaleExtent([1, 8]);


    this.svg.call(this.zoom.on('zoom', function () {
      var zoomTranslate = _this.zoom.translate();

      if(zoomTranslate[0] > map.width*chart.scale) {
        _this.zoom.translate([zoomTranslate[0]-map.width, zoomTranslate[1]]);
      } else if (zoomTranslate[0] < -map.width*chart.scale) {
        _this.zoom.translate([zoomTranslate[0]+map.width, zoomTranslate[1]]);
      }
    }));

    this.renderWorld(map);
    this.renderSolarTerminator(map, initTranslate);

  },

  renderWorld: function (map) {
    var chart = this,
      mapWidth = map.width;

    var clip = d3.geo.clipExtent();

    function MapedPath () {
      var _this = this;

      this.translate = [0, 0]; // [x, Y]

      var simplify = d3.geo.transform({
        point: function (x, y, z) {
          if(z >= chart.area) {
            this.stream.point(x * chart.scale + _this.translate[0], y * chart.scale + _this.translate[1]);
          }
        }
      });

      this.path = d3.geo.path()
        .projection({
          stream: function (s) {
            return simplify.stream(clip.stream(s));
          }
        })
        .context(chart.context);
    }

    function createMapPath (land, boundary) {
      var mapedPath = new MapedPath();

      return function (translatePos) {
          mapedPath.translate = translatePos;

          chart.context.beginPath();
          mapedPath.path(land);
          chart.context.fillStyle = '#cecfd3';
          chart.context.fill();

          chart.context.beginPath();
          mapedPath.path(boundary);
          chart.context.strokeStyle = '#fff';
          chart.context.stroke();
      }
    }

    d3.json('/charts/json/world.json', function (err, world) {
      if(err) throw err;

      topojson.presimplify(world);

      var land = topojson.feature(world, world.objects.countries);
      var boundary = topojson.mesh(world, world.objects.countries, function(a, b) {
        return a !== b;
      });

      var maps = [createMapPath(land, boundary, 1), createMapPath(land, boundary, 2)];

      function drawWorld () {
        var zoomTranslate = chart.zoom.translate();
        chart.scale = chart.zoom.scale();
        chart.area = 1/chart.scale/chart.scale;

        zoomTranslate = chart.zoom.translate();

        chart.context.clearRect(0, 0, chart.width, chart.height);

        chart.context.save();

        maps[0](zoomTranslate);

        if(zoomTranslate[0] > 0) {
          maps[1]([(zoomTranslate[0]-mapWidth*chart.scale), zoomTranslate[1]]);
        } else {
          maps[1]([(zoomTranslate[0]+mapWidth*chart.scale), zoomTranslate[1]]);
        }

        chart.context.restore();
      }

      chart.svg.call(chart.zoom.on('zoom.world', drawWorld));

      drawWorld();
    });
  },

  renderSolarTerminator: function (map, translate) {
    var chart = this;

    var initTranslate = [map.width/2+translate[0], (map.height/2)+translate[1]],
      initScale = map.width/2/Math.PI;

    var projection = d3.geo.equirectangular()
      .translate(initTranslate)
      .scale(initScale);

    var path = d3.geo.path()
      .projection(projection);

    var circle = d3.geo.circle().angle(90);

    function nigthPath () {
      return chart.svg
        .append('path').attr('class', 'night')
    }

    var nights = [nigthPath(), nigthPath()];

    var date = new Date();

    function drawNight () {
      var zoomTranslate = chart.zoom.translate(),
        zoomScale = chart.zoom.scale();

      projection.scale(initScale*zoomScale);

      for (var i = nights.length - 1; i >= 0; i--) {
        var night = nights[i];

        if(zoomTranslate[0] > 0) {
          projection.translate([
            (zoomTranslate[0]+ (map.width/2)*zoomScale) - map.width*i*zoomScale,
            (zoomTranslate[1] + (map.height/2)*zoomScale)
          ])
        } else {
          projection.translate([
            (zoomTranslate[0]+ (map.width/2)*zoomScale) + map.width*i*zoomScale,
            (zoomTranslate[1] + (map.height/2)*zoomScale)
          ])
        }

        night.datum(circle.origin(antipode(solarPosition(date))))
          .attr('d', path);
      };
    }

    drawNight();

    setInterval(function () {
      date = new Date();
      drawNight()
    }, 1000);

    chart.zoom.on('zoom.night', drawNight);
  },

  transform: function (data) {

    return data;
  }

});