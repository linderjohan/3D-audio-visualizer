import React, { Component } from 'react';
// import ReactDOM from 'react-dom'
// import { Canvas } from 'react-three-fiber'
import * as THREE from 'three';
import Stats from 'stats.js';

var stats = new Stats();
stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

class ThreeScene extends Component {
  constructor(props) {
    super(props);

    this.state = {
      paused: this.props.paused,
      analyserNode: this.props.analyserNode
    };

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.animate = this.animate.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resize = this.resize.bind(this);
    this.createRow = this.createRow.bind(this);
    this.createRandomRow = this.createRandomRow.bind(this);
    this.updateFrequencies = this.updateFrequencies.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.incrementColor = this.incrementColor.bind(this);
    this.interpolate = this.interpolate.bind(this);
    this.rotateCamera = this.rotateCamera.bind(this);
    this.translateCamera = this.translateCamera.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  handleDrag(e) {
    e.preventDefault();
    // console.log(e);
  }

  rotateCamera(e) {

  }

  translateCamera(e) {
    // console.log(e);

    if (this.clientX !== e.clientX) {
      this.camera.position.x = 0 + (e.clientX - (this.width / 2)) / 100;
    }

    if (this.clientY !== e.clientY) {
      this.camera.position.y = 20 + (-e.clientY + (this.height / 2)) / 100;
    }

    this.clientX = e.clientX;
    this.clientY = e.clientY;
  }

  handleScroll(e) {
    if (this.state.paused) {
      if (this.camera.position.z < ((3 * this.rowamount) / 8) - 6) {
        this.camera.position.z += e.deltaY * 2;
        this.pointLight.position.z += e.deltaY * 2;
      }

      if (this.camera.position.z >= ((3 * this.rowamount) / 8) - 6) {
        if (e.deltaY < 0) {
          this.camera.position.z += e.deltaY * 2;
          this.pointLight.position.z += e.deltaY * 2;
        }
      }
    }
  }

  interpolate(before, after, atPoint) {
    return Math.abs(before + (after - before) * atPoint);
  };

  updateFrequencies() {
    const analyserNode = this.state.analyserNode;
    const allFreq = new Uint8Array(analyserNode.frequencyBinCount);
    this.frequencies = [];
    analyserNode.getByteFrequencyData(allFreq);

    let lastIndex = 0;

    for (let i = 0; i < this.rowamount + 10; ++i) {
      if (i === 0) {
        this.frequencies.push(1);
      }
      else if (i > 0 && i < 5) {
        let res = this.interpolate(this.frequencies[i - 1], allFreq[this.index[5]], 0.02);
        this.frequencies.push(res < 0 ? res : res);
        lastIndex = this.index[i];
      }
      else if (i > this.rowamount) {
        this.frequencies.push(this.interpolate(this.frequencies[i - 1], 1, 0.2));
        lastIndex = this.index[i];
      }
      else if (i === this.rowamount + 10) {
        this.frequencies.push(1);
      }
      else {
        let amount = 0;
        let sum = 0;

        for (let k = lastIndex; k <= this.index[i + 1]; k++) {
          if (allFreq[k] > 1) {
            sum += allFreq[k];
            amount++;
          }
        }

        let mean = isNaN(sum / amount) ? 1 : sum / amount;
        let freq = this.interpolate(this.frequencies[i - 1], mean, 0.5);
        let dbFreq = 700 * Math.log10(1 + (freq / 255));

        this.frequencies.push(dbFreq);
        lastIndex = this.index[i];
      }
    }
  }

  createRow() {
    let spectrumGeometry = new THREE.Geometry();
    let mesh = new THREE.Mesh();

    for (let i = 0; i < this.rowamount + 10; ++i) {
      let cubeGeometry = new THREE.BoxGeometry(1, this.frequencies[i] / 2.5, 1);

      mesh = new THREE.Mesh(cubeGeometry);
      mesh.castShadow = true;
      mesh.position.x = ((i) - ((this.rowamount + 10) / 2)) + 0.5;
      // mesh.position.y = ( this.frequencies[i] / 2 )/10;

      mesh.updateMatrix();
      spectrumGeometry.merge(mesh.geometry, mesh.matrix);
    }

    var white = new THREE.Color(1, 1, 1);
    var c = new THREE.Color(0, 1, 0);

    if (this.allrows[0] !== undefined) {
      c = this.incrementColor(this.allrows[0].material.uniforms.colorB.value);
    }
    if (this.allrows[0] !== undefined && this.allrows[1] !== undefined) {
      c = this.incrementColor(this.allrows[0].material.uniforms.colorB.value, this.allrows[1].material.uniforms.colorB.value);
    }

    let uniforms = THREE.UniformsUtils.merge([
      THREE.ShaderLib.phong.uniforms,
      { colorB: { type: 'vec3', value: c } },
      { colorA: { type: 'vec3', value: white } }
    ]);

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: document.getElementById("fragmentShader").textContent,
      vertexShader: document.getElementById("vertexShader").textContent,
      lights: true
    });

    let spectrum = new THREE.Mesh(spectrumGeometry, material);
    this.sceneRoot.add(spectrum);
    this.allrows.unshift(spectrum);

