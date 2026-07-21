import { getRestPose } from "@/hooks/hook_generate_animation_clip"

const ENDPOINT_PREFIX = "/api_new_format";

export class FormatCreator {
    async createFormatFile(npy_url: string, format_name: string) {
        let restPoseResponse = await getRestPose(npy_url);
        const restpose = restPoseResponse.restPose;

        const filename = npy_url.split('/').pop() || '';
        const jsonFilename = filename.replace('.npy', '.json');
        const jsonUrl = `http://localhost:8000/data/json/${jsonFilename}`;

        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`Failed to get the json file ${jsonUrl} | status: ${response.status}`);
        }

        const json = await response.json();
        const jointGraph = json["joint-graph"];

        // Create the format object
        const formatData = {
            name: format_name,
            "joint-graph": jointGraph,
            "rest-pose": restpose
        };

        // Write to file via API
        const saveResponse = await fetch(`${ENDPOINT_PREFIX}/save_format`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: `${format_name}.json`,
                data: formatData
            })
        });

        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(`Failed to save format file: ${errorData.detail || saveResponse.statusText}`);
        }

        const result = await saveResponse.json();
        console.log(`Format file saved: ${result.path}`);
        return result;
    }
}