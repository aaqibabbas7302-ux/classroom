import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, webhookUrl, subject, subjectName, className, board, sessionId, userId } = body;

    if (!message || !webhookUrl) {
      return NextResponse.json(
        { error: 'Message and webhook URL are required' },
        { status: 400 }
      );
    }

    console.log('=== Chat API Request ===');
    console.log('Webhook URL:', webhookUrl);
    console.log('Message:', message);

    // Send message to n8n webhook with all subject details
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        subject,
        subjectName,
        className,
        board,
        timestamp: new Date().toISOString(),
        sessionId,
        userId,
      }),
    });

    console.log('Webhook response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', errorText);
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    // Read the response as text
    const rawText = await response.text();
    console.log('Raw webhook response (first 500 chars):', rawText.substring(0, 500));

    if (!rawText || rawText.trim() === '') {
      throw new Error('Empty response from webhook');
    }

    let aiResponse: string = rawText;

    // Try to parse as JSON if it looks like JSON
    if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        const data = JSON.parse(rawText);
        aiResponse = data.response || data.message || data.output || data.text || data.answer || rawText;
      } catch {
        // Not valid JSON, use as plain text
        aiResponse = rawText;
      }
    }

    // Clean up the response
    if (typeof aiResponse === 'string') {
      // Remove surrounding quotes if present
      if (aiResponse.startsWith('"') && aiResponse.endsWith('"') && aiResponse.length > 2) {
        aiResponse = aiResponse.slice(1, -1);
      }
      // Unescape characters
      aiResponse = aiResponse
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }

    console.log('=== Sending response to client ===');
    console.log('Response length:', aiResponse.length);

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI teacher';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
