import axios from "axios";

export type MotionDescriptorData = 
{
  format: string;
  abbrev: string;
  scale: number;
  positions: string;
  rotations: string;
  systemname: string;
  fps: number;
  jointcount: number;
  coloffset: number;
  colgap: number;
  dimsize: number;
};

export function api_file_processing() 
{
  async function upload_files(files: File[])
  {
    const formData = new FormData();
    files.forEach(file => { formData.append("files", file);});

    const response = await axios.post("http://localhost:8000/api_file_upload/upload", formData, 
    {
      headers: 
      {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  async function create_motion_descriptor(data: MotionDescriptorData) 
  {
    const response = await axios.post("http://localhost:8000/api_motion_descriptor/motion_descriptor", data);
    return response;
  }

  async function list_motion_files() 
  {
    const response = await axios.post("http://localhost:8000/api_list_files/list_files");
    return response;
  }

  return { 
    upload_files: upload_files, 
    create_motion_descriptor: create_motion_descriptor,
    list_motion_files: list_motion_files
  };
}
