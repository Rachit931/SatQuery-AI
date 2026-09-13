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
  image?: File | null;
}

export const aiProvider = {
  async analyzeConversation(request: AIAnalysisRequest): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('message', request.message);
      
      if (request.conversationId) {
        formData.append('conversationId', request.conversationId);
      }
      if (request.mapContext) {
        formData.append('mapContext', JSON.stringify(request.mapContext));
      }
      if (request.watchZoneContext) {
        formData.append('watchZoneContext', JSON.stringify(request.watchZoneContext));
      }
      if (request.image) {
        formData.append('image', request.image);
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Intelligence service is temporarily unavailable.');
      }

      const data = await response.json() as any;
      return data.reply || 'Analysis complete.';
    } catch (error) {
      console.error('AI Provider Error:', error);
      throw error;
    }
  },
};
