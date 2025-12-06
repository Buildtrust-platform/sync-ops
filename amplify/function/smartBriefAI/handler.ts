/* eslint-disable @typescript-eslint/no-explicit-any */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

interface SmartBriefOutput {
  projectName: string;
  deliverables: string[];
  estimatedDuration: string;
  targetAudience: string;
  tone: string;
  budgetRange: string;
  crewRoles: string[];
  risks: {
    drones: boolean;
    minors: boolean;
    publicSpaces: boolean;
    stunts: boolean;
    hazardousLocations: boolean;
  };
  requiredPermits: string[];
  scenes: Array<{
    description: string;
    location: string;
    props?: string[];
  }>;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const handler = async (event: any) => {
  console.log('Smart Brief AI processing started');
  console.log('Event:', JSON.stringify(event, null, 2));

  // Extract arguments from GraphQL event
  const { projectDescription, scriptOrNotes } = event.arguments || {};

  if (!projectDescription) {
    throw new Error('projectDescription is required');
  }

  // Construct Bedrock prompt
  const prompt = `You are an AI assistant for SyncOps, a global media production operating system.
Analyze the following project description and extract structured information for planning a media production.

Project Description:
${projectDescription}

${scriptOrNotes ? `Additional Script/Notes:\n${scriptOrNotes}` : ''}

Extract and return a JSON object with the following structure:
{
  "projectName": "Suggested concise project name",
  "deliverables": ["List of expected deliverables like 'Social Media Video', '30s TV Spot', etc."],
  "estimatedDuration": "Estimated final video duration (e.g., '30 seconds', '2 minutes', '5-10 minutes')",
  "targetAudience": "Identified target audience",
  "tone": "Creative tone (e.g., 'Professional', 'Energetic', 'Emotional', 'Humorous')",
  "budgetRange": "Suggested budget tier (e.g., 'LOW ($1k-$5k)', 'MEDIUM ($5k-$20k)', 'HIGH ($20k+)')",
  "crewRoles": ["List of required crew roles like 'Director', 'DP', 'Sound Engineer', 'Editor', etc."],
  "risks": {
    "drones": true/false (does project mention aerial shots, drones?),
    "minors": true/false (does project involve children?),
    "publicSpaces": true/false (filming in public areas, streets, malls?),
    "stunts": true/false (any dangerous actions, stunts?),
    "hazardousLocations": true/false (water, heights, confined spaces?)
  },
  "requiredPermits": ["List of likely needed permits based on risks identified"],
  "scenes": [
    {
      "description": "Brief scene description",
      "location": "Location type (e.g., 'Office', 'Outdoor Park', 'Studio')",
      "props": ["List of key props if mentioned"]
    }
  ],
  "complexity": "LOW" | "MEDIUM" | "HIGH" (overall production complexity)
}

Return ONLY the JSON object, no additional text.`;

  try {
    // Invoke Bedrock
    const bedrockRequest = {
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    };

    console.log('Calling Bedrock with model:', bedrockRequest.modelId);

    const command = new InvokeModelCommand(bedrockRequest);
    const response = await bedrockClient.send(command);

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log('Bedrock response:', JSON.stringify(responseBody, null, 2));

    // Extract the AI response
    const aiResponse = responseBody.content[0].text;

    // Parse the JSON from AI response
    const briefData: SmartBriefOutput = JSON.parse(aiResponse);

    console.log('Extracted brief data:', JSON.stringify(briefData, null, 2));

    // Return the data directly for GraphQL
    return briefData;
  } catch (error: any) {
    console.error('Error processing smart brief:', error);
    throw new Error(`Failed to process smart brief: ${error.message}`);
  }
};
