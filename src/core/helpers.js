/**
 * Get translate attribute from supplied width/height.
 * 
 * @param  {Integer} width
 * @param  {Integer} height
 */
function h_getTranslate(width, height) {
  return 'translate(' + [width, height] + ')';
}

function h_getCentroid(selection) {
  // get the DOM element from a D3 selection
  // you could also use "this" inside .each()
  var element = selection.node(),
      // use the native SVG interface to get the bounding box
      bbox = element.getBBox();
  var centroid = [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
  // return the center of the bounding box
  return centroid;
}

function h_getAngle(x, y) {
  var angle, referenceAngle;
  if (x === 0 || y === 0) {return;}
  referenceAngle = Math.atan(y/x);
  referenceAngle += (referenceAngle < 0) ? Math.PI/2 : 0;

  if (x >= 0 && y >= 0) {
    angle = referenceAngle;
  } else if (x <= 0 && y >= 0) {
    angle = referenceAngle + (Math.PI/2);
  } else if (x <= 0 && y <= 0) {
    angle = referenceAngle + Math.PI;
  } else if (x >= 0 && y <= 0) {
    angle = referenceAngle + 3*(Math.PI/2);
  } else {
    return;
  }

  return angle;
}

// Method that loadmodules and set the $scope.
function h_loadModules(modules) {
  var self = this;

  // Set $scope
  this.$scope = {};
  this.$scope.opts = this._opts;
  this.$scope.data = this._data;
  _.extend(this.$scope, p_events());

  this.partsInstances = {};

  // Generate injector caller
  var caller = generateInjector(this.$scope);

  // Load modules
  _.each(modules, function(Module) {
    self.partsInstances = new Module(self.$scope);
    _.extend(self.$scope, self.partsInstances.getScopeParams());
  });

  console.log(this.$scope);
}