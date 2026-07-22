import { VirtualNode } from "./skeleton_mapper";

const ENDPOINT_PREFIX = '/api_recorder';

export class Recorder {
    private isRecording: boolean = false;

    async setupRecording(
        npy_url: string, 
        srcToDestMap: Map<number, number>, 
        virtualNodes: VirtualNode[],
        targetFormat: string
    ): Promise<boolean> {
        try {
            // Validate input data
            if (!npy_url || npy_url.length === 0) {
                console.error("No NPY data provided");
                return false;
            }

            if (!srcToDestMap || srcToDestMap.size === 0) {
                console.error("No source-to-destination mapping provided");
                return false;
            }
            const srcToDestMapArray = Array.from(srcToDestMap.entries());

            // Send to backend
            const response = await fetch(`${ENDPOINT_PREFIX}/setup_recording`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    npy_url: npy_url,
                    src_dest_map: srcToDestMapArray,
                    virtual_nodes: virtualNodes,
                    target_format: targetFormat
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Setup recording failed:", errorData);
                return false;
            }

            const result = await response.json();
            console.log("Setup recording successful:", result);
            this.isRecording = true;
            return true;

        } catch (error) {
            console.error("Error setting up recording:", error);
            return false;
        }
    }

async record(): Promise<boolean> {
    if (!this.isRecording) {
        console.error("Recording not set up");
        return false;
    }

    try {
        const response = await fetch(`${ENDPOINT_PREFIX}/record`)

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Record failed:", errorData);
            return false;
        }

        const result = await response.json();
        console.log("Record result:", result);
        
        if (result.is_complete) {
            console.log(`Recording complete! ${result.frames_recorded} frames saved to ${result.saved_to}`);
            this.isRecording = false;
        }
        
        return true;

    } catch (error) {
        console.error("Error recording:", error);
        return false;
    }
}}