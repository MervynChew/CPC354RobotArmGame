/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vColor;
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;

// Variables referencing HTML elements
// theta = [base y-rotation, upper arm z-rotation, lower arm z-rotation]
const BASE_BODY = 0;
const UPPER_ARM = 1;
const LOWER_ARM = 2;
const BASE_HEIGHT = 2.0;
const BASE_WIDTH = 5.0;
const UARM_HEIGHT = 4.0;
const UARM_WIDTH = 0.5;
const LARM_HEIGHT = 4.0;
const LARM_WIDTH = 0.5;
var scaleBaseBody, scaleUpperArm, scaleLowerArm;
var instanceMatrixBase, instanceMatrixUArm, instanceMatrixLArm;
var baseBodySlider, upperArmSlider, lowerArmSlider;
var baseBodyText, upperArmText, lowerArmText;
var theta = [0, 0, 0, 0, 0, 0, 0],
  points = [],
  colors = [];

// Here is add de
const INNER_UPPER_GRIPPER = 3;
const OUTER_UPPER_GRIPPER = 4;
const INNER_BOTTOM_GRIPPER = 5;
const OUTER_BOTTOM_GRIPPER = 6;
const INNERUPPER_GRIP_HEIGHT = 1.0;
const INNERUPPER_GRIP_WIDTH = 0.3;
const OUTERUPPER_GRIP_HEIGHT = 1.0;
const OUTERUPPER_GRIP_WIDTH = 0.3;
const INNERBOTTOM_GRIP_HEIGHT = 1.0;
const INNERBOTTOM_GRIP_WIDTH = 0.3;
const OUTERBOTTOM_GRIP_HEIGHT = 1.0;
const OUTERBOTTOM_GRIP_WIDTH = 0.3;
var scaleInnerUpperGrip,
  scaleOuterUpperGrip,
  scaleInnerBottomGrip,
  scaleOuterBottomGrip;
var tempModelViewMatrix;
var innerUpperSlider,
  innerUpperText,
  outerUpperSlider,
  outerUpperText,
  innerBottomSlider,
  innerBottomText,
  outerBottomSlider,
  outerBottomText,
  innerGripSlider,
  innerGripText,
  outerGripSlider,
  outerGripText;

var zoomObject = 1.0;

var viewRotationX = 0;
var viewRotationY = 0;
var dragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

var cubeLength = 0;

var isBallLoc, colColorLoc;

var robotPosX = 0.0;

var wristMatrix = mat4();

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

// Execute the init() function when the web page has fully loaded
window.onload = function init() {
  // Primitive (geometric shape) initialization
  var cube = colorCube();
  points = cube.Point;
  colors = cube.Color;

  cubeLength = cube.Point.length;

  var ball = sphere(6);
  points = points.concat(ball.Point);
  colors = colors.concat(ball.Color);

  sphereStart = cubeLength;
  sphereCount = ball.Point.length;

  // WebGL setups
  getUIElement();
  controller();
  configWebGL();
  render();
};

function controller() {
  canvas = document.getElementById("gl-canvas");
  canvas.onmousedown = mousedown;
  canvas.onmouseup = mouseup;
  canvas.onmousemove = mousemove;
}

