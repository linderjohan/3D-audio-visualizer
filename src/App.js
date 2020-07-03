import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import "./css/index.scss";

import ThreeScene from "./components/ThreeScene";
import Error from "./components/Error";
const song = require("./sju-sorger.mp3");

class App extends Component {
	render() {
		// let url = window.location.href.replace("http://", "").replace(".vlq.se", "").split("/");

		return (
			<Index />
			// <BrowserRouter>
			// 	<Switch>
			// 		<Route exact path={"/"} component={Index} />
			// 		<Route component={Error} />
			// 	</Switch>
			// </BrowserRouter>
		);
	}
}

//https://stackoverflow.com/questions/44188969/how-to-pass-the-match-when-using-render-in-route-component-from-react-router-v4
class Index extends Component {
	constructor() {
		super();

		this.state = {
			loading: true,
			created: false,
			paused: true,
			displayControls: { display: "" },
			analyserNode: {}
		};

		this.audioCtx = new AudioContext();

		this.update = this.update.bind(this);
		this.imageload = this.imageload.bind(this);
		this.handleUpload = this.handleUpload.bind(this);
		this.handlePlay = this.handlePlay.bind(this);
		this.handlePause = this.handlePause.bind(this);
	}

	handlePlay(e) {
		if (this.audioCtx.state !== "running") this.audioCtx.resume();
		this.setState({ paused: false });
	}

	handlePause(e) {
		this.setState({ paused: true });
	}

	handleUpload(e) {

		this.setState({ displayControls: { display: "block" } });
		// console.log(e.target.files[0]);





	}

	// handleMusicEnd(e) {
	// 	URL.revokeObjectURL(this.music.src);
	// }

	update() {
		this.setState({ loading: false });

	}

	imageload(e) {
		e.target.style.display = "block";
		e.target.parentNode.childNodes[0].style.display = "none";
	}

	componentDidMount() {
		// this.update();
		const AudioContext = (window.AudioContext || window.webkitAudioContext);

		this.setState({ created: true });
		this.music = document.getElementById('music');

		// this.music = test;
		this.music.src = song;
		// this.music.src = URL.createObjectURL(e.target.files[0]);

		const audioSourceNode = this.audioCtx.createMediaElementSource(this.music);

		const analyserNode = this.audioCtx.createAnalyser();
		analyserNode.fftSize = 8192;

		audioSourceNode.connect(analyserNode);
		analyserNode.connect(this.audioCtx.destination);
		this.setState({ analyserNode });

		this.frequencies = new Float32Array(analyserNode.frequencyBinCount);
		analyserNode.getFloatFrequencyData(this.frequencies);



	}
	componentWillUnmount() {
		this.setState({ paused: true });

	}
	componentDidUpdate() {


	}

	render() {
		// if (this.state.loading) {
		// 	return <div id="root-loading"><div className="root-spinner"></div></div>;
		// }

		return (
			<main className="wrapper">
				<div className="canvas" draggable="true">
					<ThreeScene analyserNode={this.state.analyserNode} paused={this.state.paused} />
				</div>
				<div className="menu">
					{/* <input type="file" id="input" onChange={this.handleUpload} /> */}
					<audio id="music" controls onPlay={this.handlePlay} onPause={this.handlePause} style={this.state.displayControls}></audio>
				</div>
			</main>
		);
	}
}

export default App;
//<Route exact path={settings.url + "verify/:string"} render={({match}) => <Verify username={this.state.username} match={match}></Verify>} />
