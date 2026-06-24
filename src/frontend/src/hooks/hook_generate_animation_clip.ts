const ENDPOINT = '/api_generate_animation_clip/generate_clip';

export async function generateAnimationClip(filePath: string) {
    try {
        const response = await fetch(`${ENDPOINT}?filePath=${encodeURIComponent(filePath)}`, {
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