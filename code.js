// drawing pixel by pixel using GPU from https://stackoverflow.com/questions/35444202/draw-a-single-pixel-in-webgl-using-gl-points
/**
 * Creates a program, attaches shaders, links the program.
 * @param {WebGLShader[]} shaders. The shaders to attach.
 */
var createGLProgram = (gl, shaders) => {
  var program = gl.createProgram();
  for (var i = 0; i < shaders.length; i += 1) {
    gl.attachShader(program, shaders[i]);
  }
  gl.linkProgram(program);

  // Check the link status
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {

    // Something went wrong with the link
    var lastError = gl.getProgramInfoLog(program);
    window.console.error("Error in program linking: " + lastError);

    gl.deleteProgram(program);
    return null;
  }
  return program;
};

var myCreateShader = (gl, shaderScriptText, shaderType) => {

  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderScriptText);

  // Compile the shader
  gl.compileShader(shader);
  return shader;
};

// Get A WebGL context.window size divided by two and scaled using css
//Start canvas with
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 2;

var gl = canvas.getContext("webgl", {
  antialias: true
})

var vertexShader = myCreateShader(gl,
  `attribute vec2 a_position;

	uniform vec2 u_resolution;

	void main() {
  	// convert the rectangle from pixels to 0.0 to 1.0
		vec2 zeroToOne = a_position / u_resolution;

		// convert from 0 -> 1 to 0 -> 2
		vec2 zeroToTwo = zeroToOne * 2.0;

		// convert from 0 -> 2 to -1 -> +1 (clipspace)
		vec2 clipSpace = zeroToTwo - 1.0;

		// Flip 0,0 from bottom left to conventional 2D top left.
    gl_PointSize = 1.0;
		gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
	}`, gl.VERTEX_SHADER);

var fragmentShader = myCreateShader(gl,
  `precision mediump float;

	uniform vec4 u_color;

	void main() {
  	gl_FragColor = u_color;
	}`, gl.FRAGMENT_SHADER);

var program = createGLProgram(gl, [vertexShader, fragmentShader]);
gl.useProgram(program);

// Store color location.
var colorLocation = gl.getUniformLocation(program, "u_color");

// Look up where the vertex data needs to go.
var positionLocation = gl.getAttribLocation(program, "a_position");

// Set the resolution.
var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

// Create a buffer.
var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.enableVertexAttribArray(positionLocation);

// Send the vertex data to the shader program.
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Set color to black.
gl.uniform4f(colorLocation, 0, 0, 0, 1);

var drawOneBlackPixel = (gl, x, y) => {
  // Fills the buffer with a single point?
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x + 0.5, y + 0.5
  ]), gl.STATIC_DRAW);

  // Draw one point.
  gl.drawArrays(gl.POINTS, 0, 1);
}

