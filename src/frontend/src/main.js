import './custom.css'
import { App } from './app.js';

function main() 
{
	const container = document.querySelector('#scene-container');
	const app = new App(container);
		
	app.upload_files();
	
	app.convert_pv_style();
	app.convert_bvh_to_npy();
	app.convert_csv_kinect_v1_to_npy();
	app.convert_csv_c3d_to_npy();
	app.convert_csv_segmentbased_to_npy();
	
	app.setup_file_dropdown();

	// app.slider_preview_frame();
	
	app.cleanup_scene();
	app.print_updateables();

	// start the loop (produce a stream of frames)
	app.start();

	// app.stop();
}

main();