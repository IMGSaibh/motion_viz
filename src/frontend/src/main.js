import './custom.css'
import { App } from './app.js';

function main() 
{
	const container = document.querySelector('#scene-container');
	const app = new App(container);
	
	app.upload_file()
	// start the loop (produce a stream of frames)
	app.start();

	// app.stop();
}

main();