var drawArray = (gl, data) => {
  if (data && data.length) {
    // Fills the buffer with a single point?
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    // Draw one point.
    gl.drawArrays(gl.POINTS, 0, data.length / 2);
  }
}
gl.clearColor(0.9, 0.9, 0.9, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
// These tests are supposed to be x,y coordinates from top left.

var sx = canvas.width;
var sy = canvas.height;

//fill world with random -1 and 1
var world = []
for (var x = 0; x < sx; x++) {
  world.push(new Array(sy).fill().map(e => Math.random() > 0.5 ? 1 : -1));
}

//GUI using DAT.gui version in Polymer paper elements
var gui = new PaperGUI();
gui.open();

var SimParams = function() {
  this.message = 'dat.gui';
  this.T = 5
  this.toHeat = f => tempGrad(1);
  this.toCool = f => tempGrad(-1);
  this.radius = 10;
  this.invertDraw = false;
  this.pause = false;
};

var params = new SimParams();
var tController = gui.add(params, 'T', 0.00, 5.00).step(0.01).name('Temperature'); // Mix and match
gui.add(params, 'toCool').name('Cool')
gui.add(params, 'toHeat').name('Heat')
gui.add(params, 'radius', 1, 100).name('Draw size'); // Mix and match
gui.add(params, 'invertDraw').name('Invert draw color'); // Mix and match
var simPause = gui.add(params, 'pause').name('Pause Simulation');


//Automatic Temperature Gradient
var isGradRunning = false;
var tempGrad = (type) => {
  if (!isGradRunning) {
    isGradRunning = true;
    var initT = params.T;
    var timerID = setInterval(timer => {
      tController.sliderEl_.value = ((initT));
      tController.sliderEl_.dispatchEvent(new Event('change'));
      initT += type * 0.1;
      if (initT <= 0.5 || initT >= 5.0) {
        clearInterval(timerID);
        isGradRunning = false;
      }
    }, 200);
  }
}

//var Z = world.map(line => line.reduce((a, b) => a + b)).reduce((a, b) => a + b);


//Mouse and Touch events
var mousedragging = false;
var touchdragging = false;
canvas.addEventListener("mousedown", e => {
  mousedragging = true;
});
canvas.addEventListener("touchstart", e => {
  touchdragging = true;
});
canvas.addEventListener("mouseup", e => {
  mousedragging = false;
});
canvas.addEventListener("touchend", e => {
  touchdragging = false;
});
canvas.addEventListener("touchmove", e => {
  if (touchdragging) {
    drawCircle(e.touches[0].clientX / 2, e.touches[0].clientY / 2);
  }
});
canvas.addEventListener("mousemove", e => {
  if (mousedragging) {
    drawCircle(e.clientX / 2, e.clientY / 2);
  }
});

//Given a position and radius draws circle in the world matrix
var drawCircle = (posX, posY) => {
  var p1, p2, esq, x, y, dir, down, up;
  var p1 = parseInt(posX);
  var p2 = parseInt(posY);
  for (var r = 0; r < params.radius; r++) {
    for (var a = 0; a <= 360; a++) {
      x = parseInt(r * Math.cos(a)) + p1;
      y = parseInt(r * Math.sin(a)) + p2;

      if (x >= sx) {
        x = sx - 1;
      }
      if (y >= sy) {
        y = sy - 1;
      }

      if (x <= 0) {
        x = 0;
      }
      if (y <= 0) {
        y = 0;
      }
      if (!params.invertDraw) {
        world[x][y] = -1;
      } else {
        world[x][y] = 1;
      }
    }
  }
}

//Simulation function
var simulation = f => {
  for (var count = 0; count <= sx * sy / 2; count++) {
    var m = 0;
    var r1 = parseInt(Math.random() * sx);
    var r2 = parseInt(Math.random() * sy);

    var esq = r1 - 1;
    var dir = r1 + 1;
    var down = r2 + 1;
    var up = r2 - 1;

    if (esq < 0) {
      esq = sx - 1;
    }
    if (dir >= sx) {
      dir = 0;
    }
    if (up < 0) {
      up = sy - 1;
    }
    if (down >= sy) {
      down = 0;
    }

    var E = 2 * world[r1][r2] * (world[dir][r2] + world[esq][r2] + world[r1][down] + world[r1][up]);

    if (E <= 0) {
      world[r1][r2] = -world[r1][r2];
    }
    if (E > 0) {
      var p = Math.exp(-E / params.T);
      var r = Math.random();
      if (r <= p) world[r1][r2] = -world[r1][r2];
    }
  }
};

//simulation interval, unless the toggle is false
var simClock = setInterval(simulation, 1);
simPause.onChange(state => {
  if (state) {
    clearInterval(simClock);
  } else {
    simClock = setInterval(simulation, 1);
  }
});


//draw Interval, always so the mouseclick drawing is rendered
setInterval(f => {
  var data = [];
  for (var x = 0; x < sx; x++) {
    for (var y = 0; y < sy; y++) {
      if (world[x][y] === -1) {
        data.push(x + 0.5, y + 0.5);
      }
    }
  }
  drawArray(gl, data)
}, 1);
