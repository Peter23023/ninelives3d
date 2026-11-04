// Nine Lives 3D: per-pixel lighting version of libGDX's default shader (same uniforms / defines).
// The vertex stage only passes data on; lighting happens per pixel in smooth.frag.
#if defined(diffuseTextureFlag) || defined(specularTextureFlag) || defined(emissiveTextureFlag)
#define textureFlag
#endif

attribute vec3 a_position;
uniform mat4 u_projViewTrans;
uniform mat4 u_worldTrans;

#ifdef normalFlag
attribute vec3 a_normal;
uniform mat3 u_normalMatrix;
varying vec3 v_normal;
#endif

#ifdef colorFlag
attribute vec4 a_color;
varying vec4 v_color;
#endif

#ifdef textureFlag
attribute vec2 a_texCoord0;
#endif

#ifdef diffuseTextureFlag
uniform vec4 u_diffuseUVTransform;
varying vec2 v_diffuseUV;
#endif

#ifdef blendedFlag
uniform float u_opacity;
varying float v_opacity;
#ifdef alphaTestFlag
uniform float u_alphaTest;
varying float v_alphaTest;
#endif
#endif

#ifdef fogFlag
uniform vec4 u_cameraPosition;
varying float v_fog;
varying vec3 v_viewDir;          // towards the camera (for the highlight), normalised per pixel
#endif

void main() {
#ifdef diffuseTextureFlag
    v_diffuseUV = u_diffuseUVTransform.xy + a_texCoord0 * u_diffuseUVTransform.zw;
#endif
#ifdef colorFlag
    v_color = a_color;
#endif
#ifdef blendedFlag
    v_opacity = u_opacity;
#ifdef alphaTestFlag
    v_alphaTest = u_alphaTest;
#endif
#endif
    vec4 pos = u_worldTrans * vec4(a_position, 1.0);
    gl_Position = u_projViewTrans * pos;
#ifdef normalFlag
    v_normal = normalize(u_normalMatrix * a_normal);
#endif
#ifdef fogFlag
    vec3 flen = u_cameraPosition.xyz - pos.xyz;
    v_fog = min(dot(flen, flen) * u_cameraPosition.w, 1.0);
    v_viewDir = flen;
#endif
}
