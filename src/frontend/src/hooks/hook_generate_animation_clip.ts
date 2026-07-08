const ENDPOINT_PREFIX = '/api_get_npy_data';

export async function generateAnimationClip(filePath: string) {
    try {
        const response = await fetch(`${ENDPOINT_PREFIX}/generate_clip?filePath=${encodeURIComponent(filePath)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error generating animation clip:', error);
        throw error;
    }
}

export async function getRestPose(filePath: string) {
    const response = await fetch(`${ENDPOINT_PREFIX}/get_rest_pose?filePath=${encodeURIComponent(filePath)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}