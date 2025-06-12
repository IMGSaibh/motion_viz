import './custom.css'
import { App } from './app.js';

function main() 
{
	const container = document.querySelector('#scene-container');
	const app = new App(container);
	
	app.upload_files();
	app.process_bvh_files();

	// app.upload_file();
	app.process_csv2numpy();
	app.initialize();
	
	// start the loop (produce a stream of frames)
	app.start();

	// app.stop();
}

main();