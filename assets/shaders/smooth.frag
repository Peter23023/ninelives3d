// Nine Lives 3D: per-pixel lighting with soft "wrap" diffuse and a gentle highlight,
// so rounded models look smooth. Same uniforms / defines as libGDX's default shader.
#ifdef GL_ES
precision mediump float;
#endif

#if defined(diffuseTextureFlag) || defined(specularTextureFlag) || defined(emissiveTextureFlag)
#define textureFlag
#endif

#ifdef normalFlag
varying vec3 v_normal;
#endif

#ifdef colorFlag
varying vec4 v_color;
#endif

#ifdef diffuseTextureFlag
varying vec2 v_diffuseUV;
uniform sampler2D u_diffuseTexture;
#endif

#ifdef diffuseColorFlag
uniform vec4 u_diffuseColor;
#endif

#ifdef blendedFlag
varying float v_opacity;
#ifdef alphaTestFlag
varying float v_alphaTest;
#endif
#endif

#ifdef fogFlag
uniform vec4 u_fogColor;
varying float v_fog;
varying vec3 v_viewDir;
#endif

#ifdef lightingFlag
#ifdef ambientLightFlag
uniform vec3 u_ambientLight;
#endif
#ifdef ambientCubemapFlag
uniform vec3 u_ambientCubemap[6];
#endif
#if numDirectionalLights > 0
struct DirectionalLight {
    vec3 color;
    vec3 direction;
};
uniform DirectionalLight u_dirLights[numDirectionalLights];
#endif
#endif

void main() {
    vec4 diffuse = vec4(1.0);
#ifdef diffuseTextureFlag
    diffuse *= texture2D(u_diffuseTexture, v_diffuseUV);
#endif
#ifdef diffuseColorFlag
    diffuse *= u_diffuseColor;
#endif
#ifdef colorFlag
    diffuse *= v_color;
#endif
#if defined(blendedFlag) && defined(alphaTestFlag)
    if (diffuse.a * v_opacity <= v_alphaTest) discard;
#endif

    vec3 color = diffuse.rgb;

#if defined(lightingFlag) && defined(normalFlag)
    vec3 n = normalize(v_normal);
    if (!gl_FrontFacing) n = -n;
    vec3 light = vec3(0.0);
#ifdef ambientLightFlag
    // sky light from above, a little less from below: rounded shapes read as round
    light += u_ambientLight * (0.72 + 0.28 * (n.y * 0.5 + 0.5));
#endif
#ifdef ambientCubemapFlag
    vec3 sq = n * n;
    vec3 pos = step(0.0, n);
    light += sq.x * mix(u_ambientCubemap[0], u_ambientCubemap[1], pos.x)
           + sq.y * mix(u_ambientCubemap[2], u_ambientCubemap[3], pos.y)
           + sq.z * mix(u_ambientCubemap[4], u_ambientCubemap[5], pos.z);
#endif
    vec3 spec = vec3(0.0);
#if numDirectionalLights > 0
#ifdef fogFlag
    vec3 viewDir = normalize(v_viewDir);
#else
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
#endif
    for (int i = 0; i < numDirectionalLights; i++) {
        vec3 l = -u_dirLights[i].direction;
        float ndl = dot(n, l);
        float wrap = clamp((ndl + 0.4) / 1.4, 0.0, 1.0);            // soft light that wraps round curves
        light += u_dirLights[i].color * wrap;
        vec3 h = normalize(l + viewDir);
        spec += u_dirLights[i].color * pow(max(dot(n, h), 0.0), 32.0) * 0.28 * step(0.0, ndl);
    }
#endif
    color = color * light + spec;
#endif

#ifdef fogFlag
    color = mix(color, u_fogColor.rgb, v_fog);
#endif

#ifdef blendedFlag
    gl_FragColor = vec4(color, diffuse.a * v_opacity);
#else
    gl_FragColor = vec4(color, 1.0);
#endif
}
