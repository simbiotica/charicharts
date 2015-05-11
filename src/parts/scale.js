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

    'Scale/update': function(options) {
      this._updateScales(options);
      this.trigger('Scale/updated', []);
    }

  }],

  initialize: function() {
    this._status = {
      // Current scale
      scale: {
        x: null,
        y: null,
        y2: null
      },
      scaleUnits: {
        y: null,
        y2: null
      }
    };

    this._dataAvailable = true;

    this._updateScales();
    return {
      scale: this._status.scale,
      scaleUnits: this._status.scaleUnits,
      dataAvailable: this._dataAvailable
    };
  },

  _updateScales: function(options) {
    options = options || {};
    this._setFlattenedData();
    this._status.scale.x = this._updateScale('x', options);
    this._status.scale.y = this._updateScale('y', options);
    if (this._status.scaleUnits.y2) {
      this._status.scale.y2 = this._updateScale('y2', options);
    }
    if (this.opts.xaxis.top.enabled) {
      this._status.scale.x2 = this._updateScale('x2', options);
    }
  },

  /**
   * position = x,x2,y,y2
   */
  _updateScale: function(position, options) {
    var domain, range;
    var opts = this.opts[position.replace(/\d/, '') + 'axis'];

    // Get domain
    if (position === 'x' && this.opts.xaxis.bottom.domain) {
      domain = this.opts.xaxis.bottom.domain;
    } else if (position === 'x2' && this.opts.xaxis.top.domain) {
      domain = this.opts.xaxis.top.domain;
    } else {
      domain = this._getExtent(position, opts.fit, options);
    }

    // Get range
    if (position === 'x' || position === 'x2') {
      range = [0, this.opts.width];
    } else {
      range = [this.opts.height, 0];
    }

    // Get scale
    return this._d3Scales[opts.scale]()
      .domain(domain)
      .range(range);
      // .nice(); // Extends the domain so that it starts and ends on nice round values.
  },

  _getExtent: function(position, fit, options) {
    options = options || {};
    var extent;
    // x axes uses all data
    if (position === 'x' || position === 'x2') {
      var allData = _.flatten(_.values(this._dataFlattened));
      extent = d3.extent(allData, function(d) {
        return d.x;
      });
    // any y axes uses its own data
    } else {
      var unit = this._status.scaleUnits[position];
      extent = d3.extent(this._dataFlattened[unit], function(d) {
        return d.y1 || d.y;
      });
    }

    // Fix to min extent
    var opt = options[position];
    if (opt && opt.extent) {
      var min = opt.min ? d3.min([extent[0], opt.extent[0]]) : opt.extent[0];
      var max = opt.min ? d3.max([extent[1], opt.extent[1]]) : opt.extent[1];
      extent = [min, max];
    }

    // add padding to extent
    var extDiff = extent[1] - extent[0];
    var valDiff = extDiff * 0.05;

    if (extDiff <= 0) {
      valDiff = extent[1] * 0.05;
    }

    if (opt && !opt.min) {return extent;}

    if ((position === 'y' || position === 'y2') && fit) {
      extent[0] = extent[0] - valDiff;
      extent[1] = extent[1] + valDiff;
    }

    // if is fit, return the extent as it is
    if (fit) {
      return extent;
    } else if (extent[0] >= 0) {
      return [0, extent[1]];
    }

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
    var data = {};
    var units = [];

    _.each(this.data, function(d) {
      var values;
      var unit;

      // Single value
      if (d.value) {
        unit = d.unit;
        values = [d.value];
      // More than one values array for the series
      } else if (d.data) {
        unit = d.data[0].unit;
        values = _.flatten(_.pluck(d.data, 'values'));
      // Single values array for the series
      } else if (d.values) {
        unit = d.unit;
        values = d.values;
      // Error warn
      } else {
        console.warn('No present values on series provided.\n_setFlattenedData@scales.js');
      }

      if (!unit) {unit='default';}

      if (values) {
        if (!data[unit]) {
          data[unit] = [];
          // Ordered by order of definition.
          units.push(unit);
        }

        data[unit].push(values);
      }
    });

    var dataFlattened = {};
    _.each(data, function(d,key) {
      dataFlattened[key] = _.flatten(d);
    });

    var firstUnit = units[0];
    var secondUnit = units[1];
    this._status.scaleUnits['y'] = firstUnit;
    this._status.scaleUnits['y2'] = secondUnit;
    this._dataFlattened = dataFlattened;
    this._dataAvailable = !!((dataFlattened[firstUnit] && dataFlattened[firstUnit].length>0) ||
      (dataFlattened[secondUnit] && dataFlattened[secondUnit].length>0));
  }

});
