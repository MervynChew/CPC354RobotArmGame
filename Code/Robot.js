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
var theta = [0, 0, 0, 30, -38, -30, 38, 0],
  points = [],
  colors = [];

// Here is add de
const INNER_UPPER_GRIPPER = 3;
const OUTER_UPPER_GRIPPER = 4;
const INNER_BOTTOM_GRIPPER = 5;
const OUTER_BOTTOM_GRIPPER = 6;
const WRIST_Z = 7;
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
var autoResetTimer = null;

var viewRotationX = 0;
var viewRotationY = 0;
var dragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

var cubeLength = 0;
const WRIST_SPHERE_RADIUS = 0.4; // Slightly wider than the arm (0.5)

var isBallLoc, colColorLoc;

var robotPosX = 0.0;

var wristMatrix = mat4();

var isBallHeld = false;

var BallPosX = -12.0,
  BallPosY = -5.0,
  BallPosZ = 0.0;

var ballCurrentPos = vec3(BallPosX, BallPosY, BallPosZ);
var ballModelViewMatrix = mat4();

// Basket Dimensions and Position
const BASKET_X = 8.0;
const BASKET_Y = -3.5; // Slightly above floor level (-5.0)
const BASKET_Z = 0.0;
const BASKET_SIZE = 4.0; // How big the "box" is
const BASKET_HEIGHT = 3.5;
var basketModelViewMatrix;
// Add this with your other gripper constants
const CLAW_CENTER = INNERUPPER_GRIP_HEIGHT + OUTERUPPER_GRIP_HEIGHT * 0.5;

var isFalling = false;

const FLOOR_Y = -5.0; // The level of your "ground"
const GRIPDROPROTATIONSPEED = 0.75;

// Animation
const ST_IDLE = 0;
const ST_DROPPING = 1;
const ST_RECOVERING = 2;
var animationPhase = ST_IDLE; // Current state
var isAnimationRunning = false;

// Ball falling physics logic
// Physics constants
const GRAVITY = 0.0015; // Acceleration due to gravity
const BOUNCE_DAMPING = 0.6; // Energy loss on bounce (0-1)
const RIM_BOUNCE_DAMPING = 0.4; // Energy loss when hitting rim
const FRICTION = 0.98; // Air resistance

// Ball physics state
let ballVelocity = { x: 0, y: 0 }; // Velocity in x and y directions
let ballRadius = 1.0; // Ball radius
let hasHitRim = false; // Track if ball has collided with rim

