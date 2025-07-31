export function api_file_upoload() 
{
  async function fireBackend(endpoint: string) 
  {
    const response = await fetch(`http://localhost:8000/api_backend_file_upload/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
      // body: JSON.stringify({...}), falls du Daten senden willst
    });
    return await response.json();
  }

  return { fireBackend };
}
