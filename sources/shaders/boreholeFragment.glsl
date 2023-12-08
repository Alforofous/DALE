#define LAMBERT
#define MAX_SECTIONS_PER_BOREHOLE 10.0
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
uniform sampler2D uBoreholeIdTexture;
uniform sampler2D uSectionsColorTexture;
uniform vec2 uResolution;
uniform float instanceCount;
uniform uint instanceID;

in float vHighlight;
in vec2 vUv;
in vec3 vPosition;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

vec4 getInstanceSectionColor(float instanceId, float sectionIndex)
{
	float totalSections = instanceCount * MAX_SECTIONS_PER_BOREHOLE;
	vec2 uv = vec2((instanceId * MAX_SECTIONS_PER_BOREHOLE + sectionIndex) / totalSections, 0.5);
	vec4 color = texture2D(uSectionsColorTexture, uv);
	return color;
}

float grayscale(vec3 color)
{
	return (color.r + color.g + color.b) / 3.0;
}

vec3 sobelEdgeDetection(sampler2D image, vec2 uv, vec2 resolution, float scaleFactor)
{
	vec2 texel = vec2(1.0) / resolution;

	float n[9];
	for (int i = -1; i <= 1; i++)
	{
		for (int j = -1; j <= 1; j++)
		{
			vec2 offset = vec2(float(i), float(j)) * texel;
			vec3 color = texture2D(image, uv + offset).rgb;
			n[(i + 1) * 3 + (j + 1)] = grayscale(color);
		}
	}

	float sobel_edge_h = n[2] + 2.0 * n[5] + n[8] - n[0] - 2.0 * n[3] - n[6];
	float sobel_edge_v = n[0] + 2.0 * n[1] + n[2] - n[6] - 2.0 * n[7] - n[8];
	float sobel = sqrt(sobel_edge_h * sobel_edge_h + sobel_edge_v * sobel_edge_v);

	return vec3(sobel * scaleFactor);
}

void main()
{
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4(diffuse, opacity);
	if (vPosition.y > 0.0)
	{
		diffuseColor = getInstanceSectionColor(float(instanceID), 0.0);
		diffuseColor /= 255.0;
	}
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
	vec2 uv = gl_FragCoord.xy / uResolution;
	
	vec3 color = sobelEdgeDetection(uBoreholeIdTexture, uv, uResolution, 100.0);

	if (dot(color, vec3(1.0)) < 0.9)
	{
		color = gl_FragColor.rgb;
	}
	gl_FragColor = vec4(mix(gl_FragColor.rgb, color, vHighlight), gl_FragColor.a);
}