function mousedown(event) {
  dragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function mouseup() {
  dragging = false;
}

function mousemove(event) {
  var x = event.clientX;
  var y = event.clientY;
  if (dragging) {
    // The rotation speed factor
    // dx and dy here are how for in the x or y direction the mouse moved
    var factor = 100 / canvas.height;
    var dx = factor * (x - lastMouseX);
    var dy = factor * (y - lastMouseY);
    viewRotationX += dy;
    viewRotationY += dx;

    lastMouseX = x;
    lastMouseY = y;

    draw();
  }
}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement() {
  canvas = document.getElementById("gl-canvas");
  const el = document.getElementById("main-container");

  baseBodySlider = document.getElementById("base-slider");
  baseBodyText = document.getElementById("base-text");
  upperArmSlider = document.getElementById("uarm-slider");
  upperArmText = document.getElementById("uarm-text");
  lowerArmSlider = document.getElementById("larm-slider");
  lowerArmText = document.getElementById("larm-text");

  // Here i add de
  canvas = document.getElementById("gl-canvas");
  const container = document.getElementById("main-container");

  const robotX = document.getElementById("robot-x");

  const robotXText = document.getElementById("robot-x-text");

  baseBodySlider.oninput = function (event) {
    theta[BASE_BODY] = event.target.value;
    baseBodyText.innerHTML = theta[BASE_BODY];
    draw();
  };

  upperArmSlider.oninput = function (event) {
    theta[UPPER_ARM] = event.target.value;
    upperArmText.innerHTML = theta[UPPER_ARM];
    draw();
  };

  lowerArmSlider.oninput = function (event) {
    theta[LOWER_ARM] = event.target.value;
    lowerArmText.innerHTML = theta[LOWER_ARM];
    draw();
  };

  innerGripSlider = document.getElementById("innerGrip-slider");
  innerGripText = document.getElementById("innerGrip-text");
  outerGripSlider = document.getElementById("outerGrip-slider");
  outerGripText = document.getElementById("outerGrip-text");

  // innerGripSlider.onchange = function (event) {
  //   theta[INNER_UPPER_GRIPPER] = event.target.value;
  //   theta[INNER_BOTTOM_GRIPPER] = -event.target.value;
  //   innerGripText.innerText = theta[INNER_UPPER_GRIPPER];
  //   draw();
  // };

  innerGripSlider.oninput = function (event) {
    let requestedTheta = event.target.value;
    
    // 1. Peek into the future: If we moved to this theta, would we overlap?
    if (checkGripCenterCollision()) {
        // 2. If it hits, don't update the theta (or clamp it to the contact point)
        console.log("Physical Limit Reached!");
        return; 
    }

    theta[INNER_UPPER_GRIPPER] = requestedTheta;
    theta[INNER_BOTTOM_GRIPPER] = -requestedTheta;
    innerGripText.innerText = theta[INNER_UPPER_GRIPPER];
    draw();
};

  outerGripSlider.oninput = function (event) {
    theta[OUTER_UPPER_GRIPPER] = -event.target.value;
    theta[OUTER_BOTTOM_GRIPPER] = event.target.value;
    outerGripText.innerText = theta[OUTER_UPPER_GRIPPER];
    draw();
  };

  robotX.oninput = function (event) {
    // Convert the string from the slider into a real number
    robotPosX = parseFloat(event.target.value); 

    robotXText.innerHTML = robotPosX;
    
    // Check the console (F12) to see if the number is correct
    console.log("New Robot X:", robotPosX); 
    
    draw(); 
};

  // 2. We use addEventListener to set the 'passive' flag to false
  window.addEventListener(
    "wheel",
    function (event) {
      // STOP the page from moving up and down
      event.preventDefault();

      // 3. Calculate the new zoom level
      // (0.001 is much smoother for trackpads)
      zoomObject += event.deltaY * -0.001;

      // 4. Limit the zoom (don't let it go below 0.1 or above 5)
      zoomObject = Math.min(Math.max(0.1, zoomObject), 5.0);

      render();
    },
    { passive: false }
  ); // This is the most important part!
}

// Configure WebGL Settings
function configWebGL() {
  // Initialize the WebGL context
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL isn't available");
  }

  // Set the viewport and clear the color
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  // Compile the vertex and fragment shaders and link to WebGL
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Create buffers and link them to the corresponding attribute variables in vertex and fragment shaders
  // Buffer for positions
  pBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Buffer for colors
  colBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // Get the location of the uniform variables within a compiled shader program
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  // ADD THESE TWO:
  isBallLoc = gl.getUniformLocation(program, "isBall");
  colColorLoc = gl.getUniformLocation(program, "collisionColor");
}

