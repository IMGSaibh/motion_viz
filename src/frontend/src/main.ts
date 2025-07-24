import '@/custom.css'
import { App } from '@/app';


function main() 
{
	const container = document.querySelector<HTMLDivElement>('#scene-container');
	if (!container) 
	{
 		 throw new Error('Element #scene-container not found');
	}
	const app = new App(container);
		
	app.upload_files();
	app.motion_config_dropwown();

	app.convert_pv_style();
	app.convert_bvh_to_npy();
	// app.convert_csv_kinect_v1_to_npy();
	// app.convert_csv_c3d_to_npy();
	// app.convert_csv_segmentbased_to_npy();
	
	app.setup_file_dropdown();
	app.slider_preview_frame();
	
	app.print_updateables();

	app.cleanup_scene();

	// start the loop (produce a stream of frames)
	app.start();

	// app.stop();
}

main();