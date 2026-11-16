import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/** A binocular teaching microscope, built locally without downloaded model assets. */
export function createBenchMicroscope(): THREE.Group {
  const instrument = new THREE.Group();
  instrument.name = 'Binocular teaching microscope';
  const enamel = new THREE.MeshStandardMaterial({ color: '#eeeee3', roughness: .28, metalness: .12 });
  const teal = new THREE.MeshStandardMaterial({ color: '#285d59', roughness: .34, metalness: .2 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#1c292b', roughness: .74 });
  const stageMaterial = new THREE.MeshStandardMaterial({ color: '#253336', roughness: .42, metalness: .3 });
  const silver = new THREE.MeshStandardMaterial({ color: '#b5c2c3', roughness: .25, metalness: .86 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: '#52666a', roughness: .3, metalness: .8 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#bdded7', transparent: true, opacity: .46, roughness: .12, metalness: .03, depthWrite: false });
  const optics = new THREE.MeshStandardMaterial({ color: '#174547', metalness: .66, roughness: .09 });
  const lampMaterial = new THREE.MeshStandardMaterial({ color: '#f8f5df', emissive: '#e9dfb9', emissiveIntensity: .35, roughness: .2 });

  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = instrument) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const round = (width: number, height: number, depth: number, radius: number, material: THREE.Material, x: number, y: number, z: number) =>
    add(new RoundedBoxGeometry(width, height, depth, 3, radius), material, x, y, z);
  const cylinder = (radius: number, height: number, material: THREE.Material, x: number, y: number, z: number, topRadius = radius) =>
    add(new THREE.CylinderGeometry(topRadius, radius, height, 40), material, x, y, z);
  const along = (radius: number, from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material, topRadius = radius) => {
    const direction = to.clone().sub(from);
    const midpoint = from.clone().add(to).multiplyScalar(.5);
    const mesh = cylinder(radius, direction.length(), material, midpoint.x, midpoint.y, midpoint.z, topRadius);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  };

  // A broad weighted foot, with a separate non-slip sole and inset illuminator.
  round(1.84, .105, 1.65, .05, rubber, 0, .055, .1);
  round(1.84, .235, 1.65, .115, enamel, 0, .2, .1);
  round(1.53, .065, 1.39, .03, teal, 0, .34, .08);
  round(1.48, .075, 1.35, .035, enamel, 0, .387, .08);
  cylinder(.33, .06, darkMetal, 0, .45, .35);
  cylinder(.267, .024, lampMaterial, 0, .488, .35);
  const lampRing = add(new THREE.TorusGeometry(.286, .015, 8, 48), silver, 0, .49, .35);
  lampRing.rotation.x = Math.PI / 2;
  round(.22, .014, .09, .006, rubber, .55, .427, .52);
  const switchIndicator = round(.075, .017, .025, .006, teal, .55, .439, .52);
  switchIndicator.rotation.y = -.25;
  for (const x of [-.58, .58]) for (const z of [-.43, .63]) cylinder(.085, .055, rubber, x, .026, z);

  // A continuous cast C-arm in the sagittal plane rather than intersecting boxes.
  const armProfile = new THREE.Shape();
  armProfile.moveTo(.1, .4);
  armProfile.bezierCurveTo(-.29, .38, -.81, .42, -.86, .75);
  armProfile.lineTo(-.92, 1.73);
  armProfile.bezierCurveTo(-.94, 2.17, -.66, 2.42, -.28, 2.43);
  armProfile.bezierCurveTo(-.09, 2.44, .13, 2.38, .24, 2.25);
  armProfile.lineTo(.17, 2.02);
  armProfile.bezierCurveTo(-.08, 2.12, -.39, 2.14, -.48, 1.9);
  armProfile.bezierCurveTo(-.54, 1.68, -.48, 1.03, -.45, .9);
  armProfile.bezierCurveTo(-.4, .72, -.11, .7, .15, .7);
  armProfile.closePath();
  const armGeometry = new THREE.ExtrudeGeometry(armProfile, { depth: .34, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .065, bevelThickness: .065, curveSegments: 32 });
  armGeometry.translate(0, 0, -.17);
  const arm = add(armGeometry, enamel, 0, 0, 0);
  arm.rotation.y = -Math.PI / 2;
  // Integrated color strip on the outside of the casting.
  const inset = new THREE.Shape();
  inset.moveTo(-.7, .83); inset.bezierCurveTo(-.75, 1.22, -.78, 1.71, -.7, 1.96);
  inset.bezierCurveTo(-.65, 2.12, -.5, 2.24, -.34, 2.25);
  inset.lineTo(-.35, 2.18); inset.bezierCurveTo(-.56, 2.08, -.61, 1.96, -.62, 1.75);
  inset.lineTo(-.6, .88); inset.closePath();
  const insetGeo = new THREE.ShapeGeometry(inset, 24);
  const insetMaterial = teal.clone(); insetMaterial.side = THREE.DoubleSide;
  const insetMesh = add(insetGeo, insetMaterial, .239, 0, 0);
  insetMesh.rotation.y = -Math.PI / 2;

  // Rack, mechanical stage with a real aperture and a glass preparation.
  round(.58, .12, .55, .04, darkMetal, 0, 1.05, -.38);
  const stageOutline = new THREE.Shape();
  const sw = .76, sd = .57, sr = .08;
  stageOutline.moveTo(-sw + sr, -sd); stageOutline.lineTo(sw - sr, -sd);
  stageOutline.quadraticCurveTo(sw, -sd, sw, -sd + sr); stageOutline.lineTo(sw, sd - sr);
  stageOutline.quadraticCurveTo(sw, sd, sw - sr, sd); stageOutline.lineTo(-sw + sr, sd);
  stageOutline.quadraticCurveTo(-sw, sd, -sw, sd - sr); stageOutline.lineTo(-sw, -sd + sr);
  stageOutline.quadraticCurveTo(-sw, -sd, -sw + sr, -sd);
  const aperture = new THREE.Path(); aperture.absarc(0, -.025, .19, 0, Math.PI * 2, true); stageOutline.holes.push(aperture);
  const stageGeo = new THREE.ExtrudeGeometry(stageOutline, { depth: .08, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2, curveSegments: 40 });
  const stage = add(stageGeo, stageMaterial, 0, 1.25, .19);
  stage.rotation.x = -Math.PI / 2;
  round(.83, .018, .31, .008, glass, 0, 1.35, .19);
  round(.17, .003, .15, .001, new THREE.MeshStandardMaterial({ color: '#acbac7', roughness: .4, transparent: true, opacity: .7 }), 0, 1.362, .19);
  for (const x of [-.44, .44]) {
    round(.075, .026, .38, .012, silver, x, 1.367, .13);
    cylinder(.035, .022, darkMetal, x, 1.387, -.025);
    const cap = add(new THREE.SphereGeometry(.047, 16, 10), silver, x, 1.374, .3); cap.scale.set(.8, .25, 1);
  }
  // Stage travel rail and the small coaxial X/Y control below its right edge.
  along(.026, new THREE.Vector3(-.66, 1.19, .63), new THREE.Vector3(.66, 1.19, .63), silver);
  for (const y of [1.12, 1.02]) {
    const travel = cylinder(.076, .11, rubber, .78, y, .44); travel.rotation.z = Math.PI / 2;
  }
  cylinder(.22, .13, darkMetal, 0, 1.13, .19);
  cylinder(.145, .11, silver, 0, 1.015, .19);
  cylinder(.17, .035, rubber, 0, .95, .19);
  along(.022, new THREE.Vector3(.1, .96, .22), new THREE.Vector3(.3, .96, .36), silver);

  // Revolving nosepiece and four independent, machined objective barrels.
  cylinder(.145, .19, darkMetal, 0, 2.08, .17);
  cylinder(.33, .11, silver, 0, 1.97, .17);
  cylinder(.29, .035, stageMaterial, 0, 1.9, .17);
  const bands = ['#b4a866', '#cc6155', '#6da0a1', '#98a078'];
  for (let index = 0; index < 4; index++) {
    const angle = index * Math.PI / 2 + Math.PI / 8;
    const x = Math.sin(angle) * .23, z = .17 + Math.cos(angle) * .23;
    const length = [.27, .35, .42, .31][index];
    cylinder(.087, .07, darkMetal, x, 1.872, z);
    cylinder(.082, length, silver, x, 1.85 - length / 2, z);
    cylinder(.085, .032, new THREE.MeshStandardMaterial({ color: bands[index], roughness: .4, metalness: .2 }), x, 1.82 - length * .35, z);
    cylinder(.064, .055, darkMetal, x, 1.828 - length, z);
    cylinder(.044, .008, optics, x, 1.797 - length, z);
    for (let j = 0; j < 6; j++) {
      const mark = round(.007, .032, .006, .002, darkMetal, x + Math.sin(j * .8) * .082, 1.79 - length * .45, z + Math.cos(j * .8) * .082);
      mark.rotation.y = j * .8;
    }
  }

  // Inclined optical head and separate binocular channels facing the learner.
  cylinder(.24, .25, enamel, 0, 2.21, .12);
  const head = round(.75, .31, .58, .12, enamel, 0, 2.39, .17); head.rotation.x = .3;
  round(.63, .09, .32, .04, teal, 0, 2.505, .3).rotation.x = .45;
  for (const x of [-.2, .2]) {
    const direction = new THREE.Vector3(0, .82, .57);
    const start = new THREE.Vector3(x, 2.46, .29);
    const end = start.clone().addScaledVector(direction, .39);
    along(.115, start, end, enamel, .12);
    along(.126, end.clone().addScaledVector(direction, -.035), end.clone().addScaledVector(direction, .055), silver);
    along(.13, end.clone().addScaledVector(direction, .04), end.clone().addScaledVector(direction, .24), rubber, .142);
    const lensEnd = end.clone().addScaledVector(direction, .247);
    along(.099, lensEnd, lensEnd.clone().addScaledVector(direction, .006), optics);
    const rim = add(new THREE.TorusGeometry(.119, .018, 10, 32), rubber, lensEnd.x, lensEnd.y, lensEnd.z);
    rim.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    for (let line = 0; line < 5; line++) {
      const tick = round(.011, .025, .008, .002, silver, x + (line - 2) * .025, end.y + .055, end.z + .108);
      tick.rotation.x = .6;
    }
  }
  const bridgeScrew = cylinder(.046, .03, silver, 0, 2.56, .35); bridgeScrew.rotation.x = .6;

  // True lateral coarse/fine focus wheels, with finely knurled grips.
  for (const side of [-1, 1]) {
    const coarse = cylinder(.225, .155, rubber, side * .39, 1.1, -.47); coarse.rotation.z = Math.PI / 2;
    const outer = cylinder(.17, .045, teal, side * .486, 1.1, -.47); outer.rotation.z = Math.PI / 2;
    const fine = cylinder(.096, .08, darkMetal, side * .537, 1.1, -.47); fine.rotation.z = Math.PI / 2;
    const fineCap = cylinder(.067, .008, silver, side * .582, 1.1, -.47); fineCap.rotation.z = Math.PI / 2;
    for (let rib = 0; rib < 36; rib++) {
      const angle = rib * Math.PI / 18;
      const grip = round(.116, .012, .022, .004, stageMaterial, side * .39, 1.1 + Math.cos(angle) * .225, -.47 + Math.sin(angle) * .225);
      grip.rotation.x = angle;
    }
    for (let tick = 0; tick < 12; tick++) {
      const angle = tick * Math.PI / 6;
      const line = round(.004, .025, .005, .001, silver, side * .511, 1.1 + Math.cos(angle) * .137, -.47 + Math.sin(angle) * .137);
      line.rotation.x = angle;
    }
  }
  // Small, flush manufacturer's plate.
  round(.2, .21, .018, .015, teal, 0, 1.92, -.91);
  return instrument;
}
