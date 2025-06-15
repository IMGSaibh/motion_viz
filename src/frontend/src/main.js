import './custom.css'
import { App } from './app.js';

function main() 
{
	const container = document.querySelector('#scene-container');
	const app = new App(container);
		
	app.upload_files();
	app.convert_bvh_to_npy();
	app.convert_csv_to_npy();
	app.setup_file_dropdown();
	app.cleanup_scene();
	app.print_updateables();
	// start the loop (produce a stream of frames)
	app.start();

	// app.stop();
}

main();