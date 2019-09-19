import React, { Component } from 'react';
// import ReactDOM from 'react-dom'
// import { Canvas } from 'react-three-fiber'
import * as THREE from 'three';
import Stats from 'stats.js'

var stats = new Stats();
stats.showPanel( 2 ); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

class ThreeScene extends Component{
  constructor() {
    super();

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      framecounter: 0,
      framecounter2: 0,
      n: 128
    }

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resize = this.resize.bind(this);
    this.incrementColor = this.incrementColor.bind(this);
    this.randColor = this.randColor.bind(this);
    this.createRow = this.createRow.bind(this);
  }

  createRow() {
    let k = Math.floor((Math.random() * 50) + 1);
    const color = new THREE.Color( Math.random(), Math.random(), Math.random() );
    let geometry = new THREE.BoxGeometry( 1, k, 1 );
    let material = new THREE.MeshBasicMaterial({ color });
    let object = new THREE.Mesh(geometry, material);
    object.position.x = -(this.state.n/2) + 0.5;
    object.position.y = k/2;
    this.rowgroup.attach( object );

    for(let i = 1; i < this.state.n; ++i) {
      k = Math.floor((Math.random() * 50) + 1);
      geometry = new THREE.BoxGeometry( 1, k, 1);
      material = new THREE.MeshBasicMaterial({ color });
      object = new THREE.Mesh(geometry, material);
      object.position.x = ( i - (this.state.n/2) ) + 0.5;
      object.position.y = ( k / 2 );
      this.rowgroup.attach( object );
    }

    this.scene.add(this.rowgroup);
    this.allrows.unshift(this.rowgroup);
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

    this.allrows = [];

    //ADD SCENE
    this.scene = new THREE.Scene();

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      60, this.state.width / this.state.height, 0.1, 2000
    );

    this.camera.position.z = this.state.n/2;
    this.camera.position.y = (3*this.state.n)/4;
    this.camera.rotation.x = -(Math.PI * 0.15);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000');
    this.renderer.setSize(this.state.width, this.state.height);
    this.mount.appendChild(this.renderer.domElement);

    this.rowgroup = new THREE.Object3D(); //create an empty container
    this.rowgroup.receiveShadow = true;
    this.rowgroup.castShadow = true;

    this.createRow();

    //add plane
    let geometry1 = new THREE.PlaneBufferGeometry( this.state.n, 1000, this.state.n, 10 );
    let material1 = new THREE.MeshPhongMaterial({ color: '#e8e8e8' });
    // material1.wireframe = true;
    this.plane = new THREE.Mesh(geometry1, material1);
    this.plane.rotation.x = - (Math.PI * 0.5);
    this.plane.position.z = -1000/2;
    this.scene.add(this.plane);

    // //ADD CUBE
    // geometry = new THREE.BoxGeometry(1, 1, 1);
    // material = new THREE.MeshBasicMaterial({ color: '#433F81' });
    // this.cube = new THREE.Mesh(geometry, material);
    // this.scene.add(this.cube);

    //add light
    let pointLight = new THREE.PointLight( 0xefefff, 2, 500, 2 );
    pointLight.position.set(0, this.state.n, this.state.n);
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
    stats.begin();

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

    if(framecounter === 4) {
      this.allrows.forEach((item, i) => {
        item.position.z -= 2;
        if(item.getWorldPosition.z <= -2) {
         this.scene.remove( item );
         this.allrows.pop();
        }
      });

      this.createRow();

      framecounter = 0;
    }

    this.setState({ framecounter, framecounter2 });

    stats.end();

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