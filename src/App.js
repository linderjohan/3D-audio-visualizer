import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect, NavLink as Link } from 'react-router-dom';

import settings from "./settings.json";

import ThreeScene from "./components/ThreeScene";
import Error from "./components/Error";

class App extends Component {
	render() {
		let url = window.location.href.replace("http://", "").replace(".vlq.se", "").split("/");

		return(
			<BrowserRouter>
				<Switch>
					<Route exact path={settings.url + "/"} component={Index}/>
					<Route component={Error} />
				</Switch>
			</BrowserRouter>
		);
	}
}

//https://stackoverflow.com/questions/44188969/how-to-pass-the-match-when-using-render-in-route-component-from-react-router-v4
class Index extends Component {
	constructor(){
		super();

		this.state = {
			loading: true
		};

		this.update = this.update.bind(this);
		this.imageload = this.imageload.bind(this);
	}

	update() {
		this.setState({loading: false});
	}

	imageload(e) {
		e.target.style.display = "block";
		e.target.parentNode.childNodes[0].style.display = "none";
	}

	componentDidMount() {
		this.update();
	}

	render() {
		if(this.state.loading) {
			return <div id="root-loading"><div className="root-spinner"></div></div>;
		}

		return(
			<div>
				<main className="wrapper">
					<ThreeScene/>
				</main>
			</div>
		);
	}
}

export default App;
//<Route exact path={settings.url + "verify/:string"} render={({match}) => <Verify username={this.state.username} match={match}></Verify>} />
