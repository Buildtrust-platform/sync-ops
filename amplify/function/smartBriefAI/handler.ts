/* eslint-disable @typescript-eslint/no-explicit-any */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'eu-central-1' });

// Simple in-memory rate limiter (10 requests per minute per user)
class RateLimiter {
  private requests = new Map<string, { count: number; windowStart: number }>();
  constructor(private maxRequests = 10, private windowSeconds = 60) {}

  check(identifier: string): { allowed: boolean; remaining: number } {
    const now = Math.floor(Date.now() / 1000);
    const record = this.requests.get(identifier);
    if (!record || record.windowStart < now - this.windowSeconds) {
      this.requests.set(identifier, { count: 1, windowStart: now });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }
    if (record.count >= this.maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    record.count++;
    return { allowed: true, remaining: this.maxRequests - record.count };
  }
}

const rateLimiter = new RateLimiter(10, 60);

function getUserId(event: any): string {
  return event.identity?.sub || event.identity?.username || 'anonymous';
}

interface ShotListItem {
  shotNumber: number;
  shotType: string; // "Wide", "Medium", "Close-up", "POV", "Aerial", "Tracking", etc.
  description: string;
  duration: string; // "3s", "5s", etc.
  framing: string; // "Subject center frame", "Rule of thirds", etc.
  movement: string; // "Static", "Pan left", "Dolly in", "Crane up", etc.
  notes: string;
}

interface CreativeProposal {
  id: string;
  name: string;
  concept: string;
  visualStyle: string;
  narrativeApproach: string;
  moodBoard: string[];
  script: {
    voiceover: string;
    onScreenText: string[];
    dialogues: Array<{ speaker: string; line: string }>;
  };
  shotList: ShotListItem[];
  estimatedBudget: string;
  estimatedDays: number;
  technicalRequirements: {
    camera: string;
    lens: string;
    lighting: string;
    audio: string;
    specialEquipment: string[];
  };
  postProduction: {
    colorGrade: string;
    vfx: string;
    soundDesign: string;
    music: string;
  };
}

interface SmartBriefOutput {
  projectName: string;
  technicalSummary: string; // Plain English translated to technical language
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
  creativeProposals: CreativeProposal[];
}

export const handler = async (event: any) => {
  console.log('Smart Brief AI processing started');
  console.log('Event:', JSON.stringify(event, null, 2));

  // Rate limiting check
  const userId = getUserId(event);
  const rateCheck = rateLimiter.check(userId);
  if (!rateCheck.allowed) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }
  console.log(`Rate limit: ${rateCheck.remaining} requests remaining for user ${userId}`);

  // Extract arguments from GraphQL event
  const { projectDescription, scriptOrNotes } = event.arguments || {};

  // Input validation
  if (!projectDescription) {
    throw new Error('projectDescription is required');
  }
  if (typeof projectDescription !== 'string') {
    throw new Error('projectDescription must be a string');
  }
  if (projectDescription.length < 10) {
    throw new Error('projectDescription must be at least 10 characters');
  }
  if (projectDescription.length > 10000) {
    throw new Error('projectDescription must not exceed 10,000 characters');
  }
  if (scriptOrNotes && typeof scriptOrNotes !== 'string') {
    throw new Error('scriptOrNotes must be a string');
  }
  if (scriptOrNotes && scriptOrNotes.length > 50000) {
    throw new Error('scriptOrNotes must not exceed 50,000 characters');
  }

  // Construct optimized Bedrock prompt - streamlined for faster response while maintaining quality
  const prompt = `You are an elite Creative Director. Transform this project description into a professional production brief with THREE distinct creative proposals.

PROJECT: ${projectDescription}
${scriptOrNotes ? `NOTES: ${scriptOrNotes}` : ''}

Return a JSON object with this exact structure:

{
  "projectName": "Professional project name",
  "technicalSummary": "Technical description using industry terminology (2-3 sentences)",
  "deliverables": ["1x Hero Film (16:9, 4K, 60s)", "3x Social Cutdowns (9:16, 15s)"],
  "estimatedDuration": "60 seconds",
  "targetAudience": "Brief audience profile",
  "tone": "Tonal direction with reference",
  "budgetRange": "TIER ($XX-$XXK) - Brief justification",
  "crewRoles": ["Director", "DP", "Gaffer", "Sound", "Editor"],
  "risks": {"drones": false, "minors": false, "publicSpaces": false, "stunts": false, "hazardousLocations": false},
  "requiredPermits": ["List if needed"],
  "scenes": [{"description": "Scene", "location": "Location", "props": ["Props"]}],
  "complexity": "MEDIUM",
  "creativeProposals": [
    {
      "id": "proposal-1",
      "name": "Creative Approach Name",
      "concept": "Creative vision (100 words max). Emotional arc and visual approach.",
      "visualStyle": "Cinematography: camera, lighting, color palette (50 words)",
      "narrativeApproach": "Storytelling structure and POV (30 words)",
      "moodBoard": ["Visual reference 1", "Reference 2", "Reference 3"],
      "script": {
        "voiceover": "Voiceover script (if applicable)",
        "onScreenText": ["Text 1", "Text 2"],
        "dialogues": [{"speaker": "Name", "line": "Line"}]
      },
      "shotList": [
        {"shotNumber": 1, "shotType": "Wide", "description": "Shot description", "duration": "4s", "framing": "Framing", "movement": "Movement", "notes": "Notes"},
        {"shotNumber": 2, "shotType": "Medium", "description": "Description", "duration": "3s", "framing": "Framing", "movement": "Movement", "notes": ""},
        {"shotNumber": 3, "shotType": "Close", "description": "Description", "duration": "2s", "framing": "Framing", "movement": "Movement", "notes": ""},
        {"shotNumber": 4, "shotType": "Detail", "description": "Description", "duration": "2s", "framing": "Framing", "movement": "Movement", "notes": ""},
        {"shotNumber": 5, "shotType": "Wide", "description": "Description", "duration": "3s", "framing": "Framing", "movement": "Movement", "notes": ""}
      ],
      "estimatedBudget": "$XX,XXX - $XX,XXX",
      "estimatedDays": 2,
      "technicalRequirements": {"camera": "Camera", "lens": "Lenses", "lighting": "Lighting", "audio": "Audio", "specialEquipment": ["Equipment"]},
      "postProduction": {"colorGrade": "Color approach", "vfx": "VFX needs", "soundDesign": "Sound approach", "music": "Music style"}
    },
    {
      "id": "proposal-2",
      "name": "Different Approach Name",
      "concept": "Different creative direction",
      "visualStyle": "Different visual approach",
      "narrativeApproach": "Different storytelling",
      "moodBoard": ["Ref 1", "Ref 2", "Ref 3"],
      "script": {"voiceover": "", "onScreenText": [], "dialogues": []},
      "shotList": [
        {"shotNumber": 1, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 2, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 3, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 4, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 5, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""}
      ],
      "estimatedBudget": "$XX,XXX - $XX,XXX",
      "estimatedDays": 2,
      "technicalRequirements": {"camera": "Camera", "lens": "Lenses", "lighting": "Lighting", "audio": "Audio", "specialEquipment": []},
      "postProduction": {"colorGrade": "Color", "vfx": "VFX", "soundDesign": "Sound", "music": "Music"}
    },
    {
      "id": "proposal-3",
      "name": "Third Unique Direction",
      "concept": "Third distinct approach",
      "visualStyle": "Third visual style",
      "narrativeApproach": "Third narrative",
      "moodBoard": ["Ref 1", "Ref 2", "Ref 3"],
      "script": {"voiceover": "", "onScreenText": [], "dialogues": []},
      "shotList": [
        {"shotNumber": 1, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 2, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 3, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 4, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""},
        {"shotNumber": 5, "shotType": "Type", "description": "Desc", "duration": "3s", "framing": "Frame", "movement": "Move", "notes": ""}
      ],
      "estimatedBudget": "$XX,XXX - $XX,XXX",
      "estimatedDays": 2,
      "technicalRequirements": {"camera": "Camera", "lens": "Lenses", "lighting": "Lighting", "audio": "Audio", "specialEquipment": []},
      "postProduction": {"colorGrade": "Color", "vfx": "VFX", "soundDesign": "Sound", "music": "Music"}
    }
  ]
}

RULES:
1. Each proposal MUST be genuinely distinct in style and approach
2. Provide exactly 5 shots per proposal (minimum)
3. Keep descriptions concise but professional
4. Return ONLY valid JSON, no markdown or extra text`;

  try {
    // Invoke Bedrock with optimized settings for faster response
    const bedrockRequest = {
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4096, // Optimized for concise proposals
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
    console.log('Bedrock response received, parsing...');

    // Extract the AI response
    const aiResponse = responseBody.content[0].text;

    // Clean the response - remove any markdown code blocks if present
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    // Parse the JSON from AI response
    const briefData: SmartBriefOutput = JSON.parse(cleanedResponse);

    console.log('Extracted brief data with', briefData.creativeProposals?.length || 0, 'creative proposals');

    // Return the data directly for GraphQL
    return briefData;
  } catch (error: any) {
    console.error('Error processing smart brief:', error);
    throw new Error(`Failed to process smart brief: ${error.message}`);
  }
};
