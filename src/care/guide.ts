import type { CareProfile } from "../types/analysis";
import type { RelevantSensoryCategory } from "../types/evidence";
import type { GuidePreference, GuideRequest, PreparationGuide } from "../types/guide";

const preferenceCategory: Partial<Record<GuidePreference, RelevantSensoryCategory>> = {
  quieter_surroundings: "noise",
  less_intense_lighting: "lighting",
  less_crowded_waiting: "crowding",
  seating_requirements: "seating",
};
const questions: Record<GuidePreference, string> = {
  quieter_surroundings: "Can you tell me about noise in the waiting area, and whether a quieter place to wait may be available?",
  less_intense_lighting: "What is the lighting like in the waiting area, and are there any options for less intense lighting?",
  less_crowded_waiting: "What should I expect in the waiting area, and are there options if it feels crowded?",
  seating_requirements: "What seating is available, and can you discuss seating that meets my needs?",
  clear_waiting_instructions: "How will I know when it is my turn, and what should I do while I wait?",
};
const actions: Record<GuidePreference, string> = {
  quieter_surroundings: "Consider bringing hearing protection if useful to you; ask staff about options before using it.",
  less_intense_lighting: "Consider bringing a hat or tinted glasses if useful to you; ask staff when they can be worn.",
  less_crowded_waiting: "Ask staff what waiting options are available before making plans.",
  seating_requirements: "Contact the facility in advance to discuss the seating you need.",
  clear_waiting_instructions: "Ask for the check-in and waiting steps in a format that works for you.",
};
const notes: Record<GuidePreference, string> = {
  quieter_surroundings: "a quieter place to wait",
  less_intense_lighting: "less intense lighting",
  less_crowded_waiting: "less crowded waiting options",
  seating_requirements: "seating that meets my needs",
  clear_waiting_instructions: "clear instructions about waiting and being called",
};

/** Uses only existing profile evidence; suggestions are questions, never facility claims. */
export function generatePreparationGuide(profile: CareProfile, request: GuideRequest): PreparationGuide {
  const { facility, analysis } = profile;
  const selected = new Set(request.preferences.map((preference) => preferenceCategory[preference]).filter(Boolean));
  const sensoryEvidence = analysis.factors.flatMap((factor) => factor.evidence.map((evidence) => ({ category: factor.category, evidence, relevantToPreferences: selected.has(factor.category) })));
  const prioritizedEvidence = sensoryEvidence.filter((item) => item.relevantToPreferences).concat(sensoryEvidence.filter((item) => !item.relevantToPreferences));
  const unknowns = analysis.factors.filter((factor) => !factor.evidence.length || factor.score === null).map((factor) => `There is insufficient directional evidence about ${factor.category}; ask the facility about current conditions.`);
  if (request.preferences.includes("clear_waiting_instructions")) unknowns.push("Waiting and check-in instructions are not available in the sensory profile; ask the facility for details.");
  if (!facility.address?.formatted) unknowns.push("A formatted address is not available; confirm the location with the facility.");
  if (!facility.phone && !facility.website) unknowns.push("Contact details are not available in this profile; find a verified contact method before calling.");
  const checklist = ["Confirm the appointment details and location with the facility.", ...request.preferences.map((preference) => actions[preference]), "Bring the questions you want to ask and allow time to check in."];
  const personalNote = request.includePersonalNote
    ? request.preferences.length
      ? `I would like to ask about ${request.preferences.map((preference) => notes[preference]).join(", ")}. Please let me know what options are available.`
      : "Please explain the check-in and waiting process and let me know what options are available."
    : null;
  return {
    facilityId: facility.id, facilityName: facility.name, dataMode: facility.dataMode,
    disclaimer: facility.dataMode === "demo" ? "Illustrative demo only: this facility and its evidence are fictional, not real-world observations." : "Evidence may be incomplete or outdated. Confirm arrangements with the facility; no sensory conditions or accommodations are guaranteed.",
    preferences: [...request.preferences],
    knownInformation: { ...(facility.address?.formatted ? { address: facility.address.formatted } : {}), ...(facility.phone ? { phone: facility.phone } : {}), ...(facility.website ? { website: facility.website } : {}), sensoryEvidence: prioritizedEvidence },
    unknowns,
    questions: request.preferences.length ? request.preferences.map((preference) => questions[preference]) : ["What should I expect when checking in and waiting for my appointment?", "Who can I contact to discuss any accessibility or sensory needs?"],
    checklist, personalNote,
  };
}
