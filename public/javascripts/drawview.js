

var DrawModel, DrawView, retinize, _ref;

this.module = this.module || {};

retinize = function(canvas) {
  var backingStoreRatio, ctx, ratio;
  ctx = canvas.getContext("2d");
  ratio = window.devicePixelRatio || 1;
  backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
  ratio = ratio / backingStoreRatio;
  if (1 !== ratio) {
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};

DrawModel = Backbone.Model.extend({
  defaults: {
    speedMax: 4,
    speedMin: 1,
    multiplier: 500,
    numSamples: 8,
    numTouches: 20,
    variable: true,
    defaultWidth: 5,
    drawAfter: 3,
    penType: 'pen1'
  },
  initialize: function() {
    return this.on('change', function() {
      return this;
    });
  }
});

DrawView = Backbone.View.extend({
  el: '#draw-form',
  context: null,
  canvas: null,
  memcanvas: null,
  memCtx: null,
  touchSpeeds: [],
  initialize: function() {
    this.canvas = $('#mycanvas')[0];
    if (!this.canvas.getContext) {
      return;
    }
    this.canvas = retinize(this.canvas);
    this.context = $('#mycanvas')[0].getContext('2d');
    this.context.strokeStyle = 'rgba(0, 0, 0, 3)';
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.lineWidth = this.model.get('defaultWidth');
    this.memcanvas = $('#mycanvas2')[0];
    this.memcanvas = retinize(this.memcanvas);
    this.memCtx = this.memcanvas.getContext('2d');
    this.memCtx.lineWidth = this.model.get('defaultWidth');
    this.memCtx.lineJoin = 'round';
    this.memCtx.lineCap = 'round';
    this.touchSpeeds = this.initializeTouchSpeeds(this.touchSpeeds);
    this.render();
    if (Modernizr.touch) {
      return this.touchEvents.call(this);
    } else {
      return this.mouseEvents.call(this);
    }
  },
  events: function() {
    return {
      'click #clearLink': 'clearCanvas',
      'change #maxWidth': 'update',
      'change #minWidth': 'update',
      'change #multiplier': 'update',
      'change #samples': 'update',
      'change #touches': 'update',
      'change #drawAfter': 'update',
      'change #defaultWidth': 'update',
      'click #variable': 'update',
      'click #pen1': 'update',
      'click #pen2': 'update',
      'click #pen3': 'update'
    };
  },
  render: function() {
    $('#maxWidth').val(this.model.get('speedMax'));
    $('#minWidth').val(this.model.get('speedMin'));
    $('#samples').val(this.model.get('numSamples'));
    $('#touches').val(this.model.get('numTouches'));
    $('#multiplier').val(this.model.get('multiplier'));
    $('#defaultWidth').val(this.model.get('defaultWidth'));
    $('#drawAfter').val(this.model.get('drawAfter'));
    $('#variable').attr('checked', this.model.get('variable'));
    $('#pen1').attr('checked', this.model.get('penType') === 'pen1');
    $('#pen2').attr('checked', this.model.get('penType') === 'pen2');
    $('#pen3').attr('checked', this.model.get('penType') === 'pen3');
    return this;
  },
  update: function() {
    this.model.set({
      'speedMax': parseInt($('#maxWidth').val())
    });
    this.model.set({
      'speedMin': parseInt($('#minWidth').val())
    });
    this.model.set({
      'numSamples': parseInt($('#samples').val())
    });
    this.model.set({
      'numTouches': parseInt($('#touches').val())
    });
    this.model.set({
      'multiplier': parseInt($('#multiplier').val())
    });
    this.model.set({
      'defaultWidth': parseInt($('#defaultWidth').val())
    });
    this.model.set({
      'variable': $('#variable').is(':checked')
    });
    this.model.set({
      'drawAfter': parseInt($('#drawAfter').val())
    });
    this.model.set({
      'penType': ($("#pen1").is(":checked") ? "pen1" : $("#pen2").is(":checked") ? 'pen2' : 'pen3')
    });
    if ((this.model.get('penType')) === 'pen3') {
      this.model.set({
        'variable': false
      });
    }
    this.context.lineWidth = this.model.get('defaultWidth');
    this.memCtx.lineWidth = this.model.get('defaultWidth');
    this.touchSpeeds = this.initializeTouchSpeeds(this.touchSpeeds);
    return this;
  },
  clearCanvas: function() {
    this.context.clearRect(0, 0, 490, 220);
    return this.memCtx.clearRect(0, 0, 490, 220);
  },
  distance: function(a, b) {
    return Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2));
  },
  initializeTouchSpeeds: function(touchSpeeds) {
    var i, initialValue;
    touchSpeeds = [];
    initialValue = ((this.model.get('speedMax') - this.model.get('speedMin')) * 0.15) + this.model.get('speedMin');
    i = 0;
    while (i < this.model.get('numSamples')) {
      touchSpeeds.push(initialValue);
      i++;
    }
    return touchSpeeds;
  },
  addToTouchSpeeds: function(touchSpeeds, speed) {
    touchSpeeds.push(speed);
    if (touchSpeeds.length > this.model.get('numSamples')) {
      return touchSpeeds.splice(0, 1);
    }
  },
  addToOngoingTouches: function(ongoingTouches, coor) {
    ongoingTouches.push(coor);
    if (ongoingTouches.length > this.model.get('numTouches')) {
      return ongoingTouches.splice(0, 1);
    }
  },
  touchSpeedAverage: function(touchSpeeds) {
    var i, result;
    result = 0;
    i = 0;
    while (i < touchSpeeds.length) {
      result += touchSpeeds[i];
      i++;
    }
    return result / touchSpeeds.length;
  },
  clamp: function(value, max, min) {
    var result;
    result = value;
    result = (value / ((2000 - 0) / (this.model.get('speedMax') - this.model.get('speedMin')))) + this.model.get('speedMin');
    if (result > max) {
      result = max;
    } else if (result < min) {
      result = min;
    }
    return result;
  },
  drawPoints: function(points) {
    var b, c, clampedSpeed, d, i, initialPosition, interval, nextPosition, pointDistance, speed;
    if (points.length < 4) {
      b = points[0];
      this.context.beginPath();
      this.context.arc(b.X, b.Y, this.context.lineWidth / 2, 0, Math.PI * 2, !0);
      this.context.closePath();
      this.context.fill();
      return;
    }
    this.context.beginPath();
    this.context.moveTo(points[0].X, points[0].Y);
    i = 1;
    while (i < points.length - 2) {
      initialPosition = points[i];
      nextPosition = points[i + 1];
      c = (initialPosition.X + nextPosition.X) / 2;
      d = (initialPosition.Y + nextPosition.Y) / 2;
      if (this.model.get('variable')) {
        if (!(initialPosition.width != null)) {
          interval = Math.floor(nextPosition.time.getTime() - initialPosition.time.getTime());
          pointDistance = this.distance(nextPosition, initialPosition);
          speed = pointDistance / interval;
          if (this.model.get('penType') === 'pen1') {
            clampedSpeed = this.clamp(this.model.get('multiplier') / speed, this.model.get('speedMax'), this.model.get('speedMin'));
          } else {
            clampedSpeed = this.clamp(this.model.get('multiplier') * speed, this.model.get('speedMax'), this.model.get('speedMin'));
          }
          this.addToTouchSpeeds(this.touchSpeeds, clampedSpeed);
          this.context.lineWidth = this.touchSpeedAverage(this.touchSpeeds);
          if (!(points[i].width != null)) {
            points[i].width = this.context.lineWidth;
          }
        } else {
          this.context.lineWidth = initialPosition.width;
        }
      }
      this.context.quadraticCurveTo(initialPosition.X, initialPosition.Y, c, d);
      if (this.model.get('variable') && (i % this.model.get('drawAfter')) === 0) {
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(c, d);
      }
      i++;
    }
    this.context.quadraticCurveTo(initialPosition.X, initialPosition.Y, nextPosition.X, nextPosition.Y);
    return this.context.stroke();
  },
  touchEvents: function() {
    var draw, drawer, ongoingTouches,
      _this = this;
    ongoingTouches = [];
    draw = function(event) {
      var coors, obj;
      coors = {
        X: event.changedTouches[0].pageX,
        Y: event.changedTouches[0].pageY,
        time: new Date()
      };
      obj = this;
      if (obj.offsetParent) {
        while (true) {
          coors.X -= obj.offsetLeft;
          coors.Y -= obj.offsetTop;
          if ((obj = obj.offsetParent) == null) {
            break;
          }
        }
      }
      return drawer[event.type](coors);
    };
    drawer = {
      isDrawing: false,
      touchstart: function(coors) {
        ongoingTouches.push(coors);
        return _this.isDrawing = true;
      },
      touchmove: function(coors) {
        if (_this.isDrawing) {
          _this.context.clearRect(0, 0, 490, 220);
          _this.context.drawImage(_this.memcanvas, 0, 0, 490, 220);
          ongoingTouches.push(coors);
          return _this.drawPoints(ongoingTouches);
        }
      },
      touchend: function(coors) {
        if (_this.isDrawing) {
          _this.memCtx.clearRect(0, 0, 490, 220);
          _this.memCtx.drawImage(_this.canvas, 0, 0, 490, 220);
          ongoingTouches = [];
          _this.touchSpeeds = _this.initializeTouchSpeeds(_this.touchSpeeds);
          return _this.isDrawing = false;
        }
      }
    };
    this.canvas.addEventListener("touchstart", (function(event) {
      return draw.call(this, event);
    }), false);
    this.canvas.addEventListener("touchmove", draw, false);
    this.canvas.addEventListener("touchend", draw, false);
    return this.canvas.addEventListener("touchmove", (function(event) {
      return event.preventDefault();
    }), false);
  },
  mouseEvents: function() {
    var drawLine, finishDrawing, getPosition, ongoingTouches,
      _this = this;
    ongoingTouches = [];
    getPosition = function(mouseEvent, sigCanvas) {
      var x, y;
      x = void 0;
      y = void 0;
      if (mouseEvent.pageX !== 'undefined' && mouseEvent.pageY !== 'undefined') {
        x = mouseEvent.pageX;
        y = mouseEvent.pageY;
      } else {
        x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      return {
        X: x - sigCanvas.offsetLeft,
        Y: y - sigCanvas.offsetTop,
        time: new Date()
      };
    };
    drawLine = function(mouseEvent) {
      var position;
      this.context.clearRect(0, 0, 490, 220);
      this.context.drawImage(this.memcanvas, 0, 0, 490, 220);
      position = getPosition(mouseEvent, this.canvas);
      ongoingTouches.push(position);
      return this.drawPoints.call(this, ongoingTouches);
    };
    finishDrawing = function(mouseEvent) {
      this.memCtx.clearRect(0, 0, 490, 220);
      this.memCtx.drawImage(this.canvas, 0, 0, 490, 220);
      ongoingTouches = [];
      this.touchSpeeds = this.initializeTouchSpeeds(this.touchSpeeds);
      return $(document).unbind("mousemove").unbind("mouseup").unbind("mouseout");
    };
    return $("#mycanvas").mousedown(function(mouseEvent) {
      var position;
      position = getPosition(mouseEvent, _this.canvas);
      ongoingTouches.push(position);
      $(document).mousemove(function(mouseEvent) {
        drawLine.call(_this, mouseEvent);
        return false;
      }).mouseup(function(mouseEvent) {
        finishDrawing.call(_this, mouseEvent);
        return false;
      });
      return false;
    });
  }
});
