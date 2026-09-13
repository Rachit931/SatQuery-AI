import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const message = formData.get('message') as string;
    const mapContextStr = formData.get('mapContext') as string;
    const watchZoneContextStr = formData.get('watchZoneContext') as string;
    const image = formData.get('image') as File | null;

    let mapContext = null;
    let watchZoneContext = null;
    
    if (mapContextStr) {
      try { mapContext = JSON.parse(mapContextStr); } catch (e) {}
    }
    if (watchZoneContextStr) {
      try { watchZoneContext = JSON.parse(watchZoneContextStr); } catch (e) {}
    }

    // Simulate backend processing time for the demo
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Construct a context-aware response based on the inputs
    let reply = `I am analyzing your request: "${message}"\n\n`;

    if (image) {
      reply += `**Visual Analysis:** I have processed the uploaded image (${image.name}). No significant anomalies detected.\n\n`;
    }

    if (watchZoneContext) {
      reply += `**Watch Zone [${watchZoneContext.name}]:** Integrating active monitoring parameters.\n\n`;
    } else if (mapContext && mapContext.center) {
      reply += `**Location:** Analyzed region at ${mapContext.center.lat.toFixed(4)}° N, ${mapContext.center.lng.toFixed(4)}° E.\n\n`;
    }

    if (message.toLowerCase().includes('change') || message.toLowerCase().includes('flooding')) {
      reply += `Based on recent Sentinel-2 imagery of this area, vegetation and water levels appear stable over the last 30 days. No severe changes or flooding signatures are immediately visible in the optical bands.`;
    } else {
      reply += `The requested coordinates show standard urban/environmental signatures. Let me know if you want to run a specific bi-temporal change detection or analyze a specific spectral index.`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
