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
var theta = [0, 0, 0], points = [], colors = [];

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

// Execute the init() function when the web page has fully loaded
window.onload = function init()
{
    // Primitive (geometric shape) initialization
    var cube = colorCube();
    points = cube.Point;
    colors = cube.Color;

    // WebGL setups
    getUIElement();
    configWebGL();
    render();
}

// Retrieve all elements from HTML and store in the corresponding variables
function getUIElement()
{
    canvas = document.getElementById("gl-canvas");

    baseBodySlider = document.getElementById("base-slider");
    baseBodyText = document.getElementById("base-text");
    upperArmSlider = document.getElementById("uarm-slider");
    upperArmText = document.getElementById("uarm-text");
    lowerArmSlider = document.getElementById("larm-slider");
    lowerArmText = document.getElementById("larm-text");

    baseBodySlider.onchange = function(event) 
	{
		theta[BASE_BODY] = event.target.value;
		baseBodyText.innerHTML = theta[BASE_BODY];
        draw();
    };

    upperArmSlider.onchange = function(event) 
	{
		theta[UPPER_ARM] = event.target.value;
		upperArmText.innerHTML = theta[UPPER_ARM];
        draw();
    };

    lowerArmSlider.onchange = function(event) 
	{
		theta[LOWER_ARM] = event.target.value;
		lowerArmText.innerHTML = theta[LOWER_ARM];
        draw();
    };
}

// Configure WebGL Settings
function configWebGL()
{
    // Initialize the WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    
    if(!gl)
    {
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
}

// Render the graphics for viewing
function render()
{
    // Clear the color buffer and the depth buffer before rendering a new frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Pass the projection matrix from JavaScript to the GPU for use in shader
    // ortho(left, right, bottom, top, near, far)
    projectionMatrix = ortho(-16, 16, -9, 9, -10, 10);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Set the instance matrix for each figure part
    scaleBaseBody = scale(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    scaleUpperArm = scale(UARM_WIDTH, UARM_HEIGHT, UARM_WIDTH);
    scaleLowerArm = scale(LARM_WIDTH, LARM_HEIGHT, LARM_WIDTH);
    instanceMatrixBase = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0), scaleBaseBody);
    instanceMatrixUArm = mult(translate(0.0, 0.5 * UARM_HEIGHT, 0.0), scaleUpperArm);
    instanceMatrixLArm = mult(translate(0.0, 0.5 * LARM_HEIGHT, 0.0), scaleLowerArm);

    // Draw the primitive / geometric shape
    draw();
}

// Draw the base body, upper arm, and lower arm respectively
function draw()
{
    // Clear the color buffer and the depth buffer before rendering a new frame
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Define the model view matrix as a new identity matrix
    modelViewMatrix = mat4();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -5, 0.0));          // T1
    modelViewMatrix = mult(modelViewMatrix, rotateY(theta[BASE_BODY]));        // R1
    baseBody();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0)); // T2
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[UPPER_ARM]));        // R2
    upperArm();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, UARM_HEIGHT, 0.0)); // T3
    modelViewMatrix = mult(modelViewMatrix, rotateZ(theta[LOWER_ARM]));        // R3
    lowerArm();
}

// Helper function to draw base body
function baseBody()
{
    // Set the shape using instance matrix
    var t = mult(modelViewMatrix, instanceMatrixBase);

    // Pass the model view matrix from JavaScript to the GPU for use in shader
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

    // Draw the primitive / geometric shape
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

// Helper function to draw upper arm
function upperArm()
{
    // Set the shape using instance matrix
    var t = mult(modelViewMatrix, instanceMatrixUArm);

    // Pass the model view matrix from JavaScript to the GPU for use in shader
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

    // Draw the primitive / geometric shape
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

// Helper function to draw lower arm
function lowerArm()
{
    // Set the shape using instance matrix
    var t = mult(modelViewMatrix, instanceMatrixLArm);

    // Pass the model view matrix from JavaScript to the GPU for use in shader
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t));

    // Draw the primitive / geometric shape
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

/*-----------------------------------------------------------------------------------*/