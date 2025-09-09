// handles the background shader
// conway's game of life
const canvas = document.getElementById('bg-canvas');

window.addEventListener('scroll', () => {
    if(window.scrollY > 0){
        canvas.classList.add('blurred');
        topbar.classList.add("shrink");
    }else{
        canvas.classList.remove('blurred');
        topbar.classList.remove("shrink");
    }
});


const gl = canvas.getContext('webgl2', {depth:false});
gl.getExtension('EXT_color_buffer_float');
gl.getExtension('OES_texture_float_linear');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

const CPU_Cores = navigator.hardwareConcurrency;

let detail = 4;
if(CPU_Cores > 5){
    detail --;
    if(CPU_Cores > 7){
        detail--;
    }
}

const sizex = Math.floor(canvas.width/detail);
const sizey = Math.floor(canvas.height/detail);



const program = gl.createProgram();
const program2 = gl.createProgram();

const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertShaderSrc);
gl.compileShader(vertShader);
gl.attachShader(program, vertShader);

const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragShaderSrc);
gl.compileShader(fragShader);
gl.attachShader(program, fragShader);

gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.log('VERTEX_SHADER_ERROR:\n', gl.getShaderInfoLog(vertShader));
    console.log('FRAGMENT_SHADER_ERROR:\n', gl.getShaderInfoLog(fragShader));
}

gl.useProgram(program);
gl.uniform2f(gl.getUniformLocation(program, 'uResolution'), sizex, sizey);


gl.attachShader(program2, vertShader);

const postShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(postShader, postShaderSrc);
gl.compileShader(postShader);
gl.attachShader(program2, postShader);

gl.linkProgram(program2);
if(!gl.getProgramParameter(program2, gl.LINK_STATUS)){
    console.log('POST_PROCESS_ERROR:\n', gl.getShaderInfoLog(postShader));
}
gl.useProgram(program2);

gl.uniform2f(gl.getUniformLocation(program2, 'uResolution'), gl.canvas.width, gl.canvas.height);



let framebuffers = [];
let textures = [];
for(let i = 0; i < 2; i++){
    let tex = createTex();
    textures.push(tex);

    
    const numPixels = sizex*sizey*4;
    const data = new Uint8Array(numPixels);

    for(let j = 0; j < numPixels; j+=4){
        const value = Math.random()*10 < 0.5 ? 255 : 0;
        data[j] = value;
        data[j+1] = value;
        data[j+2] = value;
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, sizex, sizey, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    let fb = gl.createFramebuffer();
    framebuffers.push(fb);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer is not complete");
    }
    
}


function createTex(){
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    return texture;
}


let currentFb = 0;
let frame = 0;

function draw(){
    // game of life
    gl.useProgram(program);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[currentFb]);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1-currentFb]);
    gl.uniform1i(gl.getUniformLocation(program, 'uLastFrame'), 1);
    gl.uniform1f(gl.getUniformLocation(program, 'uFrame'), frame);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(program2);

    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[currentFb]);
    gl.uniform1i(gl.getUniformLocation(program2, 'uTexLoc'), 0);
    gl.uniform1f(gl.getUniformLocation(program2, 'uFrame'), frame);


    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


    frame++;
    currentFb = 1-currentFb;
    requestAnimationFrame(draw);
}
draw();