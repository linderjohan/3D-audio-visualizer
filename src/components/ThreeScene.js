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
  constructor(props) {
    super(props);

    this.state = {
      paused: this.props.paused,
      analyserNode: this.props.analyserNode
    }

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resize = this.resize.bind(this);
    this.randColor = this.randColor.bind(this);
    this.createRow = this.createRow.bind(this);
    this.updateFrequencies = this.updateFrequencies.bind(this);
  }

  async updateFrequencies() {
    const analyserNode = this.state.analyserNode;
    this.frequencies = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(this.frequencies);

    this.frequencies.forEach((item, i) => {
      console.log("hej");
    });

    // console.log(this.frequencies);
  }

  createRow() {
    // console.log(this.frequencies);
    const color = new THREE.Color( Math.random(), Math.random(), Math.random() );

    let spectrumGeometry = new THREE.BoxGeometry();
    let geometry = new THREE.BoxGeometry();
    let mesh = new THREE.Mesh();

    for(let i = 0; i < this.rowamount; ++i) {
      geometry = new THREE.BoxGeometry( 1, (this.frequencies[i])/10, 1);
      mesh = new THREE.Mesh(geometry);
      mesh.position.x = ( i - (this.rowamount/2) ) + 0.5;
      mesh.position.y = ( this.frequencies[i] / 2 )/10;

      mesh.updateMatrix();
      spectrumGeometry.merge(mesh.geometry, mesh.matrix);
    }

    let material = new THREE.MeshPhongMaterial({ color });
    let spectrum = new THREE.Mesh(spectrumGeometry, material);
    this.scene.add(spectrum);
    this.allrows.unshift(spectrum);
  }

  randColor(color) {
    color.r = Math.random();
    color.g = Math.random();
    color.b = Math.random();

    return color;
  }

  resize(event) {
    this.camera.aspect = document.querySelector(".canvas").offsetWidth / document.querySelector(".canvas").offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(document.querySelector(".canvas").offsetWidth, document.querySelector(".canvas").offsetHeight);

    this.width = document.querySelector(".canvas").offsetWidth;
    this.height = document.querySelector(".canvas").offsetHeight;
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.height = document.querySelector(".canvas").offsetHeight;
    this.width = document.querySelector(".canvas").offsetWidth;
    this.framecounter = 0;
    this.framecounter2 = 0;
    this.rowamount = 128;

    this.allrows = [];

    //ADD SCENE
    this.scene = new THREE.Scene();

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      60, this.width / this.height, 5, 500
    );

    this.camera.position.z = this.rowamount/2;
    this.camera.position.y = (2 * this.rowamount)/4;
    this.camera.rotation.x = -(Math.PI * 0.15);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000');
    this.renderer.setSize(this.width, this.height);
    this.mount.appendChild(this.renderer.domElement);

    // //First row
    // this.createRow();

    // //add plane
    // let geometry1 = new THREE.PlaneBufferGeometry( this.rowamount, 1000, this.rowamount, 10 );
    // let material1 = new THREE.MeshPhongMaterial({ color: '#e8e8e8' });
    // // material1.wireframe = true;
    // this.plane = new THREE.Mesh(geometry1, material1);
    // this.plane.rotation.x = - (Math.PI * 0.5);
    // this.plane.position.z = -1000/2;
    // this.scene.add(this.plane);

    //add light
    let pointLight = new THREE.PointLight( 0xefefff, 3, 300, 2 );
    pointLight.position.set(0, this.rowamount, this.rowamount);
    pointLight.castShadow = true;
		this.scene.add( pointLight );

    this.start();
  }

  componentDidUpdate(oldProps) {
    const newProps = this.props
    if(oldProps !== newProps) {
      this.setState({ paused: newProps.paused, analyserNode: newProps.analyserNode });
    }
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
    if(!this.state.paused) {
      stats.begin();

      this.framecounter++;
      this.framecounter2++;

      // if(this.framecounter2 === 10) {
      //   this.materials.map((item, i) => {
      //     item.color = this.randColor(item.color);
      //   });
      //   this.framecounter2 = 0;
      // }

      if(this.framecounter === 3) {
        this.allrows.forEach((item, i) => {
          item.position.z -= 2;
        });

        this.updateFrequencies();
        this.createRow();

        this.framecounter = 0;
      }

      if(this.allrows.length === 75) {
       this.scene.remove( this.allrows[74] );
       this.allrows.pop();
      }

      stats.end();
    }

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return(
        <div
          ref={(mount) => { this.mount = mount }}
        />
    )
  }
}

export default ThreeScene
