import axios from "axios";


export function api_motion_file_conversion()
{

    async function convert_with_pose_viewer() 
    {
        const response = await axios.post("http://localhost:8000/api_pose_viewer_conversion/convert_pv_style");
        return response;
    }

    async function convert_bvh() 
    {
        const response = await axios.post("http://localhost:8000/api_motion_file_conversion/convert_bvh_to_npy");
        return response;
    }

    return { 
    convert_with_pose_viewer: convert_with_pose_viewer,
    convert_bvh: convert_bvh
  };
}