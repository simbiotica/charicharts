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

/**
 * Get diff ms from a date extent.
 *
 * @param  {Array}   extent Date extent array
 * @return {Integer} Returns difference in millisecons
 */
function h_getDateExtentDiff(extent) {
  return extent[1].getTime() - extent[0].getTime();
}

function h_getLocale(locale) {
  return ({
    'en': {
      'decimal': '.',
      'thousands': ',',
      'grouping': [3],
      'currency': ['$', ''],
      'dateTime': '%a %b %e %X %Y',
      'date': '%m/%d/%Y',
      'time': '%H:%M:%S',
      'periods': ['AM', 'PM'],
      'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      'nodata': ['No data available']
    },
    'es': {
      'decimal': ',',
      'thousands': '.',
      'grouping': [3],
      'currency': ['$', ''],
      'dateTime': '%a %b %e %X %Y',
      'date': '%m/%d/%Y',
      'time': '%H:%M:%S',
      'periods': ['AM', 'PM'],
      'days': ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      'shortDays': ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      'months': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      'shortMonths': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      'nodata': ['No hay datos disponibles']
    }
  })[locale || 'en'];
}

function h_getTickValuesFromDate(domain, graphWidth) {
  var start = domain[0].getTime();
  var end = domain[1].getTime();
  var diff = end - start;
  var minStepSize = 90;
  var numValues = Math.ceil(graphWidth/minStepSize)+1;
  var stepIntervalMinutes = (end - start)/numValues/1000/60;
  var range;
  var stepInterval;

  // 10 minutes
  if (stepIntervalMinutes <= 10) {range = 'minutes';stepInterval = 10;}
  // 30 minutes
  else if (stepIntervalMinutes <= 30) {range = 'minutes';stepInterval = 30;}
  // 1 hours
  else if (stepIntervalMinutes <= 60) {range = 'hours';stepInterval = 1;}
  // 2 hours
  else if (stepIntervalMinutes <= 2*60) {range = 'hours';stepInterval = 2;}
  // 4 hours
  else if (stepIntervalMinutes <= 4*60) {range = 'hours';stepInterval = 4;}
  // 6 hours
  else if (stepIntervalMinutes <= 6*60) {range = 'hours';stepInterval = 6;}
  // 12 hours
  else if (stepIntervalMinutes <= 12*60) {range = 'hours';stepInterval = 12;}
  // 1 day
  else if (stepIntervalMinutes <= 24*60) {range = 'days';stepInterval = 1;}
  // 2 day
  else if (stepIntervalMinutes <= 2*24*60) {range = 'days';stepInterval = 2;}
  // 4 day
  else if (stepIntervalMinutes <= 4*24*60) {range = 'days';stepInterval = 4;}
  // 1 semana
  else if (stepIntervalMinutes <= 7*24*60) {range = 'weeks';stepInterval = 1;}
  // 2 semanas
  else if (stepIntervalMinutes <= 2*7*24*60) {range = 'weeks';stepInterval = 2;}
  // 1 mes
  else if (stepIntervalMinutes <= (365/12)*24*60) {range = 'months';stepInterval = 1;}
  // 2 mes
  else if (stepIntervalMinutes <= (365/12)*2*24*60) {range = 'months';stepInterval = 2;}
  // 3 mes
  else if (stepIntervalMinutes <= (365/12)*3*24*60) {range = 'months';stepInterval = 3;}
  // 4 mes
  else if (stepIntervalMinutes <= (365/12)*4*24*60) {range = 'months';stepInterval = 4;}
  // 6 mes
  else if (stepIntervalMinutes <= (365/12)*6*24*60) {range = 'months';stepInterval = 6;}
  // years
  else {range = 'years';stepInterval = 1;}

  var tickValues = [];
  var from = moment(start).startOf(range);
  var t = from.toDate().getTime();
  while (t <= end) {
    if (t >= start && tickValues.indexOf(t) === -1) {
      tickValues.push(t);
    }
    from.add(stepInterval, range);
    t = from.toDate().getTime();
  }

  tickValues = _.map(tickValues, function(a) {return new Date(a);});
  return tickValues;
}

function h_getTickFormatDate(locale) {
  var localeFormatter = d3.locale(h_getLocale(locale));
  // The first predicate function that returns true will
  // determine how the specified date is formatted.
  // For more info in time formatting directives go to:
  // https://github.com/mbostock/d3/wiki/Time-Formatting
  var customTimeformats = [
    // milliseconds for all other times, such as ".012"
    ['.%L', function(d) { return d.getMilliseconds(); }],
    // for second boundaries, such as ":45"
    [':%S', function(d) { return d.getSeconds(); }],
    // for minute boundaries, such as "01:23"
    ['%H:%M', function(d) { return d.getMinutes(); }],
    // for hour boundaries, such as "01"
    ['%H', function(d) { return d.getHours(); }],
    // for day boundaries, such as "Mon 7"
    ['%a %d', function(d) { return d.getDay() && d.getDate() !== 1; }],
    // for week boundaries, such as "Feb 06"
    ['%b %d', function(d) { return d.getDate() !== 1; }],
    // for month boundaries, such as "February"
    ['%B', function(d) { return d.getMonth(); }],
    // for year boundaries, such as "2011".
    ['%Y', function() { return true; }]
  ];
  var tickFormat = localeFormatter.timeFormat.multi(customTimeformats);
  return tickFormat;
}