// Render the graphics for viewing
function render() {
  // Clear the color buffer and the depth buffer before rendering a new frame
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Pass the projection matrix from JavaScript to the GPU for use in shader
  // ortho(left, right, bottom, top, near, far)

  // If zoomObject = 0.5, we see from -32 to 32 (Zoomed Out)
  let left = -16 / zoomObject;
  let right = 16 / zoomObject;
  let bottom = -9 / zoomObject;
  let top = 9 / zoomObject;

  projectionMatrix = ortho(left, right, bottom, top, -10, 10);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  // projectionMatrix = ortho(-16, 16, -9, 9, -10, 10);
  // gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  // Set the instance matrix for each figure part
  scaleBaseBody = scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
  scaleUpperArm = scale(UARM_WIDTH, UARM_HEIGHT, UARM_WIDTH);
  scaleLowerArm = scale(LARM_WIDTH, LARM_HEIGHT, LARM_WIDTH);
  scaleInnerUpperGrip = scale(
    INNERUPPER_GRIP_WIDTH,
    INNERUPPER_GRIP_HEIGHT,
    INNERUPPER_GRIP_WIDTH
  );
  scaleOuterUpperGrip = scale(
    OUTERUPPER_GRIP_WIDTH,
    OUTERUPPER_GRIP_HEIGHT,
    OUTERUPPER_GRIP_WIDTH
  );
  scaleInnerBottomGrip = scale(
    INNERBOTTOM_GRIP_WIDTH,
    INNERBOTTOM_GRIP_HEIGHT,
    INNERBOTTOM_GRIP_WIDTH
  );
  scaleOuterBottomGrip = scale(
    OUTERBOTTOM_GRIP_WIDTH,
    OUTERBOTTOM_GRIP_HEIGHT,
    OUTERBOTTOM_GRIP_WIDTH
  );
  instanceMatrixBase = mult(
    translate(0.0, 0.5 * BASE_HEIGHT, 0.0),
    scaleBaseBody
  );
  instanceMatrixUArm = mult(
    translate(0.0, 0.5 * UARM_HEIGHT, 0.0),
    scaleUpperArm
  );
  instanceMatrixLArm = mult(
    translate(0.0, 0.5 * LARM_HEIGHT, 0.0),
    scaleLowerArm
  );
  instanceMatrixIUGrip = mult(
    translate(0.0, 0.5 * INNERUPPER_GRIP_HEIGHT, 0.0),
    scaleInnerUpperGrip
  );
  instanceMatrixOUGrip = mult(
    translate(0.0, 0.5 * OUTERUPPER_GRIP_HEIGHT, 0.0),
    scaleOuterUpperGrip
  );
  instanceMatrixIBGrip = mult(
    translate(0.0, 0.5 * INNERBOTTOM_GRIP_HEIGHT, 0.0),
    scaleInnerBottomGrip
  );
  instanceMatrixOBGrip = mult(
    translate(0.0, 0.5 * OUTERBOTTOM_GRIP_HEIGHT, 0.0),
    scaleOuterBottomGrip
  );

  scaleBall = scale(1.0, 1.0, 1.0);
  instanceMatrixBall = mult(
    translate(0.0, OUTERBOTTOM_GRIP_HEIGHT, 0.0),
    scaleBall
  );

  // Draw the primitive / geometric shape
  draw();
}

// Draw the base body, upper arm, and lower arm respectively
function draw() {
  // Clear the color buffer and the depth buffer before rendering a new frame
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 1. Get the locations of our new shader variables
  isBallLoc = gl.getUniformLocation(program, "isBall");
  colColorLoc = gl.getUniformLocation(program, "collisionColor");

  // 2. DRAW ROBOT (Switch is OFF)
  gl.uniform1i(isBallLoc, false);

  // Define the model view matrix as a new identity matrix
  modelViewMatrix = mat4();

  // Apply the mouse-drag rotations first
  modelViewMatrix = mult(modelViewMatrix, rotateX(viewRotationX));
  modelViewMatrix = mult(modelViewMatrix, rotateY(viewRotationY));

  modelViewMatrix = mult(modelViewMatrix, translate(robotPosX, -5, 0.0)); // T1
  modelViewMatrix = mult(modelViewMatrix, rotateY(theta[BASE_BODY])); // R1
  baseBody();

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0)); // T2
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[UPPER_ARM])); // R2
  upperArm();

  modelViewMatrix = mult(modelViewMatrix, translate(0.0, UARM_HEIGHT, 0.0)); // T3
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[LOWER_ARM])); // R3
  lowerArm();

  // Properly copy the current modelViewMatrix to avoid NaNs
  tempModelViewMatrix = mat4();
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      tempModelViewMatrix[i][j] = modelViewMatrix[i][j];
    }
  }

  modelViewMatrix = mult(modelViewMatrix, translate(-0.1, LARM_HEIGHT, 0.0)); // T3
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[INNER_UPPER_GRIPPER])); // R3
  InnerUpperGrip();

  modelViewMatrix = mult(
    modelViewMatrix,
    translate(0.0, INNERUPPER_GRIP_HEIGHT, 0.0)
  ); // T3
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[OUTER_UPPER_GRIPPER])); // R3
  OuterUpperGrip();

  // Restore modelViewMatrix by copying elements from tempModelViewMatrix
  modelViewMatrix = mat4();
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      modelViewMatrix[i][j] = tempModelViewMatrix[i][j];
    }
  }

  modelViewMatrix = mult(modelViewMatrix, translate(0.1, LARM_HEIGHT, 0.0)); // T3 (was 1.0)
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[INNER_BOTTOM_GRIPPER])); // R3
  InnerBottomGrip();

  modelViewMatrix = mult(
    modelViewMatrix,
    translate(0.0, INNERBOTTOM_GRIP_HEIGHT, 0.0)
  ); // T3
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[OUTER_BOTTOM_GRIPPER])); // R3
  OuterBottomGrip();

  // 1. Capture the "Wrist" matrix (where the grippers attach)
  // var wristMatrix = mat4();
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      wristMatrix[i][j] = tempModelViewMatrix[i][j];
    }
  }

  // MOVE it to the end of the arm (The actual wrist)
  wristMatrix = mult(wristMatrix, translate(0.0, LARM_HEIGHT, 0.0));

  // 2. Perform ONE collision check for the whole "Hand"
  let isTouching = checkGripCenterCollision();

  // 4. DRAW BALL (Switch is ON)
  gl.uniform1i(isBallLoc, true);

  if (isTouching) {
    // Pass Green to the shader if touching
    gl.uniform4fv(colColorLoc, flatten(vec4(0.0, 1.0, 0.0, 1.0)));
    console.log("The robot arm is holding the ball.")
  } else {
    // Pass Red (or the ball's original color) if not touching
    gl.uniform4fv(colColorLoc, flatten(vec4(1.0, 0.7, 0.7, 1.0)));
  }

  ballModelViewMatrix = mat4();
  ballModelViewMatrix = mult(ballModelViewMatrix, rotateX(viewRotationX)); // T1
  ballModelViewMatrix = mult(ballModelViewMatrix, rotateY(viewRotationY));

  ballModelViewMatrix = mult(ballModelViewMatrix, translate(7.8, -2.0, 0.0));

  // 4. Assign to the global modelViewMatrix so the ball() function can use it
  modelViewMatrix = ballModelViewMatrix;
  ball();
}

