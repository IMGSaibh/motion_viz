// import '@/custom.css'
// import { App } from '@/app';


// function main() 
// {
// 	const container = document.querySelector<HTMLDivElement>('#scene-container');
// 	if (!container) 
// 	{
//  		 throw new Error('Element: #scene-container not found');
// 	}
// 	const app = new App(container);
		
// 	app.upload_files();
// 	app.motion_config_dropwown();

// 	app.convert_pv_style();
// 	app.convert_bvh_to_npy();
// 	app.setup_file_dropdown();
// 	app.slider_preview_frame();
	
// 	app.print_updateables();

// 	app.cleanup_scene();
// 	// start the loop (produce a stream of frames)
// 	app.start();

// 	// app.stop();
// }

// main();


import { createRoot } from "react-dom/client";
import { App } from "./app";
import "@/custom.css";

const container = document.getElementById("root");
if (container) 
{
  const root = createRoot(container);
  root.render(<App />);
}