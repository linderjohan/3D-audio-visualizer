import React, { Component } from 'react';
// import ReactDOM from 'react-dom'
// import { Canvas } from 'react-three-fiber'
import * as THREE from 'three';

class ThreeScene extends Component{
  constructor() {
    super();

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      framecounter: 0,
      framecounter2: 0
    }

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resize = this.resize.bind(this);
    this.incrementColor = this.incrementColor.bind(this);
    this.randColor = this.randColor.bind(this);
  }

  randColor(color) {
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();

    return color;
  }

  //deprecated
  incrementColor(color, step = 0.01){
    color.r += step;
    color.g -= step;
    color.b += step;

    if(color.r >= 1) {
      color.r = 0
    }
    if(color.g <= 0) {
      color.g = 1
    }
    if(color.r >= 1) {
      color.r = 0
    }
    return color;
  }

  resize(event) {
    this.camera.aspect = event.target.innerWidth / event.target.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);

    this.setState({ width: event.target.innerWidth, height: event.target.innerHeight });
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);

    //ADD SCENE
    this.scene = new THREE.Scene();

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      75, this.state.width / this.state.height, 0.1, 500
    );

    this.camera.position.z = 17;
    this.camera.position.y = 4;
    this.camera.rotation.x = 0.4;

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000');
    this.renderer.setSize(this.state.width, this.state.height);
    this.mount.appendChild(this.renderer.domElement);

    this.geometries = [ new THREE.PlaneGeometry( 45, 3, 128, 2 ) ];
    this.materials = [ new THREE.MeshPhongMaterial({ color: new THREE.Color( Math.random(), Math.random(), Math.random() ) }) ];
    this.plane = [ new THREE.Mesh(this.geometries[0], this.materials[0]) ];
    this.plane[0].receiveShadow = true;
    this.plane[0].castShadow = true;
    this.scene.add(this.plane[0]);

    console.log(this.geometries[0].vertices);

    // //add background
    // let geometry = new THREE.PlaneBufferGeometry( 100, 100 );
    // let material = new THREE.MeshBasicMaterial({ color: '#ccc' });
    // this.background = new THREE.Mesh(geometry, material);
    // this.background.position.z = -5;
    // this.scene.add(this.background);

    // //ADD CUBE
    // geometry = new THREE.BoxGeometry(1, 1, 1);
    // material = new THREE.MeshBasicMaterial({ color: '#433F81' });
    // this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);

    //add light
    let pointLight = new THREE.PointLight( 0xefefff, 1, 100, 2 );
    pointLight.position.set(0, 5, 5);
    pointLight.castShadow = true;
		this.scene.add( pointLight );

    this.start();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);

    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;

    let framecounter = this.state.framecounter;
    let framecounter2 = this.state.framecounter2;
    framecounter++;
    framecounter2++;

    // if(framecounter2 == 10) {
    //   this.materials.map((item, i) => {
    //     item.color = this.randColor(item.color);
    //   });
    //   framecounter2 = 0;
    // }

    // if(framecounter == 4) {
    //   this.plane.map((item, i) => {
    //     item.position.y += 3;
    //     if(item.position.y == 36) {
    //      this.plane.pop();
    //      this.materials.pop();
    //      this.geometries.pop();
    //     }
    //   });
    //
    //   this.geometries.unshift( new THREE.PlaneGeometry( 45, 3, 128, 2 ) );
    //   this.materials.unshift( new THREE.MeshPhongMaterial({ color: new THREE.Color( Math.random(), Math.random(), Math.random() ) }) );
    //   this.plane.unshift( new THREE.Mesh(this.geometries[0], this.materials[0]) );
    //   this.scene.add(this.plane[0]);
    //
    //   framecounter = 0;
    // }

    this.geometries[0].vertices[180].set(this.geometries[0].vertices[180].x, this.geometries[0].vertices[180].y, 25);// this way you can move each vertex coordinates
    this.geometries[0].vertices[251].set(this.geometries[0].vertices[251].x, this.geometries[0].vertices[251].y, 25);// this way you can move each vertex coordinates
    // this.geometries[0].vertices[150].z += 1;
    this.geometries[0].verticesNeedUpdate=true;

    this.setState({ framecounter, framecounter2 });

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return(
      <div
        style={{ width: "100%", height: "100%"}}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default ThreeScene

// class Frame extends Component {
//   constructor(){
// 		super();
//
// 		// this.state = {
// 		// 	loading: true
// 		// };
//
// 	}
//
//   componentDidUpdate() {
//     ReactDOM.render(
//       <Canvas>
//         <Thing/>
//       </Canvas>,
//       document.getElementById('root')
//     )
//   }
//
// 	render() {
//     return (
//       <Canvas>
//         <Thing/>
//       </Canvas>
// 		);
// 	}
// }
//
// class Thing extends Component {
//   constructor() {
//     super();
//     this.state = {
//       vertices: [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
//     }
//   }
//   render() {
//     return (
//       <group>
//         <line>
//           <geometry
//             attach="geometry"
//             vertices={this.state.vertices.map(v => new THREE.Vector3(...v))}
//             onUpdate={self => (self.verticesNeedUpdate = true)}
//           />
//           <lineBasicMaterial attach="material" color="black" />
//         </line>
//         <box
//           onClick={e => console.log('click')}
//           onPointerOver={e => console.log('hover')}
//           onPointerOut={e => console.log('unhover')}>
//           <octahedronGeometry attach="geometry" />
//           <meshBasicMaterial attach="material" color="peachpuff" opacity={0.5} transparent />
//         </box>
//       </group>
//     )
//   }
// }
//
// export default Frame;