// Game Logic
var gameScore = 0;
var gameStatus = false;
var personalRecord = 0;
var gameStatusShowText;
var userRestart = false;

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
    theta[OUTER_UPPER_GRIPPER] = event.target.value;
    theta[OUTER_BOTTOM_GRIPPER] = -event.target.value;
    outerGripText.innerText = theta[OUTER_UPPER_GRIPPER];
    draw();
  };

  robotX.oninput = function (event) {
    // Convert the string from the slider into a real number
    robotPosX = parseFloat(event.target.value);

    robotXText.innerHTML = robotPosX;

    draw();
  };

  var wristZSlider = document.getElementById("wrist-z-slider");
  var wristZText = document.getElementById("wrist-z-text");

  wristZSlider.oninput = function (event) {
    theta[WRIST_Z] = event.target.value;
    wristZText.innerHTML = theta[WRIST_Z];
    draw();
  };

  const grabButton = document.getElementById("grab-button");
  grabButton.onclick = function () {
    if (!isBallHeld) {
      // // ONLY GRAB IF COLLIDING (The "Green" logic)
      // if (checkGripCenterCollision(wristMatrix)) {
      //   isBallHeld = true;
      //   grabButton.innerText = "Release Ball";

      //   // OPTIONAL: Automatically close fingers to "touch" the ball
      //   theta[INNER_UPPER_GRIPPER] = 55; // Adjust based on your model
      //   theta[INNER_BOTTOM_GRIPPER] = -55;
      //   theta[OUTER_UPPER_GRIPPER] = -38;
      //   theta[OUTER_BOTTOM_GRIPPER] = 38;

      //   GripControl(innerGripSlider, outerGripSlider);
      // } else {
      //   console.log("Too far away to grab!");
      // }
      gripBall();
    } else {
      // RELEASE
      // isBallHeld = false;
      // isFalling = true;
      // isAnimationRunning = true; // Set once
      // animationPhase = ST_DROPPING; // Set once

      // // Capture the exact world position of the ball the moment it was let go
      // ballCurrentPos = vec3(
      //   ballModelViewMatrix[0][3],
      //   ballModelViewMatrix[1][3],
      //   ballModelViewMatrix[2][3]
      // );
      // // IMPORTANT: This allows you to pick it up again!
      // BallPosX = ballCurrentPos[0];
      // BallPosY = ballCurrentPos[1];
      // BallPosZ = ballCurrentPos[2];
      // isBallHeld = false;
      // grabButton.innerText = "Grab Ball";

      // GripControl(innerGripSlider, outerGripSlider);
      letGoGrip();
    }
    draw();
  };

  var restartBtn = document.getElementById("restart-button");
  restartBtn.onclick = function () {
    // Clear any pending auto-reset timer
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      autoResetTimer = null;
    }
    
    isDemoRunning = false;
    userRestart = true;
    restartGame();
    enableAllButton();
  };

  var demoBtn = document.getElementById("demo-button");
  demoBtn.onclick = function () {
    disableAllButton();
    startDemo();
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

// function letGoGrip() {
//   const grabButton = document.getElementById("grab-button");
//   isBallHeld = false;
//   isFalling = true;
//   isAnimationRunning = true; // Set once
//   animationPhase = ST_DROPPING; // Set once

//   // Capture the exact world position of the ball the moment it was let go
//   ballCurrentPos = vec3(
//     ballModelViewMatrix[0][3],
//     ballModelViewMatrix[1][3],
//     ballModelViewMatrix[2][3]
//   );
//   // IMPORTANT: This allows you to pick it up again!
//   BallPosX = ballCurrentPos[0];
//   BallPosY = ballCurrentPos[1];
//   BallPosZ = ballCurrentPos[2];
//   isBallHeld = false;
//   grabButton.innerText = "Grab Ball";

//   GripControl(innerGripSlider, outerGripSlider);
// }

function letGoGrip() {
  const grabButton = document.getElementById("grab-button");
  isBallHeld = false;
  isFalling = true;
  isAnimationRunning = true;
  animationPhase = ST_DROPPING;

  // FIXED: Extract world position by removing view rotation influence
  // When ball is held, ballModelViewMatrix = wristMatrix * translate(0, CLAW_CENTER*0.5, 0)
  // wristMatrix already includes viewRotationX and viewRotationY at the beginning
 
  // Method 1: Rebuild the position without view rotations
  let worldMatrix = mat4();
  worldMatrix = mult(worldMatrix, translate(robotPosX, -5.0, 0.0));
  worldMatrix = mult(worldMatrix, rotateY(theta[BASE_BODY]));
  worldMatrix = mult(worldMatrix, translate(0.0, BASE_HEIGHT, 0.0));
  worldMatrix = mult(worldMatrix, rotateZ(theta[UPPER_ARM]));
  worldMatrix = mult(worldMatrix, translate(0.0, UARM_HEIGHT, 0.0));
  worldMatrix = mult(worldMatrix, rotateZ(theta[LOWER_ARM]));
  worldMatrix = mult(worldMatrix, translate(0.0, LARM_HEIGHT, 0.0));
  worldMatrix = mult(worldMatrix, rotateY(theta[WRIST_Z]));
  worldMatrix = mult(worldMatrix, translate(0.0, WRIST_SPHERE_RADIUS, 0.0));
  worldMatrix = mult(worldMatrix, translate(0.0, CLAW_CENTER * 0.5, 0.0));
 
  // Extract true world position
  ballCurrentPos = vec3(
    worldMatrix[0][3],
    worldMatrix[1][3],
    worldMatrix[2][3]
  );
 
  BallPosX = ballCurrentPos[0];
  BallPosY = ballCurrentPos[1];
  BallPosZ = ballCurrentPos[2];
 
  grabButton.innerText = "Grab Ball";

  GripControl(innerGripSlider, outerGripSlider);
 
  console.log("Ball released at world position:", BallPosX, BallPosY, BallPosZ);
}


function gripBall() {
  const grabButton = document.getElementById("grab-button");
  // ONLY GRAB IF COLLIDING (The "Green" logic)
  if (checkGripCenterCollision(wristMatrix)) {
    isBallHeld = true;
    grabButton.innerText = "Release Ball";

    // OPTIONAL: Automatically close fingers to "touch" the ball
    theta[INNER_UPPER_GRIPPER] = 55; // Adjust based on your model
    theta[INNER_BOTTOM_GRIPPER] = -55;
    theta[OUTER_UPPER_GRIPPER] = -38;
    theta[OUTER_BOTTOM_GRIPPER] = 38;

    GripControl(innerGripSlider, outerGripSlider);
  } else {
    console.log("Too far away to grab!");
  }
  console.log("Hello");
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

  scaleWristConn = scale(
    WRIST_SPHERE_RADIUS,
    WRIST_SPHERE_RADIUS,
    WRIST_SPHERE_RADIUS
  );
  instanceMatrixWristConn = scaleWristConn;

  // Draw the primitive / geometric shape
  draw();
}

// Draw the base body, upper arm, and lower arm respectively
function draw() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  isBallLoc = gl.getUniformLocation(program, "isBall");
  colColorLoc = gl.getUniformLocation(program, "collisionColor");

  // 1. DRAW ROBOT
  gl.uniform1i(isBallLoc, false);
  modelViewMatrix = mat4();
  modelViewMatrix = mult(modelViewMatrix, rotateX(viewRotationX));
  modelViewMatrix = mult(modelViewMatrix, rotateY(viewRotationY));

  // Move to Base and draw
  modelViewMatrix = mult(modelViewMatrix, translate(robotPosX, -5.0, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotateY(theta[BASE_BODY]));
  baseBody();

  // Move to Upper Arm and draw
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[UPPER_ARM]));
  upperArm();

  // Move to Lower Arm and draw
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, UARM_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[LOWER_ARM]));
  lowerArm();

  // --- WRIST & CONNECTOR ---
  // Step A: Move to the end of the lower arm
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, LARM_HEIGHT, 0.0));

  // Step B: Apply the animated Wrist Rotation (the twist)
  modelViewMatrix = mult(modelViewMatrix, rotateY(theta[WRIST_Z]));

  // Step C: Draw the Sphere Connector (Grey Color)
  gl.uniform1i(isBallLoc, true);
  gl.uniform4fv(colColorLoc, flatten(vec4(0.7, 0.7, 0.7, 1.0)));
  wristConnector();
  gl.uniform1i(isBallLoc, false);

  // Step D: CAPTURE THE WRIST MATRIX HERE
  // This is the "Pivot Point" for both fingers and collision.
  // We add the sphere radius so fingers sit on the ball surface.
  wristMatrix = mult(modelViewMatrix, translate(0.0, WRIST_SPHERE_RADIUS, 0.0));

  // Step E: Use this wristMatrix for all finger branches
  // Branch 1: Inner Upper
  tempModelViewMatrix = mult(wristMatrix, translate(-0.1, 0.0, 0.0));
  modelViewMatrix = mult(
    tempModelViewMatrix,
    rotateZ(theta[INNER_UPPER_GRIPPER])
  );
  InnerUpperGrip();
  modelViewMatrix = mult(
    modelViewMatrix,
    translate(0.0, INNERUPPER_GRIP_HEIGHT, 0.0)
  );
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[OUTER_UPPER_GRIPPER]));
  OuterUpperGrip();

  // Branch 2: Inner Bottom
  tempModelViewMatrix = mult(wristMatrix, translate(0.1, 0.0, 0.0));
  modelViewMatrix = mult(
    tempModelViewMatrix,
    rotateZ(theta[INNER_BOTTOM_GRIPPER])
  );
  InnerBottomGrip();
  modelViewMatrix = mult(
    modelViewMatrix,
    translate(0.0, INNERBOTTOM_GRIP_HEIGHT, 0.0)
  );
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[OUTER_BOTTOM_GRIPPER]));
  OuterBottomGrip();

  // 2. DRAW BALL
  gl.uniform1i(isBallLoc, true);

  if (isBallHeld) {
    gl.uniform4fv(colColorLoc, flatten(vec4(0.0, 0.0, 1.0, 1.0))); // Blue
    // Position ball relative to the wristMatrix captured above
    // ballModelViewMatrix = mult(wristMatrix, translate(0.0, OUTERUPPER_GRIP_HEIGHT * 0.5, 0.0));
    ballModelViewMatrix = mult(
      wristMatrix,
      translate(0.0, CLAW_CENTER * 0.5, 0.0)
    );
    // I change here
  } else {
    if (isFalling) releaseBall();
    if (isAnimationRunning) rotateGrip();

    let isTouching = checkGripCenterCollision();
    gl.uniform4fv(
      colColorLoc,
      isTouching
        ? flatten(vec4(0.0, 1.0, 0.0, 1.0))
        : flatten(vec4(1.0, 0.7, 0.7, 1.0))
    );

    ballModelViewMatrix = mat4();
    ballModelViewMatrix = mult(ballModelViewMatrix, rotateX(viewRotationX));
    ballModelViewMatrix = mult(ballModelViewMatrix, rotateY(viewRotationY));
    ballModelViewMatrix = mult(
      ballModelViewMatrix,
      translate(ballCurrentPos[0], ballCurrentPos[1], ballCurrentPos[2])
    );
  }

  modelViewMatrix = ballModelViewMatrix;
  ball();

  // --- 3. DRAW BASKET ---
  gl.uniform1i(isBallLoc, true);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Calculate the shared Matrix
  basketModelViewMatrix = mat4();
  basketModelViewMatrix = mult(basketModelViewMatrix, rotateX(viewRotationX));
  basketModelViewMatrix = mult(basketModelViewMatrix, rotateY(viewRotationY));
  basketModelViewMatrix = mult(
    basketModelViewMatrix,
    translate(BASKET_X, BASKET_Y, BASKET_Z)
  );
  modelViewMatrix = basketModelViewMatrix;

  // PASS 1: Draw the Inner Fill (Slightly Transparent)
  gl.uniform4fv(colColorLoc, flatten(vec4(0.6, 0.3, 0.1, 0.2))); // Alpha 0.2
  basket(false); // Call with drawOutline = false

  // PASS 2: Draw the Outline (Fully Opaque)
  gl.uniform4fv(colColorLoc, flatten(vec4(0.6, 0.3, 0.1, 1.0))); // Alpha 1.0
  basket(true); // Call with drawOutline = true

  gl.disable(gl.BLEND); // Good practice to disable after use

  // End Draw Basket

  if (isFalling || isAnimationRunning) {
    window.requestAnimationFrame(draw);
  }
}

