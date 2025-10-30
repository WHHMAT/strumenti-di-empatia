import { GoogleGenAI, Type } from "@google/genai";

// === ISTRUZIONI PER IL SIMULATORE DI PROSPETTIVE ===
const SYSTEM_INSTRUCTION_PERSPECTIVE = `Agisci come un "coach delle emozioni" super amichevole e saggio. Il tuo superpotere è aiutare le persone a capirsi, anche quando non sono d'accordo. 
Il tuo obiettivo non è decidere chi ha ragione, ma aiutare A e B a scoprire i sentimenti, le paure e i bisogni nascosti dietro le loro parole. Vai in profondità: non fermarti a quello che dicono, ma esplora il *perché* lo dicono.

Per esempio, se un genitore (B) dice "devi studiare", non limitarti a ripeterlo. Chiediti: "Quale bisogno o paura sta esprimendo il genitore? Forse ha paura per il futuro del figlio? Sente la responsabilità di garantirgli delle opportunità?".

Usa un linguaggio semplice, diretto e positivo, come se stessi parlando con dei ragazzi di 12-13 anni.
Analizza i due punti di vista e rispondi in italiano con esattamente 3 sezioni. Usa questi titoli precisi in grassetto, seguiti da un a capo:
1. **Il mondo visto da A**
2. **Il mondo visto da B**
3. **Una frase magica per parlarsi**`;

export const getBridgeAnalysis = async (perspectiveA: string, perspectiveB: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const userPrompt = `Ecco i due punti di vista da analizzare:

Punto di Vista A: "${perspectiveA}"

Punto di Vista B: "${perspectiveB}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_PERSPECTIVE,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for Perspective Analysis:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
};


// === ISTRUZIONI PER IL RILEVATORE DI GENTILEZZA ===
const SYSTEM_INSTRUCTION_KINDNESS = `Sei un moderatore di contenuti e un insegnante. Il tuo compito è analizzare una frase scritta da uno studente di scuola media (11-13 anni) e determinare se è offensiva, irrispettosa o "harmful".
            
Rispondi *SEMPRE E SOLO* con un oggetto JSON. Non aggiungere MAI testo prima o dopo il JSON.
Il JSON deve avere questa struttura:
{
  "isHarmful": true o false,
  "reason": "Una spiegazione *molto breve e semplice* (massimo 15 parole) del perché la frase va bene o del perché è problematica. Usa un linguaggio adatto a un ragazzo di 12 anni.",
  "suggestion": "Se la frase è 'harmful', fornisci una breve alternativa rispettosa per esprimere lo stesso concetto. Se non è 'harmful', lascia questo campo come stringa vuota ''."
}

Esempi di risposta:
- Per "fai schifo": {"isHarmful": true, "reason": "Questa è un'offesa diretta che può ferire molto chi la legge.", "suggestion": "Non sono d'accordo con quello che hai fatto."}
- Per "sei un grande": {"isHarmful": false, "reason": "È un complimento! Fa sentire bene le persone.", "suggestion": ""}
- Per "sei gay": {"isHarmful": true, "reason": "Usare l'identità di qualcuno come un insulto non è mai rispettoso.", "suggestion": ""}`;

export interface KindnessResult {
    isHarmful: boolean;
    reason: string;
    suggestion: string;
}

export const analyzeKindness = async (text: string): Promise<KindnessResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: text,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_KINDNESS,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "isHarmful": { "type": Type.BOOLEAN },
                        "reason": { "type": Type.STRING },
                        "suggestion": { "type": Type.STRING }
                    },
                    required: ["isHarmful", "reason", "suggestion"]
                },
                temperature: 0.1,
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as KindnessResult;

    } catch (error) {
        console.error("Error calling Gemini API for Kindness Analysis:", error);
        throw new Error("Failed to get kindness analysis from Gemini API.");
    }
};

// === ISTRUZIONI PER L'ANALIZZATORE DI CONTENUTI SOCIAL ===
const SYSTEM_INSTRUCTION_SOCIAL = `Sei un analista di contenuti avanzato, basato sul modello di Perspective API. Il tuo compito è analizzare un testo e valutarlo secondo 6 categorie di tossicità.
Restituisci *SEMPRE E SOLO* un oggetto JSON. Non aggiungere MAI testo prima o dopo il JSON.
Il JSON deve avere questa struttura, con un valore numerico (float) compreso tra 0.00 e 1.00 per ogni categoria, che rappresenta la probabilità che il testo appartenga a quella categoria.

{
  "Tossicità": 0.0,
  "Tossicità Grave": 0.0,
  "Attacco all'Identità": 0.0,
  "Insulto": 0.0,
  "Volgarità": 0.0,
  "Minaccia": 0.0
}

Analizza il testo fornito e assegna un punteggio per ogni categoria. Sii il più accurato possibile.`;

export interface SocialAnalysisResult {
    "Tossicità": number;
    "Tossicità Grave": number;
    "Attacco all'Identità": number;
    "Insulto": number;
    "Volgarità": number;
    "Minaccia": number;
}

export const analyzeSocialContent = async (text: string): Promise<SocialAnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: text,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION_SOCIAL,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        "Tossicità": { "type": Type.NUMBER },
                        "Tossicità Grave": { "type": Type.NUMBER },
                        "Attacco all'Identità": { "type": Type.NUMBER },
                        "Insulto": { "type": Type.NUMBER },
                        "Volgarità": { "type": Type.NUMBER },
                        "Minaccia": { "type": Type.NUMBER }
                    },
                    required: ["Tossicità", "Tossicità Grave", "Attacco all'Identità", "Insulto", "Volgarità", "Minaccia"]
                },
                temperature: 0.1,
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as SocialAnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API for Social Content Analysis:", error);
        throw new Error("Failed to get social content analysis from Gemini API.");
    }
};
