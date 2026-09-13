export interface MapContext {
  center: { lat: number; lng: number } | null;
  bounds: string | null;
  zoom: number;
}

export interface WatchZoneContext {
  id: string;
  name: string;
  geometry: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIAnalysisRequest {
  message: string;
  conversationId?: string;
  mapContext?: MapContext;
  watchZoneContext?: WatchZoneContext | null;
  imageryContext?: any;
  imageFile1?: File | null;
  imageFile2?: File | null;
}

export const aiProvider = {
  async analyzeConversation(request: AIAnalysisRequest): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('query', request.message);
      if (request.imageFile1) {
        formData.append('image1', request.imageFile1);
      }
      if (request.imageFile2) {
        formData.append('image2', request.imageFile2);
      }

      const response = await fetch('http://127.0.0.1:8000/query', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Intelligence service is temporarily unavailable.');
      }

      const data = await response.json() as any;
      return data.answer || 'Analysis complete.';
    } catch (error) {
      console.error('AI Provider Error:', error);
      throw error;
    }
  },
};
