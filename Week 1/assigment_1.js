"use strict";

var gl;
var points = [];
var NumTimesToSubdivide = 0;
var TwistAngle = 0;

/* initial triangle */
var vertices = [
	vec2(-0.5,-0.5),
	vec2(0,0.5),
	vec2(0.5,-0.5)
];

var bufferId;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	NumTimesToSubdivide = parseInt(document.getElementById( "divisionSlider" ).value);
	TwistAngle = document.getElementById( "twistSlider" ).value;
	
	divideTriangle(vertices[0],vertices[1],vertices[2],NumTimesToSubdivide)
	
    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
	
	document.getElementById( "twistSlider" ).onchange = function () {
		TwistAngle = document.getElementById( "twistSlider" ).value;
		updateData();
    };
	
	document.getElementById( "divisionSlider" ).onchange = function () {
		NumTimesToSubdivide = parseInt(document.getElementById( "divisionSlider" ).value);
		updateData();
    };
};

function updateData(){
	points = [];
	divideTriangle(vertices[0],vertices[1],vertices[2],NumTimesToSubdivide)
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
}

function render() {
     gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	 gl.drawArrays( gl.TRIANGLES, 0, points.length );
	
	requestAnimFrame(render);
}

function triangle(a,b,c){
	//points.push(a,b,c);
	
	points.push(twistPoint(a),twistPoint(b),twistPoint(c));
}

function divideTriangle(a,b,c,count){
	// check for enf of recursion
	if(count === 0){
		triangle(a,b,c);
	}else{
		// bisect the sides
		var ab = mix( a, b, 0.5);
		var ac = mix( a, c, 0.5);
		var bc = mix( b, c, 0.5);
		
		// four new triangles
		divideTriangle( a, ab, ac, count - 1);
		divideTriangle( c, ac, bc, count - 1);
		divideTriangle( b, bc, ab, count - 1);
		divideTriangle( ac, ab, bc, count - 1)
	}
}

function twistPoint(p){
	var x1 = p[0];
	var y1 = p[1];
	var d = Math.sqrt(x1*x1 + y1*y1);
	var angle = TwistAngle*d;
	var cosine = Math.cos(angle);
	var sine = Math.sin(angle);
	var x2 = x1*cosine - y1*sine;
	var y2 = x1*sine + y1*cosine;

	return vec2(x2,y2);
}