    let wireframe = new THREE.EdgesGeometry(spectrumGeometry);
    material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0, 0, 0, 0.5), opacity: 0.2, transparent: true });
    let line = new THREE.LineSegments(wireframe, material);
    this.sceneRoot.add(line);
    this.allwireframes.unshift(line);

    if (this.allwireframes.length > 1) {
      this.sceneRoot.remove(this.allwireframes[1]);
      this.allwireframes.pop();
    }

    const whichToRemove = 50;

    if (this.allrows.length > whichToRemove) {
      this.sceneRoot.remove(this.allrows[whichToRemove]);
      this.allrows.pop();
    }
  }

  createRandomRow() {
    let spectrumGeometry = new THREE.BoxGeometry();
    let mesh = new THREE.Mesh();

    for (let i = 0; i < this.rowamount; ++i) {
      let cubeGeometry = new THREE.BoxGeometry(1, Math.random() * 100, 1);
      mesh = new THREE.Mesh(cubeGeometry);
      mesh.position.x = (i - (this.rowamount / 2)) + 0.5;
      // mesh.position.y = ( this.frequencies[i] / 2 )/10;

      mesh.updateMatrix();
      spectrumGeometry.merge(mesh.geometry, mesh.matrix);
    }

    var white = new THREE.Color('white');
    var c = new THREE.Color(0, 1, 0);

    let uniforms = {
      colorB: { type: 'vec3', value: c },
      colorA: { type: 'vec3', value: white }
    };

    var material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: document.getElementById("fragmentShader").textContent,
      vertexShader: document.getElementById("vertexShader").textContent
    });

    let spectrum = new THREE.Mesh(spectrumGeometry, material);
    this.sceneRoot.add(spectrum);
  }

  incrementColor(recentColor, oldColor = null) {
    let r = recentColor.r;
    let g = recentColor.g;
    let b = recentColor.b;

    if (oldColor === null) {
      r += 0.001;
      g -= 0.001;
      b += 0.001;
      return new THREE.Color(r, g, b);
    }

    //red channel
    if (r - oldColor.r > 0) {
      r += 0.001;
      if (r >= 1) {
        r -= 0.002;
      }
    }
    else {
      r -= 0.001;
      if (r <= 0.5) {
        r += 0.002;
      }
    }

    //green channel
    if (g - oldColor.g > 0) {
      g += 0.002;
      if (g >= 1) {
        g -= 0.004;
      }
    }
    else {
      g -= 0.002;
      if (g <= 0.5) {
        g += 0.004;
      }
    }

    //blue channel
    if (b - oldColor.b > 0) {
      b += 0.005;
      if (b >= 1) {
        b -= 0.01;
      }
    }
    else {
      b -= 0.005;
      if (b <= 0.5) {
        b += 0.01;
      }
    }
    return new THREE.Color(r, g, b);
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
    this.c = Math.pow(3157, (1 / Math.pow(this.rowamount, 1 / 2)));
    this.index = [];
    for (let i = 0; i < this.rowamount; ++i) {
      this.index.push(Math.ceil(Math.pow(this.c, Math.pow(i, 1 / 2)) - 1));
    }

    this.now = Date.now();
    this.delta = Date.now();
    this.then = Date.now();
    this.interval = 1000 / 25;

    window.addEventListener('resize', this.resize);
    document.querySelector(".canvas").addEventListener('wheel', this.handleScroll);
    document.querySelector(".canvas").addEventListener('dragstart', this.handleDrag);
    document.querySelector(".canvas").addEventListener('dragover', this.handleDrag);
    // document.querySelector(".canvas").addEventListener('mousemove', this.translateCamera);
    this.height = document.querySelector(".canvas").offsetHeight;
    this.width = document.querySelector(".canvas").offsetWidth;

    this.allrows = [];
    this.allwireframes = [];

    //ADD SCENE
    this.scene = new THREE.Scene();
    this.sceneRoot = new THREE.Object3D();
    this.scene.add(this.sceneRoot);

    //ADD CAMERA
    this.camera = new THREE.PerspectiveCamera(
      60, this.width / this.height, 5, 500
    );

    this.camera.position.z = 85;
    this.camera.position.y = 20;
    this.camera.rotation.x = -(Math.PI * 0.05);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000');
    this.renderer.setSize(this.width, this.height);
    this.mount.appendChild(this.renderer.domElement);

    //add light
    this.pointLight = new THREE.PointLight(0xefefff, 10, 300, 2);
    this.pointLight.position.set(0, this.rowamount, this.rowamount);
    this.pointLight.castShadow = true;
    this.scene.add(this.pointLight);

    this.start();
  }

  componentDidUpdate(oldProps) {
    const newProps = this.props;
    if (oldProps !== newProps) {
      this.setState({ paused: newProps.paused, analyserNode: newProps.analyserNode });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
    document.querySelector(".canvas").removeEventListener('mousewheel', this.handleScroll);
    document.querySelector(".canvas").removeEventListener('dragstart', this.handleDrag);
    // document.querySelector(".canvas").removeEventListener('dragstart', this.handleDrag);
    // document.querySelector(".canvas").removeEventListener('mousemove', this.translateCamera);

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
    this.now = Date.now();
    this.delta = this.now - this.then;
    var before1, before2, duration1, duration2 = 0;

    if (this.delta > this.interval) {
      if (!this.state.paused) {
        stats.begin();

        // this.camera.position.z = 85;
        // this.camera.position.y = 20;
        // this.camera.rotation.x = -(Math.PI * 0.05);

        this.allrows.forEach((item, i) => {
          item.position.z -= 2;
          // this.allwireframes[i].position.z -= 2;
        });

        before1 = performance.now();
        this.updateFrequencies();
        duration1 = (performance.now() - before1);

        before2 = performance.now();
        this.createRow();
        duration2 = (performance.now() - before2);

        stats.end();
      }
      this.then = this.now - (this.delta % this.interval);
    }

    if (duration1 > 1) {
      // console.log("Tid att uppdatera frekvenser(ms):", duration1);
    }
    if (duration2 > 20) {
      // console.log("Tid att skapa en row(ms):", duration2);
    }

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        ref={(mount) => { this.mount = mount; }}
      />
    );
  }
}

export default ThreeScene;