// Helper function to draw base body
function ball() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixBall);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphereCount);
}

// Helper function to draw base body
function baseBody() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixBase);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw upper arm
function upperArm() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixUArm);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw lower arm
function lowerArm() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixLArm);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Inner Upper Grip
function InnerUpperGrip() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixIUGrip);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Inner Bottom Grip
function InnerBottomGrip() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixIBGrip);

  // Debug: print that the function runs and the translation part of the matrix
  console.log(
    "InnerBottomGrip called; theta:",
    theta[INNER_BOTTOM_GRIPPER],
    "translation:",
    t[0][3],
    t[1][3],
    "full matrix:",
    t
  );

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Outer Upper Grip
function OuterUpperGrip() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixOUGrip);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Outer Bottom Grip
function OuterBottomGrip() {
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixOBGrip);

  // Debug: print that the function runs and the translation part of the matrix
  console.log(
    "OuterBottomGrip called; theta:",
    theta[OUTER_BOTTOM_GRIPPER],
    "translation:",
    t[0][3],
    t[1][3],
    "full matrix:",
    t
  );

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

/**
 * Checks if the robotic gripper (Box) intersects with the target ball (Sphere).
 * This uses the "Clamping" logic you provided.
 */
function checkGripCenterCollision() {
  // 1. BALL WORLD POSITION
  var ballMV = mult(mult(rotateX(viewRotationX), rotateY(viewRotationY)), translate(7.8, -2.0, 0.0));
  
  const ballX = ballMV[0][3];
  const ballY = ballMV[1][3];
  const ballZ = ballMV[2][3];
  const ballRadius = 1.0; 

  // 2. MOVE SENSOR DEEPER INTO THE PALM
  // Moving from 1.1 down to 0.6 pushes the "sensor" deeper between the fingers.
  // This means the ball MUST enter the gap to be detected.
  var gripCenterMatrix = mult(wristMatrix, translate(1.0, OUTERUPPER_GRIP_HEIGHT * 1.6, 0.0));
  
  const gripX = gripCenterMatrix[0][3];
  const gripY = gripCenterMatrix[1][3];
  const gripZ = gripCenterMatrix[2][3];

  // 3. DISTANCE CALCULATION
  const dist = Math.sqrt((gripX - ballX)**2 + (gripY - ballY)**2 + (gripZ - ballZ)**2);

  // 4. THE "STRICT GRIP" LOGIC
  // We use a smaller captureRadius (e.g., 1.3).
  // This forces the ball's center to be very close to the palm's center.
  const captureRadius = 0.2; 

  // This triggers only when the ball is mostly "swallowed" by the gripper bubble
  // return (dist + (ballRadius * 0.5)) < captureRadius;
  return (dist < captureRadius) && (theta[INNER_UPPER_GRIPPER] > 55);
}
/*-----------------------------------------------------------------------------------*/
