// shaders for the conway's game of life background
const vertShaderSrc = /*glsl*/`#version 300 es
    precision mediump float;

    void main(){
        vec2 positions[4] = vec2[](
            vec2(-1.0, -1.0), 
            vec2( 1.0, -1.0),
            vec2(-1.0,  1.0),
            vec2( 1.0,  1.0)
        );

        gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
    }

`;



const fragShaderSrc = /*glsl*/`#version 300 es
precision mediump float;


out vec4 fragColor;

uniform vec2 uResolution;
uniform float uFrame;
uniform sampler2D uLastFrame;


void main(){
    int total = 0;
    for(int x = -1; x <= 1; x++){
        for(int y = -1; y <= 1; y++){
            if(x == 0 && y == 0){ continue; }
            total += int( texture(uLastFrame, (gl_FragCoord.xy + vec2(x, y))/uResolution).r );
        }
    }
    float center = texture(uLastFrame, gl_FragCoord.xy / uResolution).r;
    vec3 col = vec3(0.0);

    if (center < 0.5) {
        if (total == 3) {
            col = vec3(1.0);
        }
    } else {
        if (total == 2 || total == 3) {
            col = vec3(1.0);
        }
    }

    fragColor = vec4(col, 1.);
}

`;

const postShaderSrc = /*glsl*/`#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec2 uResolution;
uniform sampler2D uTex;
uniform float uFrame;


// hash and perlin noise from https://www.shadertoy.com/view/MdGSzt
#define MOD3 vec3(.1031,.11369,.13787)
vec3 hash33(vec3 p3){
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yxz+19.19);
    return fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x))*2.-1.;
}

float perlin(vec3 p){
    vec3 pi = floor(p);
    vec3 pf = p - pi;
    
    vec3 w = pf * pf * (3.0 - 2.0 * pf);
    
    return 	mix(
        		mix(
                	mix(dot(pf - vec3(0, 0, 0), hash33(pi + vec3(0, 0, 0))), 
                        dot(pf - vec3(1, 0, 0), hash33(pi + vec3(1, 0, 0))),
                       	w.x),
                	mix(dot(pf - vec3(0, 0, 1), hash33(pi + vec3(0, 0, 1))), 
                        dot(pf - vec3(1, 0, 1), hash33(pi + vec3(1, 0, 1))),
                       	w.x),
                	w.z),
        		mix(
                    mix(dot(pf - vec3(0, 1, 0), hash33(pi + vec3(0, 1, 0))), 
                        dot(pf - vec3(1, 1, 0), hash33(pi + vec3(1, 1, 0))),
                       	w.x),
                   	mix(dot(pf - vec3(0, 1, 1), hash33(pi + vec3(0, 1, 1))), 
                        dot(pf - vec3(1, 1, 1), hash33(pi + vec3(1, 1, 1))),
                       	w.x),
                	w.z),
    			w.y);
}

void main(){
    vec2 p = gl_FragCoord.xy/uResolution;
    vec3 pos = vec3( p * 12. * vec2(uResolution.x/uResolution.y, 1.), uFrame*0.0016 );
    float perlina = perlin(pos);
    float perlinb = perlin(pos + vec3(3.1, 7.3, 10.7));
    float t = texture(uTex, p + 0.02*vec2(perlina, perlinb)).r;
    vec3 col = mix(vec3(0.02, 0.03, 0.04), vec3(0.6, 0.72, 0.92), t + 0.1*(1.-sqrt(abs(perlina))) );

    fragColor = vec4(col, 1.);

    // window.scrollTo(0, 0);
}
`;

window.onload = function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 50);
  };