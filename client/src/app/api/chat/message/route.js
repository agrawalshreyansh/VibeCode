import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { message, chatId, timestamp } = await request.json();

        const data = fetch('https://api.example.com/process-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, chatId, timestamp })
        });

        const response = await data.then(res => res.json()).catch(err => { throw err;   
         })
        
        return NextResponse.json({
            response: response,
            chatId: chatId,
            timestamp: new Date().toISOString(),
            metadata: {
                processingTime: "1000ms",
                confidence: 0.95,
                sentiment: analyzeSentiment(message)
            }
        });
    } catch (error) {
        console.error('Error processing chat message:', error);
        return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500 }
        );
    }
}

// Simple sentiment analysis
function analyzeSentiment(text) {
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'joy'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'depressed', 'anxious'];
    
    const words = text.toLowerCase().split(' ');
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}