function basket(drawOutline) {
  // Scale the cube to look like a container
  var s = scale(BASKET_SIZE, BASKET_HEIGHT, BASKET_SIZE);
  var t = mult(modelViewMatrix, s);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  if (drawOutline) {
    // Draw just the wireframe edges
    gl.drawArrays(gl.LINE_LOOP, 0, cubeLength);
  } else {
    // Draw the solid transparent faces
    gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
  }
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

function wristConnector() {
  // Use the same modelViewMatrix logic, but draw the sphere part of the buffer
  var t = mult(modelViewMatrix, instanceMatrixWristConn);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Change from cubeLength to your sphere variables
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

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

function GripControl(innerGripper, outerGripper) {
  if (isBallHeld || isDemoRunning) {
    innerGripper.disabled = true;
    outerGripper.disabled = true;
  } else {
    innerGripper.disabled = false;
    outerGripper.disabled = false;
  }
}

function disableAllButton() {
  var baseSlider = document.getElementById("base-slider");
  var robotX = document.getElementById("robot-x");
  var uArm = document.getElementById("uarm-slider");
  var lArm = document.getElementById("larm-slider");
  var innerGrip = document.getElementById("innerGrip-slider");
  var outerGrip = document.getElementById("outerGrip-slider");
  var wrist = document.getElementById("wrist-z-slider");
  var grabBut = document.getElementById("grab-button");
  var demoBut = document.getElementById("demo-button");
 


  baseSlider.disabled = true;
  robotX.disabled = true;
  uArm.disabled = true;
  lArm.disabled = true;
  innerGrip.disabled = true;
  outerGrip.disabled = true;
  wrist.disabled = true;
  grabBut.disabled = true;
  demoBut.disabled = true;

}

function enableAllButton() {
  // do not enable buttons if demo is currently running
  if (isDemoRunning) {
    return;
  }

  var baseSlider = document.getElementById("base-slider");
  var robotX = document.getElementById("robot-x");
  var uArm = document.getElementById("uarm-slider");
  var lArm = document.getElementById("larm-slider");
  var innerGrip = document.getElementById("innerGrip-slider");
  var outerGrip = document.getElementById("outerGrip-slider");
  var wrist = document.getElementById("wrist-z-slider");
  var grabBut = document.getElementById("grab-button");
  var demoBut = document.getElementById("demo-button");
  var restartBut = document.getElementById("restart-button");

  baseSlider.disabled = false;
  robotX.disabled = false;
  uArm.disabled = false;
  lArm.disabled = false;
  innerGrip.disabled = false;
  outerGrip.disabled = false;
  wrist.disabled = false;
  grabBut.disabled = false;
  demoBut.disabled = false;
  restartBut.disabled = false;
}

// function releaseBall() {
//   rotateGrip();
//   ballCurrentPos[1] -= GRAVITY; // Move down

//   // Stop at the floor
//   if (ballCurrentPos[1] <= FLOOR_Y) {
//     ballCurrentPos[1] = FLOOR_Y;
//     BallPosY = ballCurrentPos[1];
//     isFalling = false; // Stop the calculation
//   }
// }

// function releaseBall() {
//     rotateGrip();

//     // Move ball down
//     ballCurrentPos[1] -= GRAVITY;

//     // Define the "Rim" of the basket
//     var basketTop = BASKET_Y;

//     // CHECK IF BALL IS OVER THE BASKET
//     // If Ball X is between (BASKET_X - 1) and (BASKET_X + 1)
//     var isOverBasket = Math.abs(ballCurrentPos[0] - BASKET_X) < (BASKET_SIZE / 2);

//     if (isOverBasket) {
//         // Stop falling when it hits the "bottom" of the basket
//         if (ballCurrentPos[1] <= basketTop) {
//             ballCurrentPos[1] = FLOOR_Y;
//             isFalling = false;
//             console.log("The Ball Drop in the basket.")
//         }
//     } else {
//         // Otherwise, fall all the way to the floor
//         if (ballCurrentPos[1] <= FLOOR_Y) {
//             ballCurrentPos[1] = FLOOR_Y;
//             isFalling = false;
//             console.log("The Ball Drop on the floor.")
//         }
//     }

//     BallPosX = ballCurrentPos[0];
//     BallPosY = ballCurrentPos[1];
//     BallPosZ = ballCurrentPos[2];
// }

function releaseBall() {

  fetchBallLocation();
  rotateGrip();

  // Apply gravity to velocity
  ballVelocity.y -= GRAVITY;

  // Update position based on velocity
  ballCurrentPos[1] += ballVelocity.y;
  ballCurrentPos[0] += ballVelocity.x;

  // Basket dimensions
  const basketTop = BASKET_Y;
  const basketBottom = BASKET_Y - BASKET_HEIGHT / 2;
  const basketLeft = BASKET_X - BASKET_SIZE / 2;
  const basketRight = BASKET_X + BASKET_SIZE / 2;

  // Get ball edges
  const ballLeft = ballCurrentPos[0] - ballRadius;
  const ballRight = ballCurrentPos[0] + ballRadius;
  const ballTop = ballCurrentPos[1] + ballRadius;
  const ballBottom = ballCurrentPos[1] - ballRadius;

  // ===== RIM COLLISION DETECTION =====
  // Only check rim collision when ball is falling and at rim level
  if (
    ballVelocity.y < 0 &&
    ballBottom <= basketTop &&
    ballTop >= basketTop - 0.3
  ) {
    // Check LEFT rim collision
    if (ballRight > basketLeft && ballLeft < basketLeft && !hasHitRim) {
      hasHitRim = true;
      const ballCenterX = ballCurrentPos[0];

      // If more than half the ball is over the basket (inside), it goes in
      if (ballCenterX > basketLeft) {
        // Ball goes INTO the basket
        ballVelocity.x = 0.03; // Slight push inward
        ballVelocity.y *= 0.5; // Slow down fall significantly
        // Keep ball inside basket boundary
        ballCurrentPos[0] = Math.max(
          ballCurrentPos[0],
          basketLeft + ballRadius + 0.05
        );
      } else {
        // Ball bounces OFF the rim to the left
        ballVelocity.x = -0.08; // Bounce left with speed
        ballVelocity.y = Math.abs(ballVelocity.y) * 0.3; // Small upward bounce
        ballCurrentPos[0] = basketLeft - ballRadius - 0.2; // Push outside
      }
    }

    // Check RIGHT rim collision
    if (ballLeft < basketRight && ballRight > basketRight && !hasHitRim) {
      hasHitRim = true;
      const ballCenterX = ballCurrentPos[0];

      // If more than half the ball is over the basket (inside), it goes in
      if (ballCenterX < basketRight) {
        // Ball goes INTO the basket
        ballVelocity.x = -0.03; // Slight push inward
        ballVelocity.y *= 0.5; // Slow down fall significantly
        // Keep ball inside basket boundary
        ballCurrentPos[0] = Math.min(
          ballCurrentPos[0],
          basketRight - ballRadius - 0.05
        );
      } else {
        // Ball bounces OFF the rim to the right
        ballVelocity.x = 0.08; // Bounce right with speed
        ballVelocity.y = Math.abs(ballVelocity.y) * 0.3; // Small upward bounce
        ballCurrentPos[0] = basketRight + ballRadius + 0.2; // Push outside
      }
    }
  }

  // ===== LANDING DETECTION =====
  const isOverBasket =
    ballCurrentPos[0] > basketLeft && ballCurrentPos[0] < basketRight;

  if (isOverBasket) {
    // WALL COLLISION - Check CONTINUOUSLY at any height
    const wallLeft = basketLeft + ballRadius;
    const wallRight = basketRight - ballRadius;

    // Left wall collision - only when ball is BELOW rim level
    if (
      ballCurrentPos[1] < basketTop &&
      ballCurrentPos[0] <= wallLeft &&
      ballVelocity.x < 0
    ) {
      ballCurrentPos[0] = wallLeft; // Snap to wall position
      ballVelocity.x = -ballVelocity.x * 0.5; // Bounce back with 50% energy
    }

    // Right wall collision - only when ball is BELOW rim level
    if (
      ballCurrentPos[1] < basketTop &&
      ballCurrentPos[0] >= wallRight &&
      ballVelocity.x > 0
    ) {
      ballCurrentPos[0] = wallRight; // Snap to wall position
      ballVelocity.x = -ballVelocity.x * 0.5; // Bounce back with 50% energy
    }

    // FLOOR BOUNCE - Ball hits basket bottom
    if (ballCurrentPos[1] <= basketBottom) {
      ballCurrentPos[1] = basketBottom;

      if (Math.abs(ballVelocity.y) > 0.008) {
        // Reverse and dampen velocity for bounce
        ballVelocity.y = -ballVelocity.y * 0.4; // 40% bounce
        ballVelocity.x *= 0.92; // Apply friction to horizontal speed
      } else {
        // Stop vertical bouncing - settled on floor
        ballVelocity.y = 0;
        ballVelocity.x *= 0.88; // More friction when settled

        if (Math.abs(ballVelocity.x) < 0.005) {
          ballVelocity.x = 0;
          isFalling = false;
          hasHitRim = false; // Reset for next throw
          gameStatus = true;
          scoreCount();
          setTimeout(enableAllButton, 5000);
        }
      }
    }
  } else {
    // Ball is outside basket - check floor collision
    if (ballCurrentPos[1] <= FLOOR_Y) {
      // Ball hit the floor - BOUNCE
      ballCurrentPos[1] = FLOOR_Y;

      if (Math.abs(ballVelocity.y) > 0.015) {
        // Reverse and dampen velocity for bounce
        ballVelocity.y = -ballVelocity.y * BOUNCE_DAMPING;
        ballVelocity.x *= 0.88; // Reduce horizontal speed
      } else {
        // Stop bouncing - settled
        ballVelocity.y = 0;
        ballVelocity.x *= 0.92;

        if (Math.abs(ballVelocity.x) < 0.008) {
          ballVelocity.x = 0;
          isFalling = false;
          hasHitRim = false; // Reset for next throw
          gameStatus = false;
          scoreCount();
          setTimeout(enableAllButton, 5000);
        }
      }
    }
  }

  // Sync variables for the draw() function
  BallPosX = ballCurrentPos[0];
  BallPosY = ballCurrentPos[1];
}

function rotateGrip() {
  switch (animationPhase) {
    case ST_DROPPING:
      if (theta[WRIST_Z] > -180) {
        theta[WRIST_Z] -= GRIPDROPROTATIONSPEED;
      } else {
        theta[WRIST_Z] = -180;
        animationPhase = ST_RECOVERING; // Now it can actually switch!
      }
      break;

    case ST_RECOVERING:
      if (theta[WRIST_Z] < 0) {
        theta[WRIST_Z] += GRIPDROPROTATIONSPEED;
      } else {
        theta[WRIST_Z] = 0;
        animationPhase = ST_IDLE;
        isAnimationRunning = false; // Stop when back at 0
      }
      break;

    case ST_IDLE:
    default:
      // Do nothing if idle
      break;
  }

  // Keep UI in sync
  const slider = document.getElementById("wrist-z-slider");
  const text = document.getElementById("wrist-z-text");
  if (slider) {
    slider.value = theta[WRIST_Z];
    text.innerHTML = theta[WRIST_Z];
  }
}

function getBallSide() {
  // 1. Get Ball World Position (using your existing logic)
  var ballMV = mult(mult(rotateX(viewRotationX), rotateY(viewRotationY)), translate(ballCurrentPos[0], ballCurrentPos[1], ballCurrentPos[2])
  );
  var ballWorldPos = vec4(ballMV[0][3], ballMV[1][3], ballMV[2][3], 1.0);

  // 2. Get the Inverse of the Wrist Matrix
  // This converts World Space coordinates into "Gripper Space"
  var invWristMatrix = inverse(wristMatrix);

  // 3. Transform the ball position into local gripper space
  var ballLocalPos = mult(invWristMatrix, ballWorldPos);

  // 4. Check the X coordinate
  // In WebGL local space, X is usually the Left/Right axis
  if (ballLocalPos[0] > 0.1) {
    return 1; // Right side
  } else if (ballLocalPos[0] < -0.1) {
    return 2; // Left
  } else {
    return 3;
  }
}

/**
 * Checks if the robotic gripper (Box) intersects with the target ball (Sphere).
 * This uses the "Clamping" logic you provided.
 */
function checkGripCenterCollision() {
  // 1. BALL WORLD POSITION
  var ballMV = mult(mult(rotateX(viewRotationX), rotateY(viewRotationY)), translate(BallPosX, BallPosY, BallPosZ)
  );

  const ballX = ballMV[0][3];
  const ballY = ballMV[1][3];
  const ballZ = ballMV[2][3];

  // console.log("Ball X:", ballX);
  // console.log("Ball Y:", ballY);
  // console.log("Ball Z:", ballZ);

  // 2. MOVE SENSOR DEEPER INTO THE PALM
  // Moving from 1.1 down to 0.6 pushes the "sensor" deeper between the fingers.
  // This means the ball MUST enter the gap to be detected.

  var side = getBallSide();

  if (side == 1) {
    var gripCenterMatrix = mult(wristMatrix, translate(1.0, OUTERUPPER_GRIP_HEIGHT * 1.6, 0.0)
    );
  } else {
    var gripCenterMatrix = mult(wristMatrix, translate(-1.0, OUTERUPPER_GRIP_HEIGHT * 1.6, 0.0)
    );
  }

  const gripX = gripCenterMatrix[0][3];
  const gripY = gripCenterMatrix[1][3];
  const gripZ = gripCenterMatrix[2][3];
  // console.log("Sweet Spot X:", gripX);
  // console.log("Sweet Spot Y:", gripY);
  // console.log("Sweet Spot Z:", gripZ);

  // 3. DISTANCE CALCULATION
  const dist = Math.sqrt(
    (gripX - ballX) ** 2 + (gripY - ballY) ** 2 + (gripZ - ballZ) ** 2
  );

  // 4. THE "STRICT GRIP" LOGIC
  // We use a smaller captureRadius (e.g., 1.3).
  // This forces the ball's center to be very close to the palm's center.
  const captureRadius = 0.2;

  // This triggers only when the ball is mostly "swallowed" by the gripper bubble
  // return (dist + (ballRadius * 0.5)) < captureRadius;
  return dist < captureRadius && theta[INNER_UPPER_GRIPPER] > 60;
}

function scoreCount() {
  // Skip scoring during demo
  if (isDemoRunning) {
    autoResetTimer = setTimeout(() => {
      restartGame();
    }, 5000);
    return;
  }

  if (gameStatus) {
    gameScore++;
    if (gameScore >= personalRecord) personalRecord = gameScore;
    console.log("Game score:", gameScore);
    console.log("personalRecord:", personalRecord);

    setTimeout(restartGame, 5000);
  } else {
    gameScore = 0;
    setTimeout(restartGame, 5000);
  }


  updateScoreDisplay();
}


// function to update the score display
function updateScoreDisplay() {
  var winCount = document.getElementById("win-count");
  var personalBestText = document.getElementById("game-personal-best-text");
  var gameStatusText = document.getElementById("game-status-text");


  if (isDemoRunning) {
    // Demo mode display
    winCount.innerHTML = "-";
    personalBestText.innerHTML = "-";
    gameStatusText.innerHTML = "Demonstration: How To Play ❓";
  } else {
    // Normal game display
    winCount.innerHTML = gameScore;
    personalBestText.innerHTML = personalRecord;

    if (gameScore === 0){
      gameStatusShowText = "Let us start the game 🤞";
    }
    else if (gameScore >= personalRecord){
      gameStatusShowText = "Well done! You are at your best form today! 🥳😎";
    }
    else{
      gameStatusShowText = "Fighting! Keep trying to break your personal record! 🔥🔥" ;
    }
   
    gameStatusText.innerHTML = gameStatusShowText;
  }
}


function restartGame() {
  // If demo was running, end it now
  if (isDemoRunning) {
    isDemoRunning = false;
  }
  // 1. Reset Robot Angles (theta) and animation state
  // Use defaults that match the HTML slider initial values so the UI and model align
  theta = [0, 0, 0, 30, -38, -30, 38, 0];

  animationPhase = ST_IDLE;
  isAnimationRunning = false;

  // 2. Reset Robot Position
  robotPosX = 0.0;

  // 3. Reset Ball Physics and Flags
  isBallHeld = false;
  isFalling = false;
  hasHitRim = false;
  ballVelocity = { x: 0, y: 0 };

  // 4. Reset Ball Position to its original starting spot (initial values)
  BallPosX = -12.0,
  BallPosY = -5.0,
  BallPosZ = 0.0;
  ballCurrentPos = vec3(BallPosX, BallPosY, BallPosZ);

  // 5. Reset game variables (keep personalRecord)
  if (userRestart) userRestartGame();

  // 6. Reset UI elements and controls
  updateUI();
  updateScoreDisplay(); // Update score display
  GripControl(innerGripSlider, outerGripSlider);

  // 7. Re-render the scene
  draw();
}

function userRestartGame() {
  gameStatus = false;
  gameScore = 0;
  userRestart = false;
  gameStatusShowText = "Let us start the game 🤞";


  // Reset viewing angle to original position
  viewRotationX = 0;
  viewRotationY = 0;
 
  // Reset zoom to original
  zoomObject = 1.0;

  var personalBestText = document.getElementById("game-personal-best-text");
  // personalBestText.innerHTML = 0;
  if (personalBestText) personalBestText.innerHTML = 0;
}

// Helper to keep the HTML sliders in sync with the reset variables
function updateUI() {
  // Base / arm sliders and their text displays
  if (baseBodySlider) {
    baseBodySlider.value = theta[BASE_BODY];
    if (baseBodyText) baseBodyText.innerHTML = theta[BASE_BODY];
  }
  if (upperArmSlider) {
    upperArmSlider.value = theta[UPPER_ARM];
    if (upperArmText) upperArmText.innerHTML = theta[UPPER_ARM];
  }
  if (lowerArmSlider) {
    lowerArmSlider.value = theta[LOWER_ARM];
    if (lowerArmText) lowerArmText.innerHTML = theta[LOWER_ARM];
  }

  // Inner/Outer grip sliders
  if (innerGripSlider) {
    innerGripSlider.value = theta[INNER_UPPER_GRIPPER];
    if (innerGripText) innerGripText.innerText = theta[INNER_UPPER_GRIPPER];
  }
  if (outerGripSlider) {
    // The code stores one side as negative; present a positive slider value for user clarity
    outerGripSlider.value = theta[OUTER_UPPER_GRIPPER];
    if (outerGripText) outerGripText.innerText = theta[OUTER_UPPER_GRIPPER];
  }

  // Wrist slider/text (local elements so query here)
  var wristSlider = document.getElementById("wrist-z-slider");
  var wristText = document.getElementById("wrist-z-text");
  if (wristSlider) {
    wristSlider.value = theta[WRIST_Z];
    if (wristText) wristText.innerHTML = theta[WRIST_Z];
  }

  // Robot X slider/text
  var robotX = document.getElementById("robot-x");
  var robotXText = document.getElementById("robot-x-text");
  if (robotX) {
    robotX.value = robotPosX;
    if (robotXText) robotXText.innerHTML = robotPosX;
  }

  // Grab button
  var grabBtn = document.getElementById("grab-button");
  if (grabBtn) grabBtn.innerText = "Grab Ball";


  // Update score display
  updateScoreDisplay();
}


// Here try demo
// Demo animation states
const DEMO_ST_IDLE = 0;
const DEMO_ST_MOVE_ROBOT = 1;
const DEMO_ST_UPPER_ARM = 2;
const DEMO_ST_LOWER_ARM = 3;
const DEMO_ST_INNER_GRIP = 4;
const DEMO_ST_OUTER_GRIP = 5;
const DEMO_ST_GRIP = 6;
const DEMO_ST_GRIP_UPPER_ARM = 7;
const DEMO_ST_GRIP_BASE_ROTATE = 8;
const DEMO_ST_GRIP_ROBOT_MOVE = 9;
const DEMO_ST_GRIP_LOWER_ARM = 10;
const DEMO_ST_LETGO_GRIP = 11;

// Animation state
let demoAnimationPhase = DEMO_ST_IDLE;
let isDemoRunning = false;

// Animation speed (degrees or units per frame)
const DEMO_ROBOT_SPEED = 0.1;
const DEMO_ARM_SPEED = 1.0;
const DEMO_GRIP_SPEED = 1.5;

// Target values
const demoTargets = {
  robotPosX: -4,
  upperArm: 59,
  lowerArm: 64,
  innerUpper: 81,
  innerBottom: -81,
  outerUpper: -66,
  outerBottom: 66,
  // Grip sequence targets
  gripUpperArm: 7,
  gripBaseRotation: 180,
  gripRobotPosX: 1.9,
  gripLowerArm: 40,
};

// Start demo function
function startDemo() {
  if (confirm("🎬 Start Gameplay Demonstration?\n\nAll the current progress will lost‼️")) {
    restartGame(); //reset all the interface to the original state so that the demnstration video can run properly
    isDemoRunning = true;
    demoAnimationPhase = DEMO_ST_MOVE_ROBOT;
    disableAllButton();
    updateScoreDisplay(); // Update display to show demo mode
    requestAnimationFrame(demo);
  } else{
    enableAllButton();
  }
}

// Main demo animation function with switch case
function demo() {

  if (!isDemoRunning) return;

  switch (demoAnimationPhase) {
    case DEMO_ST_MOVE_ROBOT:
      // Move robot to target X position
      if (Math.abs(robotPosX - demoTargets.robotPosX) > 0.05) {
        if (robotPosX > demoTargets.robotPosX) {
          robotPosX -= DEMO_ROBOT_SPEED;
        } else {
          robotPosX += DEMO_ROBOT_SPEED;
        }
        updateSlider("robot-x", robotPosX, "robot-x-text");
      } else {
        robotPosX = demoTargets.robotPosX;
        demoAnimationPhase = DEMO_ST_UPPER_ARM;
      }
      break;

    case DEMO_ST_UPPER_ARM:
      // Rotate upper arm to target
      if (Math.abs(theta[UPPER_ARM] - demoTargets.upperArm) > 0.5) {
        if (theta[UPPER_ARM] < demoTargets.upperArm) {
          theta[UPPER_ARM] += DEMO_ARM_SPEED;
        } else {
          theta[UPPER_ARM] -= DEMO_ARM_SPEED;
        }
        updateSlider("uarm-slider", theta[UPPER_ARM], "uarm-text");
      } else {
        theta[UPPER_ARM] = demoTargets.upperArm;
        demoAnimationPhase = DEMO_ST_LOWER_ARM;
      }
      break;

    case DEMO_ST_LOWER_ARM:
      // Rotate lower arm to target
      if (Math.abs(theta[LOWER_ARM] - demoTargets.lowerArm) > 0.5) {
        if (theta[LOWER_ARM] < demoTargets.lowerArm) {
          theta[LOWER_ARM] += DEMO_ARM_SPEED;
        } else {
          theta[LOWER_ARM] -= DEMO_ARM_SPEED;
        }
        updateSlider("larm-slider", theta[LOWER_ARM], "larm-text");
      } else {
        theta[LOWER_ARM] = demoTargets.lowerArm;
        demoAnimationPhase = DEMO_ST_INNER_GRIP;
      }
      break;

    case DEMO_ST_INNER_GRIP:
      // Close inner grippers
      if (Math.abs(theta[INNER_UPPER_GRIPPER] - demoTargets.innerUpper) > 0.5) {
        if (theta[INNER_UPPER_GRIPPER] < demoTargets.innerUpper) {
          theta[INNER_UPPER_GRIPPER] += DEMO_GRIP_SPEED;
          theta[INNER_BOTTOM_GRIPPER] -= DEMO_GRIP_SPEED;
        } else {
          theta[INNER_UPPER_GRIPPER] -= DEMO_GRIP_SPEED;
          theta[INNER_BOTTOM_GRIPPER] += DEMO_GRIP_SPEED;
        }
        updateSlider(
          "innerGrip-slider",
          theta[INNER_UPPER_GRIPPER],
          "innerGrip-text"
        );
      } else {
        theta[INNER_UPPER_GRIPPER] = demoTargets.innerUpper;
        theta[INNER_BOTTOM_GRIPPER] = demoTargets.innerBottom;
        demoAnimationPhase = DEMO_ST_OUTER_GRIP;
      }
      break;

    case DEMO_ST_OUTER_GRIP:
      // Close outer grippers
      if (Math.abs(theta[OUTER_UPPER_GRIPPER] - demoTargets.outerUpper) > 0.5) {
        if (theta[OUTER_UPPER_GRIPPER] > demoTargets.outerUpper) {
          theta[OUTER_UPPER_GRIPPER] -= DEMO_GRIP_SPEED;
          theta[OUTER_BOTTOM_GRIPPER] += DEMO_GRIP_SPEED;
        } else {
          theta[OUTER_UPPER_GRIPPER] += DEMO_GRIP_SPEED;
          theta[OUTER_BOTTOM_GRIPPER] -= DEMO_GRIP_SPEED;
        }
        updateSlider(
          "outerGrip-slider",
          Math.abs(theta[OUTER_UPPER_GRIPPER]),
          "outerGrip-text"
        );
      } else {
        theta[OUTER_UPPER_GRIPPER] = demoTargets.outerUpper;
        theta[OUTER_BOTTOM_GRIPPER] = demoTargets.outerBottom;
        demoAnimationPhase = DEMO_ST_GRIP;
      }
      break;

    case DEMO_ST_GRIP:
      // 1. Snap fingers to the ball position
      theta[INNER_UPPER_GRIPPER] = 55;
      theta[INNER_BOTTOM_GRIPPER] = -55;
      theta[OUTER_UPPER_GRIPPER] = -38;
      theta[OUTER_BOTTOM_GRIPPER] = 38;

      // 2. Force a draw so the wristMatrix is updated for the collision check
      draw();

      // 3. Now attempt the grip
      isBallHeld = false; // Reset before checking
      gripBall();

      // 4. Check if it actually worked before moving on
      if (isBallHeld) {
        console.log("Ball successfully grabbed in demo!");
        demoAnimationPhase = DEMO_ST_GRIP_UPPER_ARM;
      } else {
        // If it fails, the demo would get stuck, so maybe force it:
        isBallHeld = true;
        demoAnimationPhase = DEMO_ST_GRIP_UPPER_ARM;
      }
      break;

    case DEMO_ST_GRIP_UPPER_ARM:
      // Move upper arm to 7 degrees
      if (Math.abs(theta[UPPER_ARM] - demoTargets.gripUpperArm) > 0.5) {
        if (theta[UPPER_ARM] < demoTargets.gripUpperArm) {
          theta[UPPER_ARM] += DEMO_ARM_SPEED;
        } else {
          theta[UPPER_ARM] -= DEMO_ARM_SPEED;
        }
        updateSlider("uarm-slider", theta[UPPER_ARM], "uarm-text");
      } else {
        theta[UPPER_ARM] = demoTargets.gripUpperArm;
        demoAnimationPhase = DEMO_ST_GRIP_BASE_ROTATE;
      }
      break;

    case DEMO_ST_GRIP_BASE_ROTATE:
      // Rotate base 180 degrees
      if (Math.abs(theta[BASE_BODY] - demoTargets.gripBaseRotation) > 0.5) {
        if (theta[BASE_BODY] < demoTargets.gripBaseRotation) {
          theta[BASE_BODY] += DEMO_ARM_SPEED;
        } else {
          theta[BASE_BODY] -= DEMO_ARM_SPEED;
        }
        updateSlider("base-slider", theta[BASE_BODY], "base-text");
      } else {
        theta[BASE_BODY] = demoTargets.gripBaseRotation;
        demoAnimationPhase = DEMO_ST_GRIP_ROBOT_MOVE;
      }
      break;

    case DEMO_ST_GRIP_ROBOT_MOVE:
      // Move robot to X position 1.9
      if (Math.abs(robotPosX - demoTargets.gripRobotPosX) > 0.05) {
        if (robotPosX > demoTargets.gripRobotPosX) {
          robotPosX -= DEMO_ROBOT_SPEED;
        } else {
          robotPosX += DEMO_ROBOT_SPEED;
        }
        updateSlider("robot-x", robotPosX, "robot-x-text");
      } else {
        robotPosX = demoTargets.gripRobotPosX;
        demoAnimationPhase = DEMO_ST_GRIP_LOWER_ARM;
      }
      break;

    case DEMO_ST_GRIP_LOWER_ARM:
      // Move lower arm to 40 degrees
      if (Math.abs(theta[LOWER_ARM] - demoTargets.gripLowerArm) > 0.5) {
        if (theta[LOWER_ARM] < demoTargets.gripLowerArm) {
          theta[LOWER_ARM] += DEMO_ARM_SPEED;
        } else {
          theta[LOWER_ARM] -= DEMO_ARM_SPEED;
        }
        updateSlider("larm-slider", theta[LOWER_ARM], "larm-text");
      } else {
        theta[LOWER_ARM] = demoTargets.gripLowerArm;
        // After positioning the lower arm, proceed to release the ball
        demoAnimationPhase = DEMO_ST_LETGO_GRIP;
      }
      break;

    case DEMO_ST_LETGO_GRIP:
      // 1. Force a draw to sync the matrices
      // (This makes sure the ball's "release point" is accurate)
      draw();

      // 2. Perform the actual release logic
      letGoGrip();

      // 3. IMPORTANT: Reset the rim collision flag for the new drop
      hasHitRim = false;
      ballVelocity = { x: 0, y: 0 }; // Start with no horizontal movement

      // 4. End Demo but keep draw() running for the fall
      demoAnimationPhase = DEMO_ST_IDLE;


      // 5. Ensure the falling animation keeps looping
      // Since demo stopped, we need to make sure the global loop is aware
      if (isFalling) {
        requestAnimationFrame(draw);
      }

      console.log("Ball released from Demo!");

      userRestart = true;
      break;
  }

  // Update the display
  draw();


  // Continue animation loop ONLY if still actively animating
  if (isDemoRunning && demoAnimationPhase !== DEMO_ST_IDLE) {
    requestAnimationFrame(demo);
  }
}

// Helper function to update sliders
function updateSlider(sliderId, value, textId) {
  const slider = document.getElementById(sliderId);
  const text = document.getElementById(textId);

  if (slider) slider.value = value;
  if (text) text.innerHTML = value.toFixed(1);
}

// Stop demo
function stopDemo() {
  isDemoRunning = false;
  demoAnimationPhase = DEMO_ST_IDLE;
}

function fetchBallLocation() {
  BallPosX = ballCurrentPos[0];
  BallPosY = ballCurrentPos[1];
  BallPosZ = ballCurrentPos[2];
}

/*-----------------------------------------------------------------------------------*/
