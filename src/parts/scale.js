/**
 * Scale Module
 * ------------
 * Set X/Y scales from the given data.
 *
 */
var p_scale = PClass.extend({

  deps: [
  ],

  _d3Scales: {
    'time': d3.time.scale.utc,
    'ordinal': d3.scale.ordinal,
    'linear': d3.scale.linear
  },

  _subscriptions: [{
    /**
     * Triggered when the serie gets updated with new data.
     * TODO serie/updated should be the message
     */
    'Serie/update': function() {
      this._updateScales();
      this.trigger('Scale/updated', []);
    },

    'Scale/update': function(opt_minExtent) {
      this._updateScales(opt_minExtent);
      this.trigger('Scale/updated', []);
    }

  }],

  initialize: function() {
    this._status = {
      // Current scale
      scale: {
        x: null,
        y: null
      }
    };

    this._updateScales();
    return {
      scale: this._status.scale
    };
  },

  _updateScales: function(opt_minExtent) {
    opt_minExtent = opt_minExtent || {};
    this._setFlattenedData();
    this._status.scale.x = this._updateScale('x', opt_minExtent.x);
    this._status.scale.y = this._updateScale('y', opt_minExtent.y);
  },

  _updateScale: function(position, opt_minExtent) {
    var opts = this.opts[position + 'axis'],
        domain = this._getExtent(position, opts.fit, opt_minExtent),
        range = position === 'x' ? [0, this.opts.width] : [this.opts.height, 0];

    return this._d3Scales[opts.scale]()
      .domain(domain)
      .range(range);
      // .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getExtent: function(position, fit, opt_minExtent) {
    var extent = d3.extent(this._dataFlattened, function(d) {
      return d[position];
    });


    // Fix to min extent
    if (opt_minExtent) {
      var min = d3.min([extent[0], opt_minExtent[0]]),
          max = d3.max([extent[1], opt_minExtent[1]]);

      extent = [min, max];
    }

    if (fit) {return extent;}

    // Positive scale
    if (extent[0] >= 0) {
      return [0, extent[1]];
    }

    // Negative-Positive scale
    // In this case min an max are the same values.
    var absX = Math.abs(extent[0]);
    var absY = Math.abs(extent[1]);
    var val = (absX > absY) ? absX : absY;
    return [-val, val];
  },

  /**
   * Get this.data flattened of all series.
   * Handy when we need to get the extent.
   */
  _setFlattenedData: function() {
    this._dataFlattened = _.flatten(_.map(this.data, function(d) {
      // Single value
      if (d.value) {
        return [d.value];
      // More than one values array for the series
      } else if (d.data) {
        return _.flatten(_.pluck(d.data, 'values'));
      // Single values array for the series
      } else if (d.values) {
        return d.values;
      // Error warn
      } else {
        console.warn('No present values on series provided.\n_setFlattenedData@scales.js');
      }
    }));

    // No data message
    if (!this._dataFlattened.length) {
      this.$svg.append('text')
        .attr('text-achor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('x', '40%')
        .attr('y', '40%')
        .attr('font-size', '18px')
        .text(h_getLocale(this.opts.locale)['nodata']);
    }
  }

});