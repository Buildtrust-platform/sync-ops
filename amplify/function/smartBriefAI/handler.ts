/* eslint-disable @typescript-eslint/no-explicit-any */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'eu-central-1' });

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

  // Extract arguments from GraphQL event
  const { projectDescription, scriptOrNotes } = event.arguments || {};

  if (!projectDescription) {
    throw new Error('projectDescription is required');
  }

  // Construct enhanced Bedrock prompt for professional creative proposals
  const prompt = `You are an elite Creative Director and Executive Producer at a world-class production company. You have 20+ years of experience creating award-winning content for global brands like Apple, Nike, and Netflix.

Your task is to transform a client's plain English project description into a professional production brief with THREE distinct creative proposals. Each proposal should be highly creative, technically precise, and production-ready.

PROJECT DESCRIPTION FROM CLIENT:
${projectDescription}

${scriptOrNotes ? `ADDITIONAL NOTES/SCRIPT:\n${scriptOrNotes}` : ''}

Generate a comprehensive JSON response with the following structure. Be exceptionally creative and professional - think Cannes Lions, Emmy-worthy content:

{
  "projectName": "Compelling, professional project name",
  "technicalSummary": "Transform the client's plain English into industry-standard technical language. Use proper production terminology. Be comprehensive but concise. Include format specifications, production approach, and delivery requirements.",
  "deliverables": ["Specific deliverables with formats, e.g., '1x Hero Film (16:9, 4K ProRes 422 HQ, 60s)', '3x Social Cutdowns (9:16, 15s each)', 'BTS Sizzle (2min)'],
  "estimatedDuration": "Primary deliverable duration",
  "targetAudience": "Detailed audience profile with demographics, psychographics, and viewing context",
  "tone": "Specific tonal direction with reference points (e.g., 'Cinematic gravitas with understated warmth - think Apple's "Shot on iPhone" meets Patagonia's environmental advocacy')",
  "budgetRange": "Detailed tier with justification (e.g., 'PREMIUM ($75K-$150K) - Multi-day shoot, specialized equipment, talent, post-production')",
  "crewRoles": ["Director", "DP (Director of Photography)", "1st AC", "Gaffer", "Key Grip", "Sound Mixer", "DIT", "Production Designer", "Wardrobe Stylist", "HMU (Hair/Makeup)", "Production Coordinator", "Editor", "Colorist", "Sound Designer", "Composer"],
  "risks": {
    "drones": true/false,
    "minors": true/false,
    "publicSpaces": true/false,
    "stunts": true/false,
    "hazardousLocations": true/false
  },
  "requiredPermits": ["Specific permits needed"],
  "scenes": [
    {
      "description": "Scene description",
      "location": "Location type",
      "props": ["Props needed"]
    }
  ],
  "complexity": "LOW" | "MEDIUM" | "HIGH",
  "creativeProposals": [
    {
      "id": "proposal-1",
      "name": "Creative approach name (e.g., 'Cinematic Narrative Journey')",
      "concept": "Detailed creative vision (200-300 words). Explain the emotional arc, visual metaphors, and how this approach uniquely solves the client's objectives. Be specific about creative choices and their rationale.",
      "visualStyle": "Detailed cinematography approach. Reference specific techniques, camera movements, color palette, lighting philosophy. Example: 'Anamorphic lenses (Cooke SF) for organic lens flares and oval bokeh. Natural light augmented with negative fill. Desaturated palette with teal shadows and warm skin tones. Motivated camera movement - Steadicam for intimate following shots, technocrane for reveals.'",
      "narrativeApproach": "Storytelling methodology. Structure (3-act, vignette, stream-of-consciousness), POV, character development approach, emotional beats.",
      "moodBoard": ["Visual reference 1 - be specific (e.g., 'Emmanuel Lubezki's natural light work in The Revenant')", "Reference 2", "Reference 3", "Reference 4", "Reference 5"],
      "script": {
        "voiceover": "Full voiceover script with proper formatting. Include pauses, emphasis marks. Write in a compelling, professional tone appropriate to the creative direction.",
        "onScreenText": ["Text card 1", "Text card 2", "End card with CTA"],
        "dialogues": [
          {"speaker": "CHARACTER NAME", "line": "Dialogue line"}
        ]
      },
      "shotList": [
        {
          "shotNumber": 1,
          "shotType": "Extreme Wide Establishing",
          "description": "Dawn breaks over city skyline. Golden hour light cuts through morning mist. Silhouetted figure emerges from subway entrance.",
          "duration": "4s",
          "framing": "Subject lower third, skyline fills upper 2/3",
          "movement": "Technocrane rise, 15ft to 25ft",
          "notes": "VFX: Add subtle god rays. Shoot magic hour 6:15-6:45am."
        }
      ],
      "estimatedBudget": "$XX,XXX - $XX,XXX",
      "estimatedDays": 3,
      "technicalRequirements": {
        "camera": "ARRI Alexa Mini LF with Cooke S7/i Full Frame Plus lenses",
        "lens": "32mm, 50mm, 75mm, 100mm primes + 45-250mm zoom",
        "lighting": "ARRI Orbiter LED package, SkyPanels, Astera tubes for practicals, 12x12 silk and solid",
        "audio": "Sound Devices 833, Sennheiser MKH416 boom, Sanken COS-11D lavs",
        "specialEquipment": ["Technocrane 30ft", "Steadicam Volt", "Dana Dolly", "DJI Ronin 2"]
      },
      "postProduction": {
        "colorGrade": "Film emulation (Kodak 5219 500T). Rich blacks, lifted shadows, warm highlights. Reference: Roger Deakins' work on Sicario.",
        "vfx": "Sky replacement, set extensions, beauty work, subtle particle effects",
        "soundDesign": "Layered ambient beds, foley for texture, designed transitions, LFE impacts",
        "music": "Original score - orchestral with modern synth elements. Reference: Hans Zimmer meets Trent Reznor."
      }
    },
    {
      "id": "proposal-2",
      "name": "Second creative approach - distinctly different style",
      "...": "Same structure as above but with completely different creative direction"
    },
    {
      "id": "proposal-3",
      "name": "Third creative approach - another unique direction",
      "...": "Same structure as above but with another unique perspective"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Each proposal MUST be genuinely distinct - different visual styles, narrative approaches, and production methodologies
2. Shot lists should have 8-15 shots minimum, properly sequenced to tell the story
3. Scripts should be polished and production-ready
4. Technical requirements should be realistic and appropriate to the budget tier
5. Reference real equipment, techniques, and industry-standard workflows
6. Be specific with durations, framings, and camera movements
7. Include creative rationale - explain WHY each choice serves the story

Return ONLY the JSON object, no additional text or markdown formatting.`;

  try {
    // Invoke Bedrock with increased token limit for comprehensive response
    const bedrockRequest = {
      modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 8000, // Increased for comprehensive proposals
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
