import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'API_KEY'
});

export async function getChatGptResponse(request: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{"role": "developer", "content": "You are a helpful assistant that answers questions on recycling and other kinds of waste disposal."},{ role: 'user', content: request }],
    });

   
    const messageContent = response.choices[0]?.message?.content || 'No response received';
    return messageContent;
  } catch (err) {
    console.error('Error fetching response from OpenAI:', err);
    throw new Error('Failed to get a response from OpenAI.');
  }
}

export async function analyzeImageWithOpenAI(base64Image: string, location: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'developer',
          content: `
            Start the response with "The [primary identified item (in italics)] belongs in the [Recycling/Garbage/Compost/Misc. (in bold and with the first letter capitalized)] bin". 
            Then give further steps and details on the item's proper form of disposal, considering the user's location (${location}) and information regarding their local guidelines when making recommendations if it's set.
          `,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify the primary object in this image and detail how to properly dispose of it.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'low' } },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || 'No response received';
  } catch (err) {
    console.error('Error analyzing image with GPT:', err);
    throw new Error('Failed to analyze the image with GPT.');
  }
}