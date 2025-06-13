import './custom.css'
import { App } from './app.js';

function main() 
{
	const container = document.querySelector('#scene-container');
	const app = new App(container);
	
	app.initialize();
	app.upload_files();
	app.process_bvh_files();
	app.process_csv_files();
	
	// start the loop (produce a stream of frames)
	app.start();

	// app.stop();
}

main();