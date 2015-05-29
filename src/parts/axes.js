var p_axes = PClass.extend({

  deps: [
    'scale'
  ],

  _subscriptions: [{
    /**
     * Update the axes when the scales have changed.
     */
    'Scale/updated': function() {
      if (!this._status) {return;}
      _.each(this._status.axes, this._updateAxis, this);
    }
  }],

  _statusDefaults: {
    axes: {}
  },

  initialize: function() {
    if (!this._$scope.dataAvailable) {return;}
    this._status = _.clone(this._statusDefaults);

    // Render axis
    if (this.opts.yaxis.left.enabled) {
      this._renderLeft();}
    if (this.opts.yaxis.right.enabled || !!this.scale.y2) {
      this._renderRight();}
    if (this.opts.xaxis.top.enabled) {
      this._renderTop();}
    if (this.opts.xaxis.bottom.enabled) {
      this._renderBottom();}

    this._afterAxisChanges();
  },

  _renderTop: function() {
    var model = this._status.axes.top = {};

    model.axis = d3.svg.axis()
      .scale(this.scale.x2)
      .orient('top')
      .tickSize(5)
      .tickFormat(this.opts.xaxis.top.tickFormat ||
        h_getTickFormatDate(this.opts.locale));

    if (this.opts.xaxis.ticks) {
      model.axis.ticks.apply(model, this.opts.xaxis.ticks);
    } else {
      var tickValues = h_getTickValuesFromDate(this.scale.x2.domain(), this.opts.fullWidth);
      model.axis.tickValues(tickValues);
    }

    // Render axis
    model.el = this.$svg.append('g')
        .attr('class', 'xaxis top')
        .attr('transform', 'translate(0,0)')
        .call(model.axis);

    if (this.opts.xaxis.top.tickLines) {
      model.el.selectAll('text')
        .attr('y', 0)
        .attr('x', 6)
        .style('text-anchor', 'start');
    }

    // Append baseline
    model.el.append('rect')
      .attr('class', 'baseline')
      .attr('y', -1)
      .attr('x', -this.opts.margin.left)
      .attr('height', 1)
      .attr('width', this.opts.fullWidth);

    if (this.data.length === 2) {
      // Append top line indicator
      model.el.append('circle')
        .attr('cx', -this.opts.margin.left + 6)
        .attr('cy', -11)
        .attr('r', 4)
        .style('fill', this.data[1].color);

      model.el.append('circle')
        .attr('cx', -this.opts.margin.left + 5)
        .attr('cy', this.opts.height + 12)
        .attr('r', 4)
        .style('fill', this.data[0].color);
    }
  },

  _renderBottom: function() {
    var model = this._status.axes.bottom = {};
    var opts = this.opts.xaxis.bottom;
    var ticks = this.opts.xaxis.ticks;

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.x)
      .orient('bottom')
      .tickSize(this.opts.xaxis.bottom.tickLines ? 7 : 5, 0)
      .tickFormat(this.opts.xaxis.bottom.tickFormat ||
        h_getTickFormatDate(this.opts.locale));

    if (this.opts.xaxis.ticks) {
      model.axis.ticks.apply(model, this.opts.xaxis.ticks);
    } else {
      var tickValues = h_getTickValuesFromDate(this.scale.x.domain(), this.opts.fullWidth);
      model.axis.tickValues(tickValues);
    }

    // Render axis
    model.el = this.$svg.append('g')
        .attr('class', 'xaxis bottom')
        .attr('transform', 'translate(0,' + (this.opts.height + 1) + ')')
        .call(model.axis);

    if (opts.tickLines) {
      model.el.selectAll('text')
        .attr('y', 0)
        .attr('x', 6)
        .style('text-anchor', 'start');
    } else {
      model.el.selectAll('text').attr('y', 9);
    }

    // Append baseline
    model.el.append('rect')
      .attr('class', 'baseline')
      .attr('y', -1)
      .attr('x', -this.opts.margin.left)
      .attr('height', 1)
      .attr('width', this.opts.fullWidth);

    this._renderXLabel('bottom');
  },

  _renderLeft: function() {
    var model = this._status.axes.left = {};
    var tickFormat = this.opts.yaxis.left.tickFormat;
    var ticks = this.opts.yaxis.ticks || [];

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('left')
      .tickSize(-this.opts.width)
      .tickPadding(this.opts.margin.left)
      .tickFormat(tickFormat);
    model.axis.ticks.apply(model.axis, ticks);

    // Render axis
    model.el = this.$svg.append('g')
      .attr('class', 'yaxis left')
      .call(model.axis);

    // Remove last tick if touches the top axis
    if (this.opts.xaxis.top.enabled) {
      try {
        var lastTick = _.last(model.el.selectAll('.tick')[0]);
        var lastTickY = Number(lastTick.attributes.transform.textContent.match(/,(.*)\)$/)[1]);
        if (lastTickY < 20) {
          lastTick.remove();
        }
      } catch (e) {}
    }

    this._renderYLabel('left');
  },

  _renderRight: function() {
    var model = this._status.axes.right = {};
    var tickFormat = this.opts.yaxis.right.tickFormat;
    var ticks = this.opts.yaxis.ticks || [];
    var self = this;

    // Generate axis
    model.axis = d3.svg.axis()
      .scale(this.scale.y)
      .orient('right')
      .tickSize(this.opts.width, 10)
      .tickPadding(0) // defaults to 3
      .tickFormat(function(d) {
        if (self.scale.y2) {
          var px = self.scale.y(d);
          var value = Math.round(self.scale.y2.invert(px));
          value = _.isNaN(value) ? '' : value.toLocaleString();
          return value;
        }
        return tickFormat(d);
      });
    model.axis.ticks.apply(model.axis, ticks);

    // Render axis
    model.el = this.$svg.append('g')
      .attr('class', 'yaxis right')
      .call(model.axis);

    this._renderYLabel('right');
  },

  _renderXLabel: function(orientation) {
    if (!this.opts.xaxis[orientation].label) {return;}
    this.$svg.select('.xaxis.' + orientation).append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(-this.opts.margin.left, 0))
      .attr('y', 16)
      .attr('x', 0)
      .attr('text-anchor', 'start')
      .text(this.opts.xaxis[orientation].label);
  },

  _renderYLabel: function(orientation) {
    var label;
    var scaleUnits = this._$scope.scaleUnits.y;

    if (orientation === 'left') {
      scaleUnits = (scaleUnits === 'default') ? false : scaleUnits;
      label = scaleUnits || this.opts.yaxis[orientation].label;
    } else if (orientation === 'right') {
      label = this._$scope.scaleUnits.y2 || this.opts.yaxis[orientation].label;
    }
    if (!label || label === 'default') {return;}

    this.$svg.select('.yaxis.' + orientation).append('text')
      .attr('class', 'label')
      .attr('transform', h_getTranslate(orientation === 'left' ? -this.opts.margin.left :
        this.opts.width + this.opts.margin.right, this.opts.yaxis.textMarginTop))
      .attr('y', -12)
      .attr('x', 0)
      .attr('text-anchor', orientation === 'left' ? 'start' : 'end')
      .text(label);
  },

  /**
   * Stuff to do when the axes have been
   * rendered or updated.
   */
  _afterAxisChanges: function() {
    // remove domain
    this.$svg.select('.yaxis .domain').remove();
    this.$svg.select('.xaxis .domain').remove();
    this.$svg.select('.yaxis.right .domain').remove();

    this.$svg.selectAll('.yaxis.left .tick text')
      .style('text-anchor', 'start', 'important');

    this.$svg.selectAll('.yaxis.right .tick text')
      .style('text-anchor', 'end', 'important')
      .attr('transform', h_getTranslate(this.opts.margin.right, this.opts.yaxis.textMarginTop));

    if (this.opts.yaxis.textMarginTop) {
      this.$svg.selectAll('.yaxis.left .tick text')
        .attr('transform', h_getTranslate(0, this.opts.yaxis.textMarginTop));
    }

    if (this.opts.xaxis.bottom.tickLines) {
      this.$svg.selectAll('.xaxis.bottom .tick text')
        .attr('transform', h_getTranslate(0,4))
        .attr('y', 0)
        .attr('x', 6)
        .style('text-anchor', 'start');
    } else {
      this.$svg.selectAll('.xaxis.bottom .tick text')
        .attr('y', 9);
    }

    // yaxis full grid
    if (this.opts.yaxis.fullGrid) {
      this.$svg.selectAll('.yaxis line')
        .attr('transform', h_getTranslate(+this.opts.margin.left , 0))
        .attr('x1', -this.opts.margin.left * 2);
    }

    // add zeroline
    this.$svg.selectAll('.yaxis line').each(function(d,i) {
      if (d !== 0) {return;}
      d3.select(this).attr('class', 'zeroline');
    });
  },

  /**
   * Update given axis when the scales changes.
   */
  _updateAxis: function(model, orientation) {
    var scale = (orientation === 'top' || orientation === 'bottom') ? this.scale.x : this.scale.y;
    model.el.call(model.axis.scale(scale));
    this._afterAxisChanges();
  }

});
