import './style.scss'
import React from 'react';
import { render } from 'react-dom';



class App extends React.Component {

	state = {
		currentTime: 0,
	}

	componentDidMount() {
	


	}

	render() {
		return <div>
			

			<div id="wrap">
			
			</div>
1
1
1
1
1
1
			<div onClick={() => {
				this.bs.play();
			}}>play</div>
			1
			1
			1
			1
			1
			1
			1
			1
			<div onClick={() => {
				this.bs.pause(true);
			}}>pause</div>

		</div>
	}
}



render(
<App/>
, document.getElementById('root'))



