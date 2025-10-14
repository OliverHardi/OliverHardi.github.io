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

uniform vec3 uMouse;


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

    vec2 aspectRatio = vec2(1., uResolution.y/uResolution.x);
    vec2 uv = gl_FragCoord.xy/uResolution * aspectRatio;
    if(length(uv - uMouse.xy * aspectRatio) < 0.008){
        col = vec3(1.0);
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

float tanhc(float x){
    x = clamp(x, -10.0, 10.0);
    return (exp(2.0*x) - 1.0) / (exp(2.0*x) + 1.0);
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

float worley(vec3 p) {
    vec3 Pi = floor(p);
    vec3 Pf = fract(p);
    
    float minDist = 10.0;

    for(int xo = -1; xo <= 1; xo++) {
        for(int yo = -1; yo <= 1; yo++) {
            for(int zo = -1; zo <= 1; zo++) {
                vec3 offset = vec3(xo, yo, zo);
                vec3 cell = Pi + offset;

                // random point
                vec3 feature = hash33(cell) * 0.5 + 0.5;

                vec3 diff = offset + feature - Pf;
                float d = dot(diff, diff);

                minDist = min(minDist, d);
            }
        }
    }
    // return sqrt(minDist);
    return minDist;
}

#define C0 vec3(0., 0.188, 0.286)
#define C1 vec3(0.84, 0.16, 0.16)
#define C2 vec3(0.988, 0.749, 0.286)

vec3 cramp(float t) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.5) {
        // Blend from c0 to c1
        return mix(C0, C1, t * 2.0);
    } else {
        // Blend from c1 to c2
        return mix(C1, C2, (t - 0.5) * 2.0);
    }
}


void main(){
    vec2 p = gl_FragCoord.xy/uResolution;
    vec3 pos = vec3( p * vec2(uResolution.x/uResolution.y, 1.), uFrame*0.001 );
    float o1 = perlin(pos * 4.)*0.5+0.5;
    float o2 = worley(pos * vec3(28., 28., 12.))*0.5+0.5;
    float o3 = perlin(pos * vec3(2.5, 2.5, 0.2));
    // float perlinb = perlin(pos + vec3(3.1, 7.3, 10.7));
    float t = texture(uTex, p).r;
    // vec3 col = mix(vec3(0.02, 0.03, 0.04), vec3(0.6, 0.72, 0.92), t + 0.1*(1.-sqrt(abs(perlina))) );
    // vec3 bgcol = mix(vec3(0.02, 0.03, 0.04), vec3(0.6, 0.72, 0.92), tanh(perlina*1.0)*0.5+0.5 );
    // vec3 bgcol = mix(vec3(0.), vec3(1.), o1 - o2*0.1);
    vec3 k = mix(cramp(o1*1.5 - o2*0.24 - 0.2), C2, t);
    vec3 col = mix(k, C0*0.5, tanhc(o3*250.0)*0.5+0.5);


    fragColor = vec4(col, 1.);

}
`;

window.onload = function () {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 50);
  };