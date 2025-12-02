import { API_URL } from '../constants/Config';
import { MedicalEvent } from '../constants/Types';

export interface AnalyzeImageResponse {
  category: string;
  summary: string;
  context_text: string;
  extracted_events: MedicalEvent[];
  embedding: number[];
}

class ApiService {
  async analyzeImage(uri: string, categories: string[] = [], allowNewCategories: boolean = true): Promise<AnalyzeImageResponse> {
    const formData = new FormData();
    
    // Append file
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // @ts-ignore: FormData expects { uri, name, type } for React Native
    formData.append('file', { uri, name: filename, type });

    // Append categories
    categories.forEach(category => {
      formData.append('categories', category);
    });

    // Append allow_new_categories
    formData.append('allow_new_categories', String(allowNewCategories));

    console.log('[ApiService] Sending request to:', `${API_URL}/analyze-image`);
    console.log('[ApiService] FormData:', JSON.stringify({ uri, filename, type, categories, allowNewCategories }));

    try {
      const response = await fetch(`${API_URL}/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      console.log('[ApiService] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("[ApiService] Response error text:", errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('[ApiService] Response data:', JSON.stringify(data).substring(0, 200) + '...'); // Log first 200 chars
      return data as AnalyzeImageResponse;
    } catch (error) {
      console.error('[ApiService] Error analyzing image:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
