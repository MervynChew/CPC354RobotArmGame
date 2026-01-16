/*-----------------------------------------------------------------------------------*/
// Variable Declaration
/*-----------------------------------------------------------------------------------*/

// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vColor;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var lightPositionLoc, lightColorLoc, materialShininessLoc;
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

// Robot Component Matrices and Scaling Factors
var scaleBaseBody, scaleUpperArm, scaleLowerArm;
var instanceMatrixBase, instanceMatrixUArm, instanceMatrixLArm;
var baseBodySlider, upperArmSlider, lowerArmSlider;
var baseBodyText, upperArmText, lowerArmText;
var theta = [0, 0, 0, 30, -38, -30, 38, 0],
  points = [],
  colors = [];
  normals = [];

// Gripper's Dimensions and Constants
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

// Color Palettes of the robot components
const PRIMARY_PALETTE = [
    vec4(0.25, 0.25, 0.28, 1.0), // Front 
    vec4(0.75, 0.75, 0.88, 1.0), // Back
    vec4(0.45, 0.45, 0.50, 1.0), // Top 
    vec4(0.10, 0.10, 0.12, 1.0), // Bottom
    vec4(0.08, 0.08, 0.10, 1.0), // Right 
    vec4(0.75, 0.75, 0.88, 1.0)  // Left 
];

const SECONDARY_PALETTE = [
    vec4(0.40, 0.00, 1.00, 1.0), // Front
    vec4(0.20, 0.00, 0.80, 1.0), // Back
    vec4(0.45, 0.50, 1.00, 1.0), // Top (Bright Glow)
    vec4(0.10, 0.00, 0.60, 1.0), // Bottom
    vec4(0.30, 0.00, 0.90, 1.0), // Right
    vec4(0.20, 0.00, 0.90, 1.0)  // Left
];

// More grippers variables
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

// Camera and View Variables
var zoomObject = 1.0;
var autoResetTimer = null;
var viewRotationX = -1;
var viewRotationY = 0;
var dragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// Geometric Shape Buffer Variables
var cubeLength = 0;
const WRIST_SPHERE_RADIUS = 0.4;
var floorStart = 0;
var floorCount = 0;

// Shader Uniform Locations
var isBallLoc, colColorLoc;

// Robots Position
var robotPosX = 0.0;
var wristMatrix = mat4();

// Ball Variables
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

// Gripper Center Position for Collision Detection
const CLAW_CENTER = INNERUPPER_GRIP_HEIGHT + OUTERUPPER_GRIP_HEIGHT * 0.5;

var isFalling = false;

const FLOOR_Y = -5.4; // The level of the "ground"
const GRIPDROPROTATIONSPEED = 0.75;

// Stage (Platform) Variables
var isGameActive = true;
var ballStageX = -12.0;  // Fixed X position of stage
var ballStageY = -5.0;   // Height of the stage platform (at ground level)
var ballStageZ = 0.0;    // Fixed Z position of stage
var ballStageVisualRadius = 4.0;  // Radius of the circular stage

// Collision Detection
var ballStageRadius = 2.4;  // For physics (matches what player sees)

// Ball physics for rolling
var ballIsRolling = false;
var ballAngularVelocity = { x: 0, y: 0 };
var ballRotation = { x: 0, y: 0, z: 0 };

var ballWasReleased = false; // Track if ball was intentionally released
var gameOverTimer = null; // Track the auto-reset timer for game over

// Animation States
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
const FRICTION = 0.94; // Air resistance

// Ball physics state
let ballVelocity = { x: 0, y: 0, z:0 }; // Velocity in x and y directions
let ballRadius = 1.0; // Ball radius
let hasHitRim = false; // Track if ball has collided with rim

// Game Logic
var gameScore = 0;
var gameStatus = false;
var personalRecord = 0;
var gameStatusShowText;
var userRestart = false;
var loseGame = false;

var restartDemo = false;
let demoAnimationId = null; // To store the requestAnimationFrame ID
var robotStartX;
var pauseDemo = false;

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

function normalMatrixFromMat4(m) {
  // Take upper-left 3x3 portion
  return mat3(
    m[0][0], m[1][0], m[2][0],
    m[0][1], m[1][1], m[2][1],
    m[0][2], m[1][2], m[2][2]
  );
}


// Execute the init() function when the web page has fully loaded
window.onload = function init() {
  // Primitive (geometric shape) initialization
  var cube = colorCube();
  points = cube.Point;
  normals = cube.Normal || [];

  // Apply colors to cube faces
  colors = [];
  const verticesPerFace = 6;
  for (let face = 0; face < 6; face++) {
      for (let v = 0; v < verticesPerFace; v++) {
          colors.push(PRIMARY_PALETTE[face]);
      }
  }
  cubeLength = cube.Point.length;

  // Add sphere for ball and connectors
  var ball = sphere(7);
  points = points.concat(ball.Point);
  colors = colors.concat(ball.Color);

  // Calculate sphere normals for the lighting
  var ballNormals = ball.Point.map(function(p) {
    var len = Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
    return vec3(p[0]/len, p[1]/len, p[2]/len);
  });
  normals = normals.concat(ballNormals);

  sphereStart = cubeLength;
  sphereCount = ball.Point.length;

  // Add small cylinder to act as a stage for the ball
  var stageCylinder = cylinder(36, 1, true);  // 36 slices, 1 stack, with caps
  points = points.concat(stageCylinder.Point);
  colors = colors.concat(stageCylinder.Point.map(() => vec4(0.2, 0.2, 0.22, 1.0)));
  normals = normals.concat(stageCylinder.Point.map(() => vec3(0, 1, 0)));

  cylinderStart = sphereStart + sphereCount;
  cylinderCount = stageCylinder.Point.length;

  // Add the floor geometry
  var floorCube = colorCube();
  points = points.concat(floorCube.Point);
  colors = colors.concat(floorCube.Point.map(() => vec4(0.35, 0.37, 0.40, 1.0))); // Dark gray floor
  normals = normals.concat(floorCube.Normal || []);

  floorStart = cylinderStart + cylinderCount;
  floorCount = floorCube.Point.length;

  // WebGL setups
  getUIElement();
  controller();
  configWebGL();
  render();
  draw();
};

// Set up the mouse and keyboard event listeners
function controller() {
  canvas = document.getElementById("gl-canvas");
  canvas.onmousedown = mousedown;
  canvas.onmouseup = mouseup;
  canvas.onmousemove = mousemove;

  window.addEventListener('keydown', handleKeyDown);
}

// Mouse Drag Controls for the Camera View Rotation
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

