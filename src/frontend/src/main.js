import './custom.css'
import { App } from './app.js';

function main() 
{
	const container = document.querySelector('#scene-container');
	const app = new App(container);
	// produce a single frame (render on demand)
	// world.render();
	
	// start the loop (produce a stream of frames)
	app.start();

	// world.stop();
}

main();