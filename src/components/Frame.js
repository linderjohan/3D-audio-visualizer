import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Canvas } from 'react-three-fiber'
import * as THREE from 'three';

class Frame extends Component {
  constructor(){
		super();

		// this.state = {
		// 	loading: true
		// };

	}

  componentDidUpdate() {
    ReactDOM.render(
      <Canvas>
        <Thing/>
      </Canvas>,
      document.getElementById('root')
    )
  }

	render() {
    return (
      <Canvas>
        <Thing/>
      </Canvas>
		);
	}
}

class Thing extends Component {
  constructor() {
    super();
    this.state = {
      vertices: [[-1, 0, 0], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0]]
    }
  }
  render() {
    return (
      <group ref={ref => console.log('we have access to the instance')}>
        <line>
          <geometry
            attach="geometry"
            vertices={this.state.vertices.map(v => new THREE.Vector3(...v))}
            onUpdate={self => (self.verticesNeedUpdate = true)}
          />
          <lineBasicMaterial attach="material" color="black" />
        </line>
        <mesh
          onClick={e => console.log('click')}
          onPointerOver={e => console.log('hover')}
          onPointerOut={e => console.log('unhover')}>
          <octahedronGeometry attach="geometry" />
          <meshBasicMaterial attach="material" color="peachpuff" opacity={0.5} transparent />
        </mesh>
      </group>
    )
  }
}

export default Frame;
