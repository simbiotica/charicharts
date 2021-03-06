/**
 * Pie Module
 * ----------
 * Draw a pie into the scope svg with the scope data.
 *
 */
var p_pie = PClass.extend({

  deps: [
  ],

  _subscriptions: [{
  }],

  initialize: function() {
    this._dataAvailable = true;

    var dataSum = d3.sum(this.data, function(d) {
      return d.value >= 0 ? d.value : 0;
    });

    if (dataSum <= 0) {
      this._dataAvailable = false;
      this.opts.onNoData && this.opts.onNoData();
    } else {
      // Pie layout
      this.pie = d3.layout.pie()
        .value(function(d) {
          return d.value >= 0 ? d.value : 0;
        })
        .sort(null);

      // Pie arc
      this.arc = d3.svg.arc()
        .innerRadius(this.opts.radius * this.opts.innerRadius)
        .outerRadius(this.opts.radius);

      // Paths
      this.path = this.$svg.selectAll('path');
      this.update();

      // Set events
      this._setEvents();
    }

    return {
      series: {
        update: _.bind(this.update, this)
      },
      pie: {
        path: this.path,
        arc: this.arc
      },
      dataAvailable: this._dataAvailable
    };
  },

  /**
   * Update the pie.
   */
  update: function() {
    var self = this;
    var data = this.pie(this.data);
    this.path = this.path.data(data);

    this.path.enter().append('path')
      .each(function(d, i) {
        this._current = d; // store the initial values
      })
      .attr('class', 'pie-piece');

    this.path.attr('fill', function(d) {return d.data.color;});
    this.path.exit().remove();

    var n = 0;
    this.path.transition()
      .duration(300)
      .attrTween('d', arcTween)
      .each(function() {++n;})
      .each('end', function() {
        if (!--n) { // when the transitions end
          self.trigger('Pie/updated', []);
        }
      });

    function arcTween(d) {
      var i = d3.interpolate(this._current, d);
      this._current = i(0);
      return function(t) {
        return self.arc(i(t));
      };
    }
  },

  /**
   * Set pie events.
   */
  _setEvents: function() {
    var self = this;

    this.path.on('mouseover', function(d) {
      self.path.exit();
      self.path.style('opacity', self.opts.hoverFade);
      d3.select(this).style('opacity', 1);
      self.trigger('Pie-piece/mouseover', [d]);
    });

    this.$svg.on('mouseleave', function() {
      self.path.style('opacity', 1);
    });
  }

});
