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
    this.createRandomRow = this.createRandomRow.bind(this);
    this.updateFrequencies = this.updateFrequencies.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.incrementColor = this.incrementColor.bind(this);
    this.makeGradientCube = this.makeGradientCube.bind(this);

  }


  handleScroll(e) {
    if(this.state.paused) {
      if(this.camera.position.z < ((3 * this.rowamount)/8) - 6) {
          this.camera.position.z += e.deltaY*2;
          this.pointLight.position.z += e.deltaY*2;
      }

      if(this.camera.position.z >= ((3 * this.rowamount)/8) - 6) {
        if(e.deltaY < 0) {
          this.camera.position.z += e.deltaY*2;
          this.pointLight.position.z += e.deltaY*2;
        }
      }
    }
  }

  updateFrequencies() {
    const analyserNode = this.state.analyserNode;
    const allFreq = new Uint8Array(analyserNode.frequencyBinCount);
    this.frequencies = [];
    analyserNode.getByteFrequencyData(allFreq);

    let lastIndex = 0;
    //frequencybincount = 16
    for(let i = 0; i < this.rowamount; ++i) {
      if(i < 2) {
        this.frequencies.push( allFreq[i] );
        lastIndex = i;
      }
      else {
        let index = Math.ceil(Math.pow(this.c, Math.pow(i, 1/2)) - 1);
        let amount = 0;
        let sum = 0;

        for(let k = lastIndex; k < index; k++) {
          if(allFreq[k] > 10) {
            sum += allFreq[k];
            amount++;
          }
        }

        this.frequencies.push( isNaN(sum/amount) ? 0 : sum/amount );
        lastIndex = index;
      }
    }
  }

  makeGradientCube(h){
      var cubeGeometry = new THREE.BoxGeometry(1, h, 1);
      return new THREE.Mesh(cubeGeometry);
  }


  createRow() {
    let spectrumGeometry = new THREE.BoxGeometry();

    //let geometry = new THREE.BoxBufferGeometry();

    let mesh = new THREE.Mesh();
    //let color = this.incrementColor(this.recentColor, this.oldColor);
    //let color =

    for(let i = 0; i < this.rowamount; ++i) {
      // geometry = new THREE.BoxGeometry( 1, (this.frequencies[i])/2, 1);
      // mesh = new THREE.Mesh(geometry);

      mesh = this.makeGradientCube(this.frequencies[i]/2);
      mesh.position.x = ( i - (this.rowamount/2) ) + 0.5;
      // mesh.position.y = ( this.frequencies[i] / 2 )/10;

      mesh.updateMatrix();
      spectrumGeometry.merge(mesh.geometry, mesh.matrix);
    }

  	// let material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.2, 0.9, 0.4) , shininess: 80 });
  	// let material = new THREE.MeshToonMaterial({ color: new THREE.Color(0.2, 0.9, 0.4) });
    //
    var white = new THREE.Color( 'white' );
    var c = new THREE.Color(0,1,0);

    if(this.allrows[0] !== undefined) {
      c = this.incrementColor(this.allrows[0].material.uniforms.colorB.value);
    }
    if(this.allrows[0] !== undefined && this.allrows[1] !== undefined) {
      c = this.incrementColor(this.allrows[0].material.uniforms.colorB.value, this.allrows[1].material.uniforms.colorB.value);
    }

    let uniforms = THREE.UniformsUtils.merge([
        THREE.ShaderLib.phong.uniforms,
        { colorB: {type: 'vec3', value: c }},
        { colorA: {type: 'vec3', value: white}}
    ]);


    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: document.getElementById("fragmentShader").textContent,
        vertexShader: THREE.ShaderLib.phong.vertexShader,
        lights: true
    })

    let spectrum = new THREE.Mesh(spectrumGeometry, material);
    this.sceneRoot.add(spectrum);
    this.allrows.unshift(spectrum);

    const which = 10;

    if(this.allrows.length > which) {
      this.sceneRoot.remove(this.allrows[which]);
    }
  }

  createRandomRow(){
    let spectrumGeometry = new THREE.BoxGeometry();
    //let geometry = new THREE.BoxBufferGeometry();
    let mesh = new THREE.Mesh();
    //let color = this.incrementColor(this.recentColor, this.oldColor);
    //let color =

    for(let i = 0; i < this.rowamount; ++i) {
      // geometry = new THREE.BoxGeometry( 1, (this.frequencies[i])/2, 1);
      // mesh = new THREE.Mesh(geometry);

      mesh = this.makeGradientCube(Math.random()*100);
      mesh.position.x = ( i - (this.rowamount/2) ) + 0.5;
      // mesh.position.y = ( this.frequencies[i] / 2 )/10;

      mesh.updateMatrix();
      spectrumGeometry.merge(mesh.geometry, mesh.matrix);
    }

    	// let material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.2, 0.9, 0.4) , shininess: 80 });
    	// let material = new THREE.MeshToonMaterial({ color: new THREE.Color(0.2, 0.9, 0.4) });
    //
    var white = new THREE.Color( 'white' );
    var c = new THREE.Color(0,1,0);

    if(this.allrows[0] !== undefined) {
      c = this.incrementColor(this.allrows[0].material.uniforms.colorB.value);
      console.log(this.allrows[0].material.uniforms.colorB.value);
    }
    if(this.allrows[0] !== undefined && this.allrows[1] !== undefined) {
      c = this.incrementColor(this.allrows[0].material.uniforms.colorB.value, this.allrows[1].material.uniforms.colorB.value);
    }
    let uniforms = {
      colorB: {type: 'vec3', value: c},
      colorA: {type: 'vec3', value: white}
      }


      var material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          fragmentShader: document.getElementById("fragmentShader").textContent,
          vertexShader: document.getElementById("vertexShader").textContent,
      })

    let spectrum = new THREE.Mesh(spectrumGeometry, material);
    this.sceneRoot.add(spectrum);
    }

  incrementColor(recentColor, oldColor = null) {
    let r = recentColor.r;
    let g = recentColor.g;
    let b = recentColor.b;
    //console.log(recentColor);

    if(oldColor === null) {
      r += 0.001;
      g -= 0.001;
      b += 0.001
      return new THREE.Color(r, g, b);
    }

    //red channel
    if(r - oldColor.r > 0) {
      r += 0.001;
      if(r >= 1) {
        r -= 0.002;
      }
    }
    else {
      r -= 0.001;
      if(r <= 0.5) {
        r += 0.002
      }
    }

    //green channel
    if(g - oldColor.g > 0) {
      g += 0.002;
      if(g >= 1) {
        g -= 0.004;
      }
    }
    else {
      g -= 0.002;
      if(g <= 0.5) {
        g += 0.004
      }
    }

    //blue channel
    if(b - oldColor.b > 0) {
      b += 0.005;
      if(b >= 1) {
        b -= 0.01;
      }
    }
    else {
      b -= 0.005;
      if(b <= 0.5) {
        b += 0.01
      }
    }
    return new THREE.Color(r, g, b);
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
    //constant for logaritm
    this.rowamount = 128;
    this.c = Math.pow(3157, (1/Math.pow(this.rowamount, 1/2)));

    window.addEventListener('resize', this.resize);
    document.querySelector(".canvas").addEventListener('wheel', this.handleScroll);
    this.height = document.querySelector(".canvas").offsetHeight;
    this.width = document.querySelector(".canvas").offsetWidth;
    this.framecounter = 0;

    this.allrows = [];
    // this.lastColor = new THREE.Color(1,0,0);
    // this.oldColor = new THREE.Color(1,0,0);

    //ADD SCENE
    this.scene = new THREE.Scene();
    this.sceneRoot = new THREE.Object3D();
    this.scene.add(this.sceneRoot);

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      60, this.width / this.height, 5, 500
    );

    this.camera.position.z = ((5 * this.rowamount)/8);
    this.camera.position.y = (2 * this.rowamount)/4 -10;
    this.camera.rotation.x = -(Math.PI * 0.15);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000');
    this.renderer.setSize(this.width, this.height);
    this.mount.appendChild(this.renderer.domElement);

    //add light
    this.pointLight = new THREE.PointLight( 0xefefff, 10, 300, 2 );
    this.pointLight.position.set(0, this.rowamount, this.rowamount);
    this.pointLight.castShadow = true;
		this.scene.add( this.pointLight );



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
    document.querySelector(".canvas").removeEventListener('mousewheel', this.handleScroll);

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

      // this.camera.position.z = ((3 * this.rowamount)/8) - 6;
      // this.pointLight.position.z = this.rowamount;

      this.framecounter++;

      if(this.framecounter === 3) {
        this.allrows.forEach((item, i) => {
          item.position.z -= 2;
        });

        this.updateFrequencies();
        this.createRow();

        this.framecounter = 0;
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
