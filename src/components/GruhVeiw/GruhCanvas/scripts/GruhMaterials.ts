import * as THREE from 'three'
import * as images from '../../../../assets/images/*.*';
import { TranslucentShader } from 'three/examples/jsm/shaders/TranslucentShader';

const textureLoader = new THREE.TextureLoader();
const GruhMaterials = {

  sclera: function(): THREE.Material {
    return new THREE.MeshPhysicalMaterial({
      map: textureLoader.load(images['Sclera_COL'].png),
      bumpMap: textureLoader.load(images['Sclera_BUMP'].png),
      bumpScale: 0.025,
      roughness: 0.3,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
  },

  lens: function (): THREE.Material {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      depthWrite: false,
      transparency: 0.75,
      refractionRatio: 1.05,
      opacity: 1.0,
      transparent: true
    });
  },

  iris: function(): THREE.Material {
    return new THREE.MeshPhysicalMaterial({
      map: textureLoader.load(images['Iris_COL'].png),
      bumpMap: textureLoader.load(images['Iris_BUMP'].png),
      bumpScale: 0.05,
      roughness: 0.0
    });
  },

  skin: function(): THREE.Material {
    var shader = TranslucentShader;
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    uniforms.map.value = textureLoader.load(images['white'].png);
    uniforms.thicknessColor.value = new THREE.Color(0xe75f51);
    uniforms.thicknessPower.value = 1;
    uniforms.thicknessAttenuation.value = 500;
    uniforms.thicknessAmbient.value = 200;

    const gruhSkinMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      lights: true
    });
    gruhSkinMaterial.extensions.derivatives = true;

    return gruhSkinMaterial;
  }
};

export default GruhMaterials;