// Keyboard control handler
function handleKeyDown(event) {
  // Prevent default for spacebar to avoid page scroll
  if (event.code === 'Space') {
    event.preventDefault();
  }
  
  // Don't process keys if demo is running
  if (isDemoRunning) return;
  
  const key = event.key.toLowerCase();
  const stepSize = 2.0; // Adjustment step for angles
  const robotStepSize = 0.2; // Adjustment step for robot position
  
  let needsUpdate = false;
  let sliderElement = null;
  let textElement = null;
  
  switch(key) {
    // Robot X Position: A (left/decrease), D (right/increase)
    // Range: -10 to 10
    case 'a':
      if (robotPosX > -10) { // Check min limit
        robotPosX -= robotStepSize;
        robotPosX = Math.max(-10, robotPosX); // Clamp to min
        if (checkProposedMove(theta, robotPosX)) {
          robotPosX += robotStepSize; // Revert if collision
          robotPosX = Math.max(-10, robotPosX); // Clamp again
        } else {
          sliderElement = document.getElementById("robot-x");
          textElement = document.getElementById("robot-x-text");
          if (sliderElement) sliderElement.value = robotPosX;
          if (textElement) textElement.innerHTML = robotPosX.toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 'd':
      if (robotPosX < 10) { // Check max limit
        robotPosX += robotStepSize;
        robotPosX = Math.min(10, robotPosX); // Clamp to max
        if (checkProposedMove(theta, robotPosX)) {
          robotPosX -= robotStepSize; // Revert if collision
          robotPosX = Math.min(10, robotPosX); // Clamp again
        } else {
          sliderElement = document.getElementById("robot-x");
          textElement = document.getElementById("robot-x-text");
          if (sliderElement) sliderElement.value = robotPosX;
          if (textElement) textElement.innerHTML = robotPosX.toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Base Angle: Q (decrease), E (increase)
    // Range: 0 to 360
    case 'q':
      if (theta[BASE_BODY] > 0) { // Check min limit
        theta[BASE_BODY] -= stepSize;
        theta[BASE_BODY] = Math.max(0, theta[BASE_BODY]); // Clamp to min
        if (checkProposedMove(theta, robotPosX)) {
          theta[BASE_BODY] += stepSize;
          theta[BASE_BODY] = Math.max(0, theta[BASE_BODY]);
        } else {
          sliderElement = document.getElementById("base-slider");
          textElement = document.getElementById("base-text");
          if (sliderElement) sliderElement.value = theta[BASE_BODY];
          if (textElement) textElement.innerHTML = theta[BASE_BODY].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 'e':
      if (theta[BASE_BODY] < 360) { // Check max limit
        theta[BASE_BODY] += stepSize;
        theta[BASE_BODY] = Math.min(360, theta[BASE_BODY]); // Clamp to max
        if (checkProposedMove(theta, robotPosX)) {
          theta[BASE_BODY] -= stepSize;
          theta[BASE_BODY] = Math.min(360, theta[BASE_BODY]);
        } else {
          sliderElement = document.getElementById("base-slider");
          textElement = document.getElementById("base-text");
          if (sliderElement) sliderElement.value = theta[BASE_BODY];
          if (textElement) textElement.innerHTML = theta[BASE_BODY].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Upper Arm: W (decrease), S (increase)
    // Range: -90 to 90
    case 'w':
      if (theta[UPPER_ARM] > -90) { // Check min limit
        theta[UPPER_ARM] -= stepSize;
        theta[UPPER_ARM] = Math.max(-90, theta[UPPER_ARM]); // Clamp to min
        if (checkProposedMove(theta, robotPosX)) {
          theta[UPPER_ARM] += stepSize;
          theta[UPPER_ARM] = Math.max(-90, theta[UPPER_ARM]);
        } else {
          sliderElement = document.getElementById("uarm-slider");
          textElement = document.getElementById("uarm-text");
          if (sliderElement) sliderElement.value = theta[UPPER_ARM];
          if (textElement) textElement.innerHTML = theta[UPPER_ARM].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 's':
      if (theta[UPPER_ARM] < 90) { // Check max limit
        theta[UPPER_ARM] += stepSize;
        theta[UPPER_ARM] = Math.min(90, theta[UPPER_ARM]); // Clamp to max
        if (checkProposedMove(theta, robotPosX)) {
          theta[UPPER_ARM] -= stepSize;
          theta[UPPER_ARM] = Math.min(90, theta[UPPER_ARM]);
        } else {
          sliderElement = document.getElementById("uarm-slider");
          textElement = document.getElementById("uarm-text");
          if (sliderElement) sliderElement.value = theta[UPPER_ARM];
          if (textElement) textElement.innerHTML = theta[UPPER_ARM].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Lower Arm: R (decrease), F (increase)
    // Range: -90 to 90
    case 'r':
      if (theta[LOWER_ARM] > -90) { // Check min limit
        theta[LOWER_ARM] -= stepSize;
        theta[LOWER_ARM] = Math.max(-90, theta[LOWER_ARM]); // Clamp to min
        if (checkProposedMove(theta, robotPosX)) {
          theta[LOWER_ARM] += stepSize;
          theta[LOWER_ARM] = Math.max(-90, theta[LOWER_ARM]);
        } else {
          sliderElement = document.getElementById("larm-slider");
          textElement = document.getElementById("larm-text");
          if (sliderElement) sliderElement.value = theta[LOWER_ARM];
          if (textElement) textElement.innerHTML = theta[LOWER_ARM].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 'f':
      if (theta[LOWER_ARM] < 90) { // Check max limit
        theta[LOWER_ARM] += stepSize;
        theta[LOWER_ARM] = Math.min(90, theta[LOWER_ARM]); // Clamp to max
        if (checkProposedMove(theta, robotPosX)) {
          theta[LOWER_ARM] -= stepSize;
          theta[LOWER_ARM] = Math.min(90, theta[LOWER_ARM]);
        } else {
          sliderElement = document.getElementById("larm-slider");
          textElement = document.getElementById("larm-text");
          if (sliderElement) sliderElement.value = theta[LOWER_ARM];
          if (textElement) textElement.innerHTML = theta[LOWER_ARM].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Inner Grip: C (decrease), V (increase)
    // Range: 20 to 90
    case 'c':
      if (!isBallHeld && theta[INNER_UPPER_GRIPPER] > 20) { // Check min limit
        let oldInnerTheta = theta[INNER_UPPER_GRIPPER];
        let oldInnerBottomTheta = theta[INNER_BOTTOM_GRIPPER];
        
        theta[INNER_UPPER_GRIPPER] -= stepSize;
        theta[INNER_UPPER_GRIPPER] = Math.max(20, theta[INNER_UPPER_GRIPPER]); // Clamp to min
        theta[INNER_BOTTOM_GRIPPER] = -theta[INNER_UPPER_GRIPPER];
        
        if (checkGripCenterCollision() || checkProposedMove(theta, robotPosX)) {
          theta[INNER_UPPER_GRIPPER] = oldInnerTheta;
          theta[INNER_BOTTOM_GRIPPER] = oldInnerBottomTheta;
        } else {
          sliderElement = document.getElementById("innerGrip-slider");
          textElement = document.getElementById("innerGrip-text");
          if (sliderElement) sliderElement.value = theta[INNER_UPPER_GRIPPER];
          if (textElement) textElement.innerText = theta[INNER_UPPER_GRIPPER].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 'v':
      if (!isBallHeld && theta[INNER_UPPER_GRIPPER] < 90) { // Check max limit
        let oldInnerTheta = theta[INNER_UPPER_GRIPPER];
        let oldInnerBottomTheta = theta[INNER_BOTTOM_GRIPPER];
        
        theta[INNER_UPPER_GRIPPER] += stepSize;
        theta[INNER_UPPER_GRIPPER] = Math.min(90, theta[INNER_UPPER_GRIPPER]); // Clamp to max
        theta[INNER_BOTTOM_GRIPPER] = -theta[INNER_UPPER_GRIPPER];
        
        if (checkGripCenterCollision() || checkProposedMove(theta, robotPosX)) {
          theta[INNER_UPPER_GRIPPER] = oldInnerTheta;
          theta[INNER_BOTTOM_GRIPPER] = oldInnerBottomTheta;
        } else {
          sliderElement = document.getElementById("innerGrip-slider");
          textElement = document.getElementById("innerGrip-text");
          if (sliderElement) sliderElement.value = theta[INNER_UPPER_GRIPPER];
          if (textElement) textElement.innerText = theta[INNER_UPPER_GRIPPER].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Outer Grip: G (decrease), H (increase)
    // Range: -90 to 0
    case 'g':
      if (!isBallHeld && theta[OUTER_UPPER_GRIPPER] > -90) { // Check min limit
        let oldOuterTheta = theta[OUTER_UPPER_GRIPPER];
        let oldOuterBottomTheta = theta[OUTER_BOTTOM_GRIPPER];
        
        theta[OUTER_UPPER_GRIPPER] -= stepSize;
        theta[OUTER_UPPER_GRIPPER] = Math.max(-90, theta[OUTER_UPPER_GRIPPER]); // Clamp to min
        theta[OUTER_BOTTOM_GRIPPER] = -theta[OUTER_UPPER_GRIPPER];
        
        if (checkProposedMove(theta, robotPosX)) {
          theta[OUTER_UPPER_GRIPPER] = oldOuterTheta;
          theta[OUTER_BOTTOM_GRIPPER] = oldOuterBottomTheta;
        } else {
          sliderElement = document.getElementById("outerGrip-slider");
          textElement = document.getElementById("outerGrip-text");
          if (sliderElement) sliderElement.value = theta[OUTER_UPPER_GRIPPER];
          if (textElement) textElement.innerText = theta[OUTER_UPPER_GRIPPER].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 'h':
      if (!isBallHeld && theta[OUTER_UPPER_GRIPPER] < 0) { // Check max limit
        let oldOuterTheta = theta[OUTER_UPPER_GRIPPER];
        let oldOuterBottomTheta = theta[OUTER_BOTTOM_GRIPPER];
        
        theta[OUTER_UPPER_GRIPPER] += stepSize;
        theta[OUTER_UPPER_GRIPPER] = Math.min(0, theta[OUTER_UPPER_GRIPPER]); // Clamp to max
        theta[OUTER_BOTTOM_GRIPPER] = -theta[OUTER_UPPER_GRIPPER];
        
        if (checkProposedMove(theta, robotPosX)) {
          theta[OUTER_UPPER_GRIPPER] = oldOuterTheta;
          theta[OUTER_BOTTOM_GRIPPER] = oldOuterBottomTheta;
        } else {
          sliderElement = document.getElementById("outerGrip-slider");
          textElement = document.getElementById("outerGrip-text");
          if (sliderElement) sliderElement.value = theta[OUTER_UPPER_GRIPPER];
          if (textElement) textElement.innerText = theta[OUTER_UPPER_GRIPPER].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Gripper Wrist: Z (counterclockwise/decrease), X (clockwise/increase)
    // Range: -180 to 180
    case 'z':
      if (theta[WRIST_Z] > -180) { // Check min limit
        theta[WRIST_Z] -= stepSize;
        theta[WRIST_Z] = Math.max(-180, theta[WRIST_Z]); // Clamp to min
        if (checkProposedMove(theta, robotPosX)) {
          theta[WRIST_Z] += stepSize;
          theta[WRIST_Z] = Math.max(-180, theta[WRIST_Z]);
        } else {
          sliderElement = document.getElementById("wrist-z-slider");
          textElement = document.getElementById("wrist-z-text");
          if (sliderElement) sliderElement.value = theta[WRIST_Z];
          if (textElement) textElement.innerHTML = theta[WRIST_Z].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
      
    case 'x':
      if (theta[WRIST_Z] < 180) { // Check max limit
        theta[WRIST_Z] += stepSize;
        theta[WRIST_Z] = Math.min(180, theta[WRIST_Z]); // Clamp to max
        if (checkProposedMove(theta, robotPosX)) {
          theta[WRIST_Z] -= stepSize;
          theta[WRIST_Z] = Math.min(180, theta[WRIST_Z]);
        } else {
          sliderElement = document.getElementById("wrist-z-slider");
          textElement = document.getElementById("wrist-z-text");
          if (sliderElement) sliderElement.value = theta[WRIST_Z];
          if (textElement) textElement.innerHTML = theta[WRIST_Z].toFixed(1);
          needsUpdate = true;
        }
      }
      break;
    
    // Spacebar: Grab/Release Ball
    case ' ':
      const grabButton = document.getElementById("grab-button");
      if (grabButton && !grabButton.disabled) {
        if (!isBallHeld) {
          gripBall();
        } else {
          letGoGrip();
        }
        needsUpdate = true;
      }
      break;
  }
  
  // Check if arm touches ball after movement
  if (needsUpdate && !isBallHeld && checkArmBallCollision()) {
    triggerBallRolling();
  }
  
  // Redraw if any change was made
  if (needsUpdate) {
    draw();
  }
}

/*-----------------------------------------------------------------------------------*/
// ADVANCED "SOLID BODY" COLLISION DETECTION (v6.0 - Enhanced Stage Protection)
/*-----------------------------------------------------------------------------------*/

// 1. Core sphere collision check against floor, stage, ball, and basket
function isSphereColliding(x, y, z, radius, skipFloor = false) {
    
    // --- A. FLOOR COLLISION ---
    // Only check floor if we are NOT skipping it (Arms need this, Base does not)
    if (!skipFloor) {
        if ((y - radius) < -4.95) return true; 
    }

    // --- B. STAGE COLLISION ---
    let distFromStage = Math.sqrt((x - ballStageX) ** 2 + (z - ballStageZ) ** 2);
    // slightly higher buffer to catch the base rim
    let stageTopHeight = ballStageY + 0.35; 

    if (distFromStage < (ballStageRadius + radius) && (y - radius) < stageTopHeight) {
        return true;
    }

    // --- C. BALL COLLISION ---
    if (!isBallHeld && !isFalling && isGameActive) {
        let distFromBall = Math.sqrt((x - BallPosX)**2 + (y - BallPosY)**2 + (z - BallPosZ)**2);
        if (distFromBall < (1.0 + radius - 0.05)) {
            return false; // Allow pushing
        }
    }

    // --- D. BASKET COLLISION ---
    let bLeft = BASKET_X - BASKET_SIZE / 2;
    let bRight = BASKET_X + BASKET_SIZE / 2;
    let bBack = BASKET_Z - BASKET_SIZE / 2;
    let bFront = BASKET_Z + BASKET_SIZE / 2;
    let bTop = BASKET_Y + BASKET_HEIGHT / 2;

    if (x > (bLeft - radius) && x < (bRight + radius) && 
        z > (bBack - radius) && z < (bFront + radius)) {
        if ((y - radius) < bTop) {
             return true;
        }
    }

    return false;
}

// 2. Helper: Check a solid segment (Bone)
function checkSegmentCollision(pStart, pEnd, radius, steps) {
    for (let i = 0; i <= steps; i++) {
        let t = i / steps; 
        let x = pStart[0] * (1 - t) + pEnd[0] * t;
        let y = pStart[1] * (1 - t) + pEnd[1] * t;
        let z = pStart[2] * (1 - t) + pEnd[2] * t;
        
        if (isSphereColliding(x, y, z, radius)) return true;
    }
    return false;
}

// 3. Main Calculation Function
function checkProposedMove(newTheta, newRobotX) {
  var m = mat4();

  // ==========================================
  // Section 1: BASE BODY COLLISION CHECK (Restored User Logic)
  // ==========================================
  m = mult(m, translate(newRobotX, -5.0, 0.0)); 
  m = mult(m, rotateY(newTheta[BASE_BODY]));    
  
  // We use the EXACT visual dimensions of the base
  let baseHalfWidth = 2.5;
  let baseHeight = 2.0;
  let baseHalfDepth = 2.5; 
  
  // Check Corners against Stage/Wall
  let basePoints = [
      vec3( baseHalfWidth, baseHeight,  baseHalfDepth), 
      vec3( baseHalfWidth, baseHeight, -baseHalfDepth), 
      vec3(-baseHalfWidth, baseHeight,  baseHalfDepth), 
      vec3(-baseHalfWidth, baseHeight, -baseHalfDepth),
      vec3( baseHalfWidth, 0.2,  baseHalfDepth), 
      vec3( baseHalfWidth, 0.2, -baseHalfDepth), 
      vec3(-baseHalfWidth, 0.2,  baseHalfDepth), 
      vec3(-baseHalfWidth, 0.2, -baseHalfDepth)
  ];
  
  for (let i = 0; i < basePoints.length; i++) {
      let px = basePoints[i][0] * m[0][0] + basePoints[i][1] * m[0][1] + basePoints[i][2] * m[0][2] + m[0][3];
      let py = basePoints[i][0] * m[1][0] + basePoints[i][1] * m[1][1] + basePoints[i][2] * m[1][2] + m[1][3];
      let pz = basePoints[i][0] * m[2][0] + basePoints[i][1] * m[2][1] + basePoints[i][2] * m[2][2] + m[2][3];
      
      // Pass 'true' to skip floor check (allow sliding)
      if (isSphereColliding(px, py, pz, 0.1, true)) return true;
  }
  
  // Base vs Basket collision check
  let baseCenterX = m[0][3];
  let baseCenterY = m[1][3] + baseHeight / 2;
  let baseCenterZ = m[2][3];
  
  let basketLeft = BASKET_X - BASKET_SIZE / 2;
  let basketRight = BASKET_X + BASKET_SIZE / 2;
  let basketBack = BASKET_Z - BASKET_SIZE / 2;
  let basketFront = BASKET_Z + BASKET_SIZE / 2;
  let basketTop = BASKET_Y + BASKET_HEIGHT / 2;
  
  // Only check if we are at the same height as the basket
  if (baseCenterY < basketTop && baseCenterY > BASKET_Y - 1.0) {
    // Margin of 0.1 ensures NO penetration, but allows touching
    let margin = 0.1; 
    
    // We check using the FULL visual width (2.5)
    if (baseCenterX + baseHalfWidth > (basketLeft - margin) && 
        baseCenterX - baseHalfWidth < (basketRight + margin) &&
        baseCenterZ + baseHalfDepth > (basketBack - margin) && 
        baseCenterZ - baseHalfDepth < (basketFront + margin)) {
      return true; 
    }
  }

  // ==========================================
  // Section 2 & 3: ARMS (Normal Checks)
  // ==========================================
  // Upper Arm Collision Check
  let armRadius = 0.25; 
  m = mult(m, translate(0.0, BASE_HEIGHT, 0.0)); 
  let pShoulder = vec3(m[0][3], m[1][3], m[2][3]);
  let m_upper = mult(m, rotateZ(newTheta[UPPER_ARM]));
  let m_elbow = mult(m_upper, translate(0.0, UARM_HEIGHT, 0.0));
  let pElbow = vec3(m_elbow[0][3], m_elbow[1][3], m_elbow[2][3]);
  
  if (checkSegmentCollision(pShoulder, pElbow, armRadius, 5)) return true;

  // Lower Arm Collision Check
  let m_lower = mult(m_elbow, rotateZ(newTheta[LOWER_ARM]));
  let m_wrist = mult(m_lower, translate(0.0, LARM_HEIGHT, 0.0));
  let pWrist = vec3(m_wrist[0][3], m_wrist[1][3], m_wrist[2][3]);
  if (checkSegmentCollision(pElbow, pWrist, armRadius, 5)) return true;
  if (isSphereColliding(pWrist[0], pWrist[1], pWrist[2], WRIST_SPHERE_RADIUS)) return true;

  // ==========================================
  // 4. CLAW / GRIPPER (Detailed Finger Physics)
  // ==========================================
  // Gripper Collision Check
  let m_wristRotated = mult(m_wrist, rotateY(newTheta[WRIST_Z]));
  
  // Helper to calculate positions of Knuckle (Joint) and Tip
  function getFingerPoints(startM, offsetX, theta1, len1, theta2, len2) {
      // 1. Move to Base of finger
      let m = mult(startM, translate(offsetX, 0.0, 0.0));
      
      // 2. Rotate Inner Finger
      m = mult(m, rotateZ(theta1));
      m = mult(m, translate(0.0, len1, 0.0)); 
      // Capture Knuckle Position (End of inner, start of outer)
      let knuckle = vec3(m[0][3], m[1][3], m[2][3]);
      
      // 3. Rotate Outer Finger
      m = mult(m, rotateZ(theta2));
      m = mult(m, translate(0.0, len2, 0.0));
      // Capture Tip Position
      let tip = vec3(m[0][3], m[1][3], m[2][3]);
      
      return { knuckle, tip };
  }

  // Calculate Points for Bottom Finger
  let bottomFinger = getFingerPoints(
      m_wristRotated, 
      0.1, // Offset X
      newTheta[INNER_BOTTOM_GRIPPER], 
      INNERBOTTOM_GRIP_HEIGHT, 
      newTheta[OUTER_BOTTOM_GRIPPER], 
      OUTERBOTTOM_GRIP_HEIGHT
  );

  // Calculate Points for Upper Finger
  let upperFinger = getFingerPoints(
      m_wristRotated, 
      -0.1, // Offset X
      newTheta[INNER_UPPER_GRIPPER], 
      INNERUPPER_GRIP_HEIGHT, 
      newTheta[OUTER_UPPER_GRIPPER], 
      OUTERUPPER_GRIP_HEIGHT
  );

  // Check Collisions
  // We use radius 0.15 (half of grip width 0.3) to represent thickness
  let fingerThickness = 0.15;

  // Check Bottom Finger (Knuckle AND Tip)
  if (isSphereColliding(bottomFinger.knuckle[0], bottomFinger.knuckle[1], bottomFinger.knuckle[2], fingerThickness)) return true;
  if (isSphereColliding(bottomFinger.tip[0], bottomFinger.tip[1], bottomFinger.tip[2], fingerThickness)) return true;

  // Check Upper Finger (Knuckle AND Tip)
  if (isSphereColliding(upperFinger.knuckle[0], upperFinger.knuckle[1], upperFinger.knuckle[2], fingerThickness)) return true;
  if (isSphereColliding(upperFinger.tip[0], upperFinger.tip[1], upperFinger.tip[2], fingerThickness)) return true;

  // ==========================================
  // 5. BALL PUSHING
  // ==========================================
  if (!isBallHeld && !isFalling && isGameActive) {
    let distBottom = Math.sqrt((bottomFinger.tip[0] - BallPosX)**2 + (bottomFinger.tip[1] - BallPosY)**2 + (bottomFinger.tip[2] - BallPosZ)**2);
    let distUpper  = Math.sqrt((upperFinger.tip[0] - BallPosX)**2 + (upperFinger.tip[1] - BallPosY)**2 + (upperFinger.tip[2] - BallPosZ)**2);
    
    // If tips touch ball, trigger roll but allow move
    if (distBottom < (1.0 + 0.1) || distUpper < (1.0 + 0.1)) {
      triggerBallRolling(); 
      return false; 
    }
  }

  return false; 
}

// Update component color palette
function setComponentColor(palette) {
    const colorArray = [];
    for (let face = 0; face < 6; face++) {
        for (let v = 0; v < 6; v++) {
            colorArray.push(palette[face]);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0, // offset (cube starts at 0)
        flatten(colorArray)
    );
}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement() {
  canvas = document.getElementById("gl-canvas");
  const el = document.getElementById("main-container");

  // Robot joint sliders
  baseBodySlider = document.getElementById("base-slider");
  baseBodyText = document.getElementById("base-text");
  upperArmSlider = document.getElementById("uarm-slider");
  upperArmText = document.getElementById("uarm-text");
  lowerArmSlider = document.getElementById("larm-slider");
  lowerArmText = document.getElementById("larm-text");


  canvas = document.getElementById("gl-canvas");
  const container = document.getElementById("main-container");

  const robotX = document.getElementById("robot-x");
  const robotXText = document.getElementById("robot-x-text");

  // --- HELPER FOR SLIDERS ---
  function handleSliderUpdate(index, event, textElement, sliderElement) {
      var oldVal = theta[index];
      var targetVal = parseFloat(event.target.value);
      
      // Determine direction and step size (check every 2 degrees for performance)
      // Smaller step = more accurate but more calculation heavy
      var stepSize = 2.0; 
      var difference = targetVal - oldVal;
      var steps = Math.abs(difference) / stepSize;
      var direction = difference > 0 ? 1 : -1;

      var safeVal = oldVal;
      var collisionDetected = false;

      // "Sweep" check: Loop from old position to new position
      for (var i = 1; i <= steps; i++) {
          var checkAngle = oldVal + (i * stepSize * direction);
          
          // Ensure we don't overshoot the target on the last step
          if ((direction === 1 && checkAngle > targetVal) || (direction === -1 && checkAngle < targetVal)) {
              checkAngle = targetVal;
          }

          theta[index] = checkAngle; // Temporarily set angle

          // Check collision at this intermediate step
          if (checkProposedMove(theta, robotPosX)) {
              collisionDetected = true;
              console.log("Collision detected at intermediate angle: " + checkAngle);
              break; // Stop checking, we hit a wall
          } else {
              safeVal = checkAngle; // This angle is safe, save it
          }
      }

      // Final check for the exact target value if we haven't collided yet
      if (!collisionDetected) {
          theta[index] = targetVal;
          if (checkProposedMove(theta, robotPosX)) {
              collisionDetected = true;
          } else {
              safeVal = targetVal;
          }
      }

      // Apply the furthest SAFE value reached
      theta[index] = safeVal;
      sliderElement.value = safeVal; // Snap slider back to the wall
      textElement.innerHTML = safeVal.toFixed(1);

      // Check ball touch logic (keep your existing logic)
      if (!isBallHeld && checkArmBallCollision()) {
          triggerBallRolling();
      }
      
      draw();
  }

  // --- HELPER FOR ROBOT X SLIDER ---
  function handleRobotXUpdate(event, textElement, sliderElement) {
      var oldVal = robotPosX;
      var targetVal = parseFloat(event.target.value);
      
      // Step size for movement (check every 0.1 units)
      var stepSize = 0.1; 
      var difference = targetVal - oldVal;
      var steps = Math.abs(difference) / stepSize;
      var direction = difference > 0 ? 1 : -1;

      var safeVal = oldVal;
      var collisionDetected = false;

      // "Sweep" check: Loop from old X to new X
      for (var i = 1; i <= steps; i++) {
          var checkX = oldVal + (i * stepSize * direction);
          
          // Ensure we don't overshoot target
          if ((direction === 1 && checkX > targetVal) || (direction === -1 && checkX < targetVal)) {
              checkX = targetVal;
          }

          // Check collision at this intermediate spot
          // We pass the CURRENT theta angles, but the NEW checkX
          if (checkProposedMove(theta, checkX)) {
              collisionDetected = true;
              console.log("Robot X blocked at: " + checkX);
              break; // Stop, we hit a wall/stage
          } else {
              safeVal = checkX; // This spot is safe
          }
      }

      // Final check for the exact target value
      if (!collisionDetected) {
          if (checkProposedMove(theta, targetVal)) {
              collisionDetected = true;
          } else {
              safeVal = targetVal;
          }
      }

      // Update global variable to the furthest SAFE point
      robotPosX = safeVal;
      sliderElement.value = safeVal;
      textElement.innerHTML = safeVal.toFixed(1);

      // Check if we are pushing the ball
      if (!isBallHeld && checkArmBallCollision()) {
          triggerBallRolling();
      }
      
      draw();
  }

  // BASE BODY SLIDER - with ENHANCED collision detection
  baseBodySlider.oninput = function (event) {
    handleSliderUpdate(BASE_BODY, event, baseBodyText, baseBodySlider);
  };

  // UPPER ARM SLIDER - with ENHANCED collision detection
  upperArmSlider.oninput = function (event) {
    handleSliderUpdate(UPPER_ARM, event, upperArmText, upperArmSlider);
  };

  // LOWER ARM SLIDER - with ENHANCED collision detection
  lowerArmSlider.oninput = function (event) {
    handleSliderUpdate(LOWER_ARM, event, lowerArmText, lowerArmSlider);
  };

  innerGripSlider = document.getElementById("innerGrip-slider");
  innerGripText = document.getElementById("innerGrip-text");
  outerGripSlider = document.getElementById("outerGrip-slider");
  outerGripText = document.getElementById("outerGrip-text");

  // INNER GRIP SLIDER - with collision detection
  innerGripSlider.oninput = function (event) {
    let oldInnerTheta = theta[INNER_UPPER_GRIPPER];
    let oldInnerBottomTheta = theta[INNER_BOTTOM_GRIPPER];
    let requestedTheta = parseFloat(event.target.value);

    // Apply tentative values
    theta[INNER_UPPER_GRIPPER] = requestedTheta;
    theta[INNER_BOTTOM_GRIPPER] = -requestedTheta;
    
    // Check for self-collision (grippers touching each other)
    if (checkGripCenterCollision()) {
      theta[INNER_UPPER_GRIPPER] = oldInnerTheta;
      theta[INNER_BOTTOM_GRIPPER] = oldInnerBottomTheta;
      innerGripSlider.value = oldInnerTheta;
      console.log("Physical Limit Reached!");
      draw();
      return;
    }
    
    // Check for environment collision (Ground/Basket) using new Enhanced Logic
    if (checkProposedMove(theta, robotPosX)) {
      theta[INNER_UPPER_GRIPPER] = oldInnerTheta;
      theta[INNER_BOTTOM_GRIPPER] = oldInnerBottomTheta;
      innerGripSlider.value = oldInnerTheta;
      innerGripText.innerText = oldInnerTheta;
      console.log("Cannot move gripper: Collision detected");
      return;
    }
    
    // Check if arm touches ball
    if (!isBallHeld && checkArmBallCollision()) {
      triggerBallRolling();
    }

    innerGripText.innerText = theta[INNER_UPPER_GRIPPER];
    draw();
  };

  // OUTER GRIP SLIDER - with collision detection
  outerGripSlider.oninput = function (event) {
    let oldOuterTheta = theta[OUTER_UPPER_GRIPPER];
    let oldOuterBottomTheta = theta[OUTER_BOTTOM_GRIPPER];
    
    theta[OUTER_UPPER_GRIPPER] = parseFloat(event.target.value);
    theta[OUTER_BOTTOM_GRIPPER] = -parseFloat(event.target.value);
    
    // Check for environment collision (Ground/Basket) using new Enhanced Logic
    if (checkProposedMove(theta, robotPosX)) {
      theta[OUTER_UPPER_GRIPPER] = oldOuterTheta;
      theta[OUTER_BOTTOM_GRIPPER] = oldOuterBottomTheta;
      outerGripSlider.value = oldOuterTheta;
      outerGripText.innerText = oldOuterTheta;
      console.log("Cannot move gripper: Collision detected");
      return;
    }
    
    // Check if arm touches ball
    if (!isBallHeld && checkArmBallCollision()) {
      triggerBallRolling();
    }
    
    outerGripText.innerText = theta[OUTER_UPPER_GRIPPER];
    draw();
  };

  // ROBOT X POSITION - with ENHANCED collision detection
  robotX.oninput = function (event) {
    handleRobotXUpdate(event, robotXText, robotX);
  };

  // WRIST Z ROTATION - with ENHANCED collision detection
  var wristZSlider = document.getElementById("wrist-z-slider");
  var wristZText = document.getElementById("wrist-z-text");

  wristZSlider.oninput = function (event) {
    handleSliderUpdate(WRIST_Z, event, wristZText, wristZSlider);
  };

  // GRAB/RELEASE BUTTON
  const grabButton = document.getElementById("grab-button");
  grabButton.onclick = function () {
    if (!isBallHeld) {
      gripBall();
    } else {
      letGoGrip();
    }
    draw();
  };

  // RESTART BUTTON with confirmation modal
  var restartBtn = document.getElementById("restart-button");
  restartBtn.onclick = function () {
    // Call custom function
    showCustomConfirm(
      "RESTART GAME", 
      "Are you sure you want to restart?\n\nYour current win streak will be lost!", 
      function() {
        // --- This code runs ONLY if user clicks 'CONFIRM' ---
        if (autoResetTimer) {
          clearTimeout(autoResetTimer);
          autoResetTimer = null;
        }
        isDemoRunning = false;
        userRestart = true;
        restartGame();
        enableAllButton();
      }
    );
  };

  var demoBtn = document.getElementById("demo-button");
  demoBtn.onclick = function () {
    disableAllButton();
    startDemo();
  };

  // --- DEMO MODE CONTROLS ---
  var pauseDemoBtn = document.getElementById("pause-demo-btn");
  var restartDemoBtn = document.getElementById("restart-demo-btn");
  var quitDemoBtn = document.getElementById("quit-demo-btn");

  // Restart Demo Click
  restartDemoBtn.onclick = function() {
      // Disable buttons immediately to prevent spamming
      restartDemoBtn.disabled = true;
      quitDemoBtn.disabled = true;
      
      // Reset variables and start animation again
      restartGame(); 
      isDemoRunning = true;
      demoAnimationPhase = DEMO_ST_MOVE_ROBOT;
      updateScoreDisplay(); 
      requestAnimationFrame(demo);
  };

  // Quit Demo Click
  quitDemoBtn.onclick = function() {
    stopDemo(); // Returns to normal game state
  };

  pauseDemoBtn.onclick = function() {
    pauseDemo = !pauseDemo;

    if (pauseDemo) {
      // Pause the demo
      cancelAnimationFrame(demoAnimationId);
      pauseDemoBtn.innerHTML = "Continue Demo";
      
      // Override properties to keep the button looking "active"
      pauseDemoBtn.style.backgroundImage = "none"; 
      pauseDemoBtn.style.backgroundColor = "#059669";
      pauseDemoBtn.style.color = "#000000";
    } else {
      // Continue the demo
      pauseDemoBtn.innerHTML = "Pause Demo";
      
      // Reset properties to let the CSS file take over again
      pauseDemoBtn.style.backgroundImage = "";
      pauseDemoBtn.style.backgroundColor = ""; 
      pauseDemoBtn.style.color = ""; 
      
      demoAnimationId = requestAnimationFrame(demo);
    }
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

// Helper: Show Custom Modal
// takes a title, a message, and a function to run if the user clicks "CONFIRM"
function showCustomConfirm(title, message, onConfirmCallback) {
  const overlay = document.getElementById("custom-modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const msgEl = document.getElementById("modal-message");
  const confirmBtn = document.getElementById("modal-confirm-btn");
  const cancelBtn = document.getElementById("modal-cancel-btn");

  // Set content
  titleEl.innerText = title;
  msgEl.innerHTML = message.replace(/\n/g, "<br>"); // Handle line breaks

  // Show modal
  overlay.classList.remove("hidden");
  overlay.classList.add("active");

  // Define cleanup function to remove listeners and hide modal
  function closeAndCleanup() {
    overlay.classList.remove("active");
    setTimeout(() => overlay.classList.add("hidden"), 300); // wait for animation
    
    // Remove event listeners to prevent stacking logic
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  }

  // Handle Confirm Click
  confirmBtn.onclick = function() {
    closeAndCleanup();
    onConfirmCallback(); // Run the actual game restart logic
  };

  // Handle Cancel Click
  cancelBtn.onclick = function() {
    closeAndCleanup();
    enableAllButton(); // Re-enable interface if user cancelled
  };
}

// Helper: Show Game Over Modal
function showGameOver(message) {
  const overlay = document.getElementById("game-over-modal");
  const msgEl = document.getElementById("game-over-message");
  const restartBtn = document.getElementById("game-over-btn");

  // Set the failure message
  msgEl.innerText = message;

  // Show modal
  //if (loseGame) {
    overlay.classList.remove("hidden");
    overlay.classList.add("active");
  //} 
  
  // Handle Restart Click
  restartBtn.onclick = function() {
    overlay.classList.remove("active");
    overlay.classList.add("hidden");
    
    // Reset the game
    gameScore = 0; // Reset score on failure
    isGameActive = false; // CRITICAL: Re-enable game state
    ballWasReleased = false; // Reset release flag
  
    restartGame();
    console.log("helo");
    enableAllButton();

    draw();
  };
}

// Release the ball from the gripper
function letGoGrip() {
  const grabButton = document.getElementById("grab-button");
  isBallHeld = false;
  isFalling = true;
  isAnimationRunning = true;
  animationPhase = ST_DROPPING;
  ballWasReleased = true;

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

// Grab the ball with the gripper
function gripBall() {
  const grabButton = document.getElementById("grab-button");
  // ONLY GRAB IF COLLIDING (The "Green" logic)
  if (checkGripCenterCollision(wristMatrix)) {
    isBallHeld = true;
    grabButton.innerText = "Release Ball";

    // Automatically close fingers to "touch" the ball
    theta[INNER_UPPER_GRIPPER] = 55;
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

  // Set the viewport and clear color (subtle blue-gray instead of white)
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.96, 0.96, 0.98, 1.0);

  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  // Compile shaders
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Position Buffer
  pBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Color Buffer
  colBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // Normal Buffer
  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
  
  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  // Uniform Locations
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  
  // Lighting uniforms
  normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
  lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
  lightColorLoc = gl.getUniformLocation(program, "lightColor");
  materialShininessLoc = gl.getUniformLocation(program, "materialShininess");
  
  isBallLoc = gl.getUniformLocation(program, "isBall");
  colColorLoc = gl.getUniformLocation(program, "collisionColor");
  
  // Set Light Properties
  // Position light above and to the side for good shadows
  gl.uniform3fv(lightPositionLoc, flatten(vec3(8.0, 12.0, 8.0)));
  gl.uniform3fv(lightColorLoc, flatten(vec3(1.0, 0.98, 0.95)));
  
  // Set default material shininess
  gl.uniform1f(materialShininessLoc, 32.0);
}

function normalMatrixFromMat4(m) {
  // Extract 3x3 normal matrix from 4x4 model-view matrix
  return mat3(
    m[0][0], m[1][0], m[2][0],
    m[0][1], m[1][1], m[2][1],
    m[0][2], m[1][2], m[2][2]
  );
}

// Render the graphics for viewing
function render() {
  // Clear the color buffer and the depth buffer before rendering a new frame
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Pass the projection matrix from JavaScript to the GPU for use in shader
  // ortho(left, right, bottom, top, near, far)

  let left = -16 / zoomObject;
  let right = 16 / zoomObject;
  let bottom = -9 / zoomObject;
  let top = 9 / zoomObject;

  projectionMatrix = ortho(left, right, bottom, top, -10, 10);
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

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
  modelViewMatrix = mult(modelViewMatrix, translate(robotPosX, -5.3, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotateY(theta[BASE_BODY]));
  baseBody();

  gl.uniform1i(isBallLoc, true);
  gl.uniform4fv(colColorLoc, flatten(vec4(0.7, 0.7, 0.7, 1.0))); // Gray sphere

  // Move to top of base
  var shoulderMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
  // Scale it to match or be slightly bigger than wrist sphere
  var shoulderConnectorMatrix = mult(shoulderMatrix, scale(WRIST_SPHERE_RADIUS * 1.2, WRIST_SPHERE_RADIUS * 1.2, WRIST_SPHERE_RADIUS * 1.2));

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(shoulderConnectorMatrix));
  var normalMatrix = normalMatrixFromMat4(shoulderConnectorMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 45.0);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphereCount);
  gl.uniform1i(isBallLoc, false);

  // Move to Upper Arm and draw
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[UPPER_ARM]));
  upperArm();

  // Move to Lower Arm and draw
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, UARM_HEIGHT, 0.0));

  // Draw elbow connector sphere
  gl.uniform1i(isBallLoc, true);
  gl.uniform4fv(colColorLoc, flatten(vec4(0.7, 0.7, 0.7, 1.0))); // Gray sphere
  var elbowConnectorMatrix = mult(modelViewMatrix, scaleWristConn);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(elbowConnectorMatrix));
  var normalMatrix = normalMatrixFromMat4(elbowConnectorMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 45.0);
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphereCount);
  gl.uniform1i(isBallLoc, false);

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

  // DRAW BALL
  gl.uniform1i(isBallLoc, true);

  if (isBallHeld) {
    gl.uniform4fv(colColorLoc, flatten(vec4(0.0, 0.0, 1.0, 1.0))); // Blue
    ballModelViewMatrix = mult(
      wristMatrix,
      translate(0.0, CLAW_CENTER * 0.5, 0.0)
    );
  } else {
    if (ballIsRolling) updateBallRolling(); // Handle rolling FIRST
    if (isFalling) releaseBall();           // Then handle falling
    if (isAnimationRunning) rotateGrip();   // Then handle animation

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
  gl.uniform4fv(colColorLoc, flatten(vec4(0.6, 0.3, 0.1, 0.2)));
  basket(false); // Call with drawOutline = false

  // PASS 2: Draw the Outline (Fully Opaque)
  gl.uniform4fv(colColorLoc, flatten(vec4(0.6, 0.3, 0.1, 1.0)));
  basket(true); // Call with drawOutline = true

  gl.disable(gl.BLEND); // Good practice to disable after use

  // Draw stage platform (circular cylinder)
  gl.uniform1i(isBallLoc, true);
  gl.uniform4fv(colColorLoc, flatten(vec4(0.15, 0.15, 0.17, 1.0)));

  var stageMatrix = mat4();
  stageMatrix = mult(stageMatrix, rotateX(viewRotationX));
  stageMatrix = mult(stageMatrix, rotateY(viewRotationY));
  stageMatrix = mult(stageMatrix, translate(ballStageX, ballStageY - 0.15, ballStageZ));
  // Scale: X and Z control radius, Y controls height
  stageMatrix = mult(stageMatrix, scale(ballStageVisualRadius, 0.3, ballStageVisualRadius));

  modelViewMatrix = stageMatrix;
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  var normalMatrix = normalMatrixFromMat4(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 16.0);
  
  gl.drawArrays(gl.TRIANGLES, cylinderStart, cylinderCount);

  gl.uniform1i(isBallLoc, false);
  
  var floorMatrix = mat4();
  floorMatrix = mult(floorMatrix, rotateX(viewRotationX));
  floorMatrix = mult(floorMatrix, rotateY(viewRotationY));
  floorMatrix = mult(floorMatrix, translate(0, FLOOR_Y - 0.1, 0)); // Just below floor level
  floorMatrix = mult(floorMatrix, scale(40, 0.2, 40));

  modelViewMatrix = floorMatrix;
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

  var normalMatrix = normalMatrixFromMat4(modelViewMatrix);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 16.0);
  
  gl.drawArrays(gl.TRIANGLES, floorStart, floorCount);

  if (isFalling || isAnimationRunning || ballIsRolling) {
    window.requestAnimationFrame(draw);
  }

  // Check for Game Over Type 1 (ball off stage) only when appropriate
  if (!isBallHeld && !isFalling) {
    checkGameOver();
  }
}

function basket(drawOutline) {
  // Scale the cube to look like a container
  var s = scale(BASKET_SIZE, BASKET_HEIGHT, BASKET_SIZE);
  var t = mult(modelViewMatrix, s);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 8.0);

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
  
  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  
  // Ball is very shiny
  gl.uniform1f(materialShininessLoc, 120.0);
  
  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphereCount);
}

function wristConnector() {
  // Use the same modelViewMatrix logic, but draw the sphere part of the buffer
  var t = mult(modelViewMatrix, instanceMatrixWristConn);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  
  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 45.0);
  
  // Change from cubeLength to your sphere variables
  gl.drawArrays(gl.TRIANGLES, sphereStart, sphereCount);
}

// Helper function to draw base body
function baseBody() {
  setComponentColor(PRIMARY_PALETTE);
  var t = mult(modelViewMatrix, instanceMatrixBase);
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  
  // Calculate and send normal matrix
  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  
  // Set material shininess (metallic robot parts)
  gl.uniform1f(materialShininessLoc, 32.0);
  
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}


// Helper function to draw upper arm
function upperArm() {
  setComponentColor(PRIMARY_PALETTE);

  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixUArm);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  
  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 50.0);
  
  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw lower arm
function lowerArm() {
  setComponentColor(PRIMARY_PALETTE);

  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixLArm);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));
  
  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 50.0);
  
  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Inner Upper Grip
function InnerUpperGrip() {
  setComponentColor(SECONDARY_PALETTE);

  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixIUGrip);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 60.0);

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Inner Bottom Grip
function InnerBottomGrip() {
  setComponentColor(SECONDARY_PALETTE);

  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixIBGrip);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 60.0);

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Outer Upper Grip
function OuterUpperGrip() {
  setComponentColor(SECONDARY_PALETTE);

  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixOUGrip);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 60.0);

  // Draw the primitive / geometric shape
  gl.drawArrays(gl.TRIANGLES, 0, cubeLength);
}

// Helper function to draw Outer Bottom Grip
function OuterBottomGrip() {
  setComponentColor(SECONDARY_PALETTE);
  
  // Set the shape using instance matrix
  var t = mult(modelViewMatrix, instanceMatrixOBGrip);

  // Pass the model view matrix from JavaScript to the GPU for use in shader
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

  var normalMatrix = normalMatrixFromMat4(t);
  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
  gl.uniform1f(materialShininessLoc, 45.0);

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

// Handles the ball falling physics with gravity and bouncing
function releaseBall() {
  fetchBallLocation();
  rotateGrip();

  // Apply gravity to velocity
  ballVelocity.y -= GRAVITY;

  // Update position based on velocity
  ballCurrentPos[1] += ballVelocity.y;
  ballCurrentPos[0] += ballVelocity.x;
  ballCurrentPos[2] += ballVelocity.z || 0;

  // Basket dimensions
  const basketTop = BASKET_Y;
  const basketBottom = BASKET_Y - BASKET_HEIGHT / 2;
  const basketLeft = BASKET_X - BASKET_SIZE / 2;
  const basketRight = BASKET_X + BASKET_SIZE / 2;
  const basketBack = BASKET_Z - BASKET_SIZE / 2;
  const basketFront = BASKET_Z + BASKET_SIZE / 2;

  // Get ball edges
  const ballLeft = ballCurrentPos[0] - ballRadius;
  const ballRight = ballCurrentPos[0] + ballRadius;
  const ballTop = ballCurrentPos[1] + ballRadius;
  const ballBottom = ballCurrentPos[1] - ballRadius;

  // ===== RIM COLLISION DETECTION =====
  if (
    ballVelocity.y < 0 &&
    ballBottom <= basketTop &&
    ballTop >= basketTop - 0.3
  ) {
    // Check LEFT rim collision
    if (ballRight > basketLeft && ballLeft < basketLeft && !hasHitRim) {
      hasHitRim = true;
      const ballCenterX = ballCurrentPos[0];

      if (ballCenterX > basketLeft) {
        ballVelocity.x = 0.03;
        ballVelocity.y *= 0.5;
        ballCurrentPos[0] = Math.max(
          ballCurrentPos[0],
          basketLeft + ballRadius + 0.05
        );
      } else {
        ballVelocity.x = -0.08;
        ballVelocity.y = Math.abs(ballVelocity.y) * 0.3;
        ballCurrentPos[0] = basketLeft - ballRadius - 0.2;
      }
    }

    // Check RIGHT rim collision
    if (ballLeft < basketRight && ballRight > basketRight && !hasHitRim) {
      hasHitRim = true;
      const ballCenterX = ballCurrentPos[0];

      if (ballCenterX < basketRight) {
        ballVelocity.x = -0.03;
        ballVelocity.y *= 0.5;
        ballCurrentPos[0] = Math.min(
          ballCurrentPos[0],
          basketRight - ballRadius - 0.05
        );
      } else {
        ballVelocity.x = 0.08;
        ballVelocity.y = Math.abs(ballVelocity.y) * 0.3;
        ballCurrentPos[0] = basketRight + ballRadius + 0.2;
      }
    }
  }

  // ===== LANDING DETECTION =====
  const isOverBasket =
    ballCurrentPos[0] > basketLeft && ballCurrentPos[0] < basketRight &&
    ballCurrentPos[2] > basketBack && ballCurrentPos[2] < basketFront;

  if (isOverBasket) {
    const wallLeft = basketLeft + ballRadius;
    const wallRight = basketRight - ballRadius;

    // Left wall collision
    if (
      ballCurrentPos[1] < basketTop &&
      ballCurrentPos[0] <= wallLeft &&
      ballVelocity.x < 0
    ) {
      ballCurrentPos[0] = wallLeft;
      ballVelocity.x = -ballVelocity.x * 0.5;
    }

    // Right wall collision
    if (
      ballCurrentPos[1] < basketTop &&
      ballCurrentPos[0] >= wallRight &&
      ballVelocity.x > 0
    ) {
      ballCurrentPos[0] = wallRight;
      ballVelocity.x = -ballVelocity.x * 0.5;
    }

    // FLOOR BOUNCE - Ball hits basket bottom
    if (ballCurrentPos[1] <= basketBottom) {
      ballCurrentPos[1] = basketBottom;

      if (Math.abs(ballVelocity.y) > 0.008) {
        ballVelocity.y = -ballVelocity.y * 0.4;
        ballVelocity.x *= 0.92;
      } else {
        ballVelocity.y = 0;
        ballVelocity.x *= 0.88;

        if (Math.abs(ballVelocity.x) < 0.005) {
          ballVelocity.x = 0;
          isFalling = false;
          hasHitRim = false;
          gameStatus = true;
          scoreCount();
          setTimeout(enableAllButton, 5000);
        }
      }
    }
  } else {
    // Ball is outside basket - check floor collision
    if (ballCurrentPos[1] <= FLOOR_Y) {
      ballCurrentPos[1] = FLOOR_Y;

      if (Math.abs(ballVelocity.y) > 0.015) {
        ballVelocity.y = -ballVelocity.y * BOUNCE_DAMPING;
        ballVelocity.x *= 0.88;
        ballVelocity.z *= 0.88; // ← ADD: Also dampen Z velocity
      } else {
        ballVelocity.y = 0;
        ballVelocity.x *= 0.92;
        ballVelocity.z *= 0.92; // ← ADD: Also dampen Z velocity

        if (Math.abs(ballVelocity.x) < 0.008 && Math.abs(ballVelocity.z) < 0.008) {
          ballVelocity.x = 0;
          ballVelocity.z = 0;
          isFalling = false;
          hasHitRim = false;
          ballIsRolling = false;
          gameStatus = false;
          
          // ← ADD: GAME OVER TYPE 2 - Trigger modal AFTER ball has landed
          if (!isDemoRunning && (ballWasReleased || loseGame)) {
            disableAllButton();
            
            if (loseGame) {
              showGameOver("REASON:\nThe ball fell off the stage!");
              loseGame = false; // Reset flag
            } else {
              showGameOver("REASON:\nThe ball is not in the basket!");
            }
            
            gameStatus = false;
            isFalling = false; 
            return; 
          }
          
          scoreCount();
          setTimeout(enableAllButton, 5000);
        }
      }
    }
  }

  // Sync variables
  BallPosX = ballCurrentPos[0];
  BallPosY = ballCurrentPos[1];
  BallPosZ = ballCurrentPos[2]; // ← Make sure Z is also synced

  // Check game over (but only after ball has fully settled)
  if (!isFalling && !isBallHeld) {
    checkGameOver();
  }
}

// Handle ball rolling on stage when touched by arm
function updateBallRolling() {
  if (!ballIsRolling || isBallHeld || isFalling) return;
  
  // 1. Apply Velocity to Position (X and Z)
  ballCurrentPos[0] += ballVelocity.x;
  ballCurrentPos[2] += ballVelocity.z; 

  var distFromCenter = Math.sqrt(
    (ballCurrentPos[0] - ballStageX) ** 2 + 
    (ballCurrentPos[2] - ballStageZ) ** 2
  );
  console.log("Ball distance from stage center:", distFromCenter.toFixed(2), "/ Radius:", ballStageRadius);
  console.log("Ball Y position:", ballCurrentPos[1].toFixed(2));
  
  // 2. Apply Friction (Slow down both X and Z)
  ballVelocity.x *= FRICTION; 
  ballVelocity.z *= FRICTION;
  
  // 3. Check if ball falls off stage
  if (!isBallOnStage()) {
    console.log("Ball fell off the stage!");
    isFalling = true;        // ← Start falling physics
    ballIsRolling = false;   // ← Stop rolling
    loseGame = true;         // ← Mark as lost
    // DON'T call game over here - let it fall first!
  }
  
  // 4. Stop rolling if velocity is very low
  if (Math.abs(ballVelocity.x) < 0.001 && Math.abs(ballVelocity.z) < 0.001) {
    console.log("⚪ Ball stopped rolling (friction)");
    ballIsRolling = false;
    ballVelocity.x = 0;
    ballVelocity.z = 0;
  }
  
  // Update globals
  BallPosX = ballCurrentPos[0];
  BallPosY = ballCurrentPos[1];
  BallPosZ = ballCurrentPos[2];
}

function rotateGrip() {
  switch (animationPhase) {
    case ST_DROPPING:
      if (theta[WRIST_Z] > -180) {
        theta[WRIST_Z] -= GRIPDROPROTATIONSPEED;
      } else {
        theta[WRIST_Z] = -180;
        animationPhase = ST_RECOVERING;
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

// Determine which side of the gripper the ball is on
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

// Check if gripper center collides with ball for grabbing
function checkGripCenterCollision() {
  // 1. BALL WORLD POSITION
  var ballMV = mult(mult(rotateX(viewRotationX), rotateY(viewRotationY)), translate(BallPosX, BallPosY, BallPosZ)
  );

  const ballX = ballMV[0][3];
  const ballY = ballMV[1][3];
  const ballZ = ballMV[2][3];

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

  // 3. DISTANCE CALCULATION
  const dist = Math.sqrt(
    (gripX - ballX) ** 2 + (gripY - ballY) ** 2 + (gripZ - ballZ) ** 2
  );

  // 4. THE "STRICT GRIP" LOGIC
  // This forces the ball's center to be very close to the palm's center.
  const captureRadius = 1;

  // This triggers only when the ball is mostly "swallowed" by the gripper bubble
  return dist < captureRadius && theta[INNER_UPPER_GRIPPER] > 60 && theta[OUTER_UPPER_GRIPPER] > -35;
}

// Check if robot arm touches ball (when not held)
function checkArmBallCollision() {
  if (isBallHeld || isFalling || ballIsRolling) return false;
  
  var gripCenterMatrix = mult(wristMatrix, translate(0.0, CLAW_CENTER * 0.5, 0.0));
  var gripX = gripCenterMatrix[0][3];
  var gripY = gripCenterMatrix[1][3];
  var gripZ = gripCenterMatrix[2][3];
  
  var dist = Math.sqrt(
    (gripX - ballCurrentPos[0]) ** 2 + 
    (gripY - ballCurrentPos[1]) ** 2 + 
    (gripZ - ballCurrentPos[2]) ** 2
  );
  
  // This ensures the arm must visually touch the ball before it moves.
  return dist < (ballRadius + 0.4);
}

// Trigger ball rolling when arm touches it
function triggerBallRolling() {
  if (ballIsRolling || !isGameActive) return;
  
  ballIsRolling = true;
  
  // 1. Calculate Vector
  var gripCenterMatrix = mult(wristMatrix, translate(0.0, CLAW_CENTER * 0.5, 0.0));
  var pushDirX = ballCurrentPos[0] - gripCenterMatrix[0][3];
  var pushDirZ = ballCurrentPos[2] - gripCenterMatrix[2][3];
  
  // 2. Normalize
  var pushMag = Math.sqrt(pushDirX ** 2 + pushDirZ ** 2);
  
  if (pushMag > 0.01) {
    var pushStrength = 0.10; 
    
    ballVelocity.x = (pushDirX / pushMag) * pushStrength;
    ballVelocity.z = (pushDirZ / pushMag) * pushStrength;
    ballVelocity.y = 0;
  }
  
  if (!isFalling && !isAnimationRunning) {
    requestAnimationFrame(draw);
  }
}

// Update score based on game state
function scoreCount() {
  // Skip scoring during demo
  if (isDemoRunning) {
    // The ball will just sit in the basket until user clicks a button.
    return;
  }

  if (gameStatus) {
    // Success: Auto-reset after 5 seconds
    gameScore++;
    if (gameScore >= personalRecord) personalRecord = gameScore;
    console.log("Game score:", gameScore);
    console.log("personalRecord:", personalRecord);

    setTimeout(() => {
      restartGame();
      enableAllButton();
    }, 5000);
  } else {
    // Fail: No auto-reset, user must click OK on alert
    gameScore = 0;
  }

  updateScoreDisplay();
}


// Update the score display UI
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

// Reset the game to initial state
function restartGame() {
  // If demo was running, end it now
  if (isDemoRunning) {
    isDemoRunning = false;
  }
  
  // Reset game state flags
  isGameActive = true; 
  ballWasReleased = false;
  isBallHeld = false;
  isFalling = false;
  ballIsRolling = false;  
  hasHitRim = false;
  
  // 1. Reset Robot Angles (theta) and animation state
  theta = [0, 0, 0, 30, -38, -30, 38, 0];

  animationPhase = ST_IDLE;
  isAnimationRunning = false;

  // 2. Reset Robot Position
  robotPosX = 0.0;

  // 3. Reset Ball Physics and Position IMMEDIATELY
  ballVelocity = { x: 0, y: 0, z: 0 };
  
  // Reset Ball Position to its original starting spot (initial values)
  BallPosX = -12.0;
  BallPosY = -5.0;
  BallPosZ = 0.0;
  ballCurrentPos = vec3(BallPosX, BallPosY, BallPosZ);

  // 4. Reset game variables (keep personalRecord)
  if (userRestart) userRestartGame();

  // 5. Reset UI elements and controls
  updateUI();
  updateScoreDisplay();
  GripControl(innerGripSlider, outerGripSlider);

  // 6. Force a brief delay before allowing checkGameOver to run again
  // Prevents the modal from re-triggering immediately
  setTimeout(() => {
    isGameActive = true; // Confirm it's active after everything is reset
  }, 100);

  // 7. Re-render the scene
  draw();
}

// Handle full game restart (includes score reset)
function userRestartGame() {
  gameStatus = false;
  gameScore = 0;
  userRestart = false;
  gameStatusShowText = "Let us start the game 🤞";


  // Reset viewing angle to original position
  viewRotationX = -1;
  viewRotationY = 0;
 
  // Reset zoom to original
  zoomObject = 1.0;

  var personalBestText = document.getElementById("game-personal-best-text");
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

// Check if ball is on stage
function isBallOnStage() {
  // Calculate horizontal distance from ball to stage center
  var distFromCenter = Math.sqrt(
    (ballCurrentPos[0] - ballStageX) ** 2 + 
    (ballCurrentPos[2] - ballStageZ) ** 2
  );
  
  // If the ball gets too close to the edge, we say it's "off" and gravity takes over.
  var safeZoneRadius = ballStageRadius - 0.5;

  var isAtStageHeight = ballCurrentPos[1] >= (ballStageY - 0.2) && 
                         ballCurrentPos[1] <= (ballStageY + 2.0);

  return ballCurrentPos[1] >= ballStageY && distFromCenter <= safeZoneRadius;
}

// Check for game over conditions
function checkGameOver() {
  // Skip game over checks during demo
  if (isDemoRunning) return;

  // ⭐ NEW: Skip if ball is currently falling - let physics finish!
  if (isFalling) return;
   
  // Skip if ball was intentionally released
  if (ballWasReleased) return;
   
  const basketLeft = BASKET_X - BASKET_SIZE / 2;
  const basketRight = BASKET_X + BASKET_SIZE / 2;
  const basketFront = BASKET_Z + BASKET_SIZE / 2;
  const basketBack = BASKET_Z - BASKET_SIZE / 2;
   
  // Check if ball is inside basket area
  const isInBasket = ballCurrentPos[0] > basketLeft && 
                     ballCurrentPos[0] < basketRight &&
                     ballCurrentPos[2] > basketBack && 
                     ballCurrentPos[2] < basketFront;
   
  // GAME OVER TYPE 1: Ball pushed/rolled off the stage
  if (!isBallHeld && !isBallOnStage() && !isInBasket) {
    if (isGameActive) {   
      isGameActive = false;
      ballIsRolling = false;
      ballVelocity = { x: 0, y: 0, z: 0 };
      
      // Disable controls
      disableAllButton();

      // TRIGGER NEW MODAL
      showGameOver("REASON:\nThe ball fell off the stage!");
    }
  }
}


// Here try demo
// Demo animation states
const DEMO_ST_IDLE = 0;
const DEMO_ST_MOVE_ROBOT = 1;
const DEMO_ST_UPPER_ARM = 2;
const DEMO_ST_LOWER_ARM = 3;
const DEMO_ST_INNER_GRIP = 4;
const DEMO_ST_OUTER_GRIP = 5;
const DEMO_ST_MOVE_ROBOT_REST = 6;
const DEMO_ST_GRIP = 7;
const DEMO_ST_GRIP_UPPER_ARM = 8;
const DEMO_ST_GRIP_LOWER_ARM = 9;
const DEMO_ST_GRIP_BASE_ROTATE = 10;
const DEMO_ST_GRIP_ROBOT_MOVE = 11;
const DEMO_ST_GRIP_LOWER_ARM_DOWN = 12;
const DEMO_ST_LETGO_GRIP = 13;

// Animation state
let demoAnimationPhase = DEMO_ST_IDLE;
let isDemoRunning = false;

// Animation speed (degrees or units per frame)
const DEMO_ROBOT_SPEED = 0.1;
const DEMO_ARM_SPEED = 1.0;
const DEMO_GRIP_SPEED = 1.5;

const demoTargets = {
  robotPosX: -5,
  upperArm: 40,
  lowerArm: 90,
  innerUpper:90,
  innerBottom: -90,
  outerUpper: -34,
  outerBottom: 34,
  // Grip sequence targets
  gripUpperArm: 7,
  gripBaseRotation: 180,
  gripRobotPosX: 1.9,
  gripLowerArm: 40,
  gripLowerArmDrop: 85,
};

function startDemo() {
  // Only show confirmation dialog if not restarting
  document.getElementById("pause-demo-btn").disabled = false;
  if (!restartDemo) {
    showCustomConfirm(
      "GAME DEMONSTRATION",
      "Start Gameplay Demonstration?\n\nAll current progress will be lost!",
      function() {
        initializeDemo();
      }
    );
  } else {
    // If restarting, just initialize directly
    initializeDemo();
  }
}

function initializeDemo() {
  // Cancel any existing demo animation before starting new one
  if (demoAnimationId) {
    cancelAnimationFrame(demoAnimationId);
  }

  // 1. Swap Button Visibility
  document.getElementById("game-controls").style.display = "none";
  document.getElementById("demo-controls").style.display = "block";

  // 2. Set up restart button
  const restart_demo = document.getElementById("restart-demo-btn");
  restart_demo.onclick = function () {
    restartDemo = true;
    startDemo();
  }

  // 3. Start Demo
  restartGame(); 

  robotStartX = robotPosX;
  isDemoRunning = true;
  demoAnimationPhase = DEMO_ST_MOVE_ROBOT;
  restartDemo = false; // Reset flag after using it
  disableAllButton(); // Disables sliders/keyboard
  updateScoreDisplay(); 
  demoAnimationId = requestAnimationFrame(demo);
}

// Main demo animation function with switch case
function demo() {

  if (!isDemoRunning || pauseDemo) return;

  switch (demoAnimationPhase) {
    case DEMO_ST_MOVE_ROBOT:
    // Move robot halfway to target X position
    const halfwayPoint = (robotStartX + demoTargets.robotPosX) / 2;
    
    if (Math.abs(robotPosX - halfwayPoint) > 0.05) {
      if (robotPosX > halfwayPoint) {
        robotPosX -= DEMO_ROBOT_SPEED;
      } else {
        robotPosX += DEMO_ROBOT_SPEED;
      }
      updateSlider("robot-x", robotPosX, "robot-x-text");
    } else {
      robotPosX = halfwayPoint;
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
        demoAnimationPhase = DEMO_ST_MOVE_ROBOT_REST;
      }
      break;


    // Start add here
    case DEMO_ST_MOVE_ROBOT_REST:
      // Move robot the rest of the way to target X position
      if (Math.abs(robotPosX - demoTargets.robotPosX) > 0.05) {
        if (robotPosX > demoTargets.robotPosX) {
          robotPosX -= DEMO_ROBOT_SPEED;
        } else {
          robotPosX += DEMO_ROBOT_SPEED;
        }
        updateSlider("robot-x", robotPosX, "robot-x-text");
      } else {
        robotPosX = demoTargets.robotPosX;
        demoAnimationPhase = DEMO_ST_GRIP;
      }
      break;

    // Until here

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
        demoAnimationPhase = DEMO_ST_GRIP_LOWER_ARM_DOWN;
      }
      break;

    case DEMO_ST_GRIP_LOWER_ARM_DOWN:
      // Move lower arm to 40 degrees
      if (Math.abs(theta[LOWER_ARM] - demoTargets.gripLowerArmDrop) > 0.5) {
        if (theta[LOWER_ARM] > demoTargets.gripLowerArmDrop) {
          theta[LOWER_ARM] -= DEMO_ARM_SPEED;
        } else {
          theta[LOWER_ARM] += DEMO_ARM_SPEED;
        }
        updateSlider("larm-slider", theta[LOWER_ARM], "larm-text");
      } else {
        theta[LOWER_ARM] = demoTargets.gripLowerArmDrop;
        // After positioning the lower arm, proceed to release the ball
        demoAnimationPhase = DEMO_ST_LETGO_GRIP;
      }
      break;

    case DEMO_ST_LETGO_GRIP:
      // 1. Force a draw to sync the matrices
      draw();

      // 2. Perform the actual release logic
      letGoGrip();

      // 3. Reset the rim collision flag for the new drop
      hasHitRim = false;
      ballVelocity = { x: 0, y: 0 }; // Start with no horizontal movement

      // 4. End Demo but keep draw() running for the fall
      demoAnimationPhase = DEMO_ST_IDLE;

      // 5. Reset the Demo Control Buttons
      // This lets the user choose what to do next
      document.getElementById("restart-demo-btn").disabled = false;
      document.getElementById("quit-demo-btn").disabled = false;
      document.getElementById("pause-demo-btn").disabled = true;

      // 6. Ensure the falling animation keeps looping
      // Since demo stopped, we need to make sure the global loop is aware
      if (isFalling) {
        requestAnimationFrame(draw);
      }

      console.log("Ball released from Demo!");
      break;
  }

  // Update the display
  draw();


  // Continue animation loop ONLY if still actively animating
  if (isDemoRunning && demoAnimationPhase !== DEMO_ST_IDLE) {
    demoAnimationId = requestAnimationFrame(demo);
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
  
  // Swap buttons back
  document.getElementById("demo-controls").style.display = "none";
  document.getElementById("game-controls").style.display = "block";
  
  // Reset game to fresh state for the user
  userRestart = true;
  restartGame();
  enableAllButton();
}

function fetchBallLocation() {
  BallPosX = ballCurrentPos[0];
  BallPosY = ballCurrentPos[1];
  BallPosZ = ballCurrentPos[2];
}

/*-----------------------------------------------------------------------------------*/