Charicharts.Pie = function pie(options) {
  this._options = h_parseOptions(_.extend({}, Charicharts.Pie.defaults, options));
  _.extend(this, Charicharts.Events(this));
  this.init();
  return this;
};

/**
 * Generate a pie by setting all it parts.
 */
Charicharts.Pie.prototype.init = function() {
  var opts = this._options;
  var radius = Math.min(opts.fullWidth, opts.fullHeight) / 2;

  var svg = d3.select(opts.target)
    .append('svg')
      .attr('width', opts.fullWidth)
      .attr('height', opts.fullHeight)
    .append('g')
      .attr('class', SVG_GROUP_CLASS)
      .attr('transform', h_getTranslate(opts.fullWidth/2, opts.fullHeight/2));

  svg.append('svg:circle')
    .attr('class', 'outer-circle')
    .attr('fill', 'transparent')
    .attr('cx', 0)
    .attr('cy', 0)
    .attr('r', radius);

  var pieLayout = d3.layout.pie()
    .sort(null)
    .value(function(d) {return d.value;});

  var arc = d3.svg.arc()
    .innerRadius((radius * 0.90) - ((radius * 0.90) * (opts.innerRadius)))
    .outerRadius(radius * 0.90);

  svg.selectAll('path')
      .data(pieLayout(opts.data))
      .enter()
    .append('path')
    .attr('fill', _.bind(function(d) {
      return d.data.color;
    }, this))
    .attr('d', arc);
};

/**
 * Defaults pie options as static object.
 * @type {Object}
 */
Charicharts.Pie.defaults = {
  innerRadius: 0.22,
  margin: '0,0,0,0'
};