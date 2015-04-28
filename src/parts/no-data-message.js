var p_no_data_message = PClass.extend({

  deps: [
  ],

  initialize: function() {
    if (this._$scope.dataAvailable) {return;}
    this.render();
    return {};
  },

  /**
   * Render no data message text inside a rectangle.
   */
  render: function() {
    this.$svg.node().parentNode.style.background = '#F7F7F7';
    this._renderGrid();

    var width = h_getLocale(this.opts.locale)['nodata'][0].length * 12;
    var height = 60;
    var translate;

    if (this._$scope.pie) {
      translate = h_getTranslate(
        -(this.opts.fullWidth/2) + (this.opts.fullWidth) / 2,
        -(this.opts.fullHeight/2) + (this.opts.fullHeight) / 2
      );
    } else {
      translate = h_getTranslate(
        -this.opts.margin.left + (this.opts.fullWidth) / 2,
        -this.opts.margin.top + (this.opts.fullHeight) / 2
      );
    }

    var msg = this.$svg.append('g')
      .attr('transform', translate);

    msg.append('rect')
      .attr('x', -width / 2)
      .attr('y', -height/2)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#F7F7F7')
      .style('shape-rendering', 'crispEdges')
      .style('stroke', '#cf4634')
      .style('stroke-width', 1);

    msg.append('text')
      .attr('y', 6)
      .attr('font-size', 13)
      .style('font-weight', 600)
      .style('text-anchor', 'middle')
      .style('fill', '#cf4634')
      .text(h_getLocale(this.opts.locale)['nodata'][0].toUpperCase());


    // Call onNoData callback if specified
    this.opts.onNoData && this.opts.onNoData();
  },

  /**
   * Renders grid on the background.
   */
  _renderGrid: function() {
    var ticks = 5;
    var separation = this.opts.fullHeight / (ticks-1) - 1/ticks;
    var translate;

    if (this._$scope.pie) {
      translate = h_getTranslate(-(this.opts.fullWidth/2), -(this.opts.fullHeight/2));
    } else {
      translate = h_getTranslate(-this.opts.margin.left, -this.opts.margin.top);
    }

    this.grid = this.$svg.append('g')
      .attr('transform', translate)
      .attr('class', 'bargrid');

    for (var i = 1; i < ticks; i++) {
      this.grid.append('line')
        .attr('x1', 0)
        .attr('x2', this.opts.fullWidth)
        .attr('y1', separation*i)
        .attr('y2', separation*i)
        .style('shape-rendering', 'crispEdges')
        .attr('stroke', '#e6e6e6');
    }
  },


});
