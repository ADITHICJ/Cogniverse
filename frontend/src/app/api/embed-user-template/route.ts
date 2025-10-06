import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const templateData = await req.json();
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/embed-user-template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`);
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error("Embedding API error:", error);
    return NextResponse.json(
      { error: "Failed to update template embedding" },
      { status: 500 }
    );
  }
}