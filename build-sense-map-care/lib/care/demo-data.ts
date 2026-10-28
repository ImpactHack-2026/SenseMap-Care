import type { EvidenceItem, Facility, SensoryFactor } from './types'

/**
 * Fictional, illustrative facilities for demonstrating SenseMap Care UI states.
 * None of these facilities exist and none of the excerpts are real reviews.
 */

let evidenceCounter = 0
function illustrative(
  excerpt: string,
  relevance: string,
  options: { sourceType?: string; stance?: EvidenceItem['stance'] } = {},
): EvidenceItem {
  evidenceCounter += 1
  return {
    id: `demo-ev-${evidenceCounter}`,
    excerpt,
    isIllustrative: true,
    sourceType: options.sourceType ?? 'Illustrative visitor report',
    sourceLabel: 'Written for this demo · not a real source',
    relevance,
    stance: options.stance ?? 'supports',
  }
}

function limited(summary = 'Not enough relevant evidence has been found for this factor yet.'): SensoryFactor {
  return { score: null, confidence: 'limited', summary, evidence: [] }
}

export const DEMO_FACILITIES: Facility[] = [
  {
    id: 'willow-bend-family-clinic',
    name: 'Willow Bend Family Clinic',
    type: 'clinic',
    neighborhood: 'Mission San Jose area',
    city: 'Fremont, CA',
    description: 'A fictional primary care clinic used to illustrate a profile with strong evidence coverage.',
    keywords: ['primary care', 'family medicine', 'checkup', 'clinic'],
    dataMode: 'demo',
    profile: {
      overallExplanation:
        'Illustrative evidence consistently describes a quiet waiting room with indirect lighting and spaced seating. Smells could not be assessed, so they do not contribute.',
      lastReviewedLabel: 'Demo profile',
      arrivalProcess:
        'The demo profile describes a check-in kiosk near the entrance, followed by a short wait in the main seating area before a staff member calls your name.',
      hourly: {
        method: 'estimated',
        sourceLabel: 'Illustrative demo pattern · not measured data',
        summary:
          'In this illustrative pattern, the waiting area is busiest in the late morning and quietest in the early afternoon.',
        points: [
          { hour: 8, level: 30 },
          { hour: 9, level: 55 },
          { hour: 10, level: 72 },
          { hour: 11, level: 80 },
          { hour: 12, level: 48 },
          { hour: 13, level: 28 },
          { hour: 14, level: 35 },
          { hour: 15, level: 52 },
          { hour: 16, level: 60 },
          { hour: 17, level: 40 },
        ],
      },
      waitingOptions: [
        {
          id: 'quiet-room',
          label: 'Dedicated quiet room',
          status: 'documented',
          detail: 'A small side room is described in the demo profile as available on request.',
        },
        {
          id: 'wait-outside',
          label: 'Wait outside until called',
          status: 'documented',
          detail: 'The demo profile describes a text-message call-back option.',
        },
        { id: 'outdoor', label: 'Outdoor waiting option', status: 'unconfirmed' },
        {
          id: 'low-traffic-seating',
          label: 'Seating away from high-traffic areas',
          status: 'documented',
          detail: 'Seating along the far wall, away from the entrance.',
        },
      ],
      factors: {
        noise: {
          score: 90,
          confidence: 'high',
          summary: 'Consistently described as a quiet waiting area with no television or background music.',
          evidence: [
            illustrative(
              'The waiting room was really quiet — no TV, just a soft fountain sound near the front desk.',
              'Describes low background noise in the waiting area.',
            ),
            illustrative(
              'Staff spoke softly and called names in person rather than over a speaker.',
              'Indicates the absence of loudspeaker announcements.',
            ),
            illustrative(
              'Even at a busy time it felt calm and hushed.',
              'Suggests noise stays low during busier periods.',
            ),
          ],
        },
        lighting: {
          score: 82,
          confidence: 'medium',
          summary: 'Mostly indirect, warm lighting with natural light near the windows.',
          evidence: [
            illustrative(
              'Lights are warm and not too bright, with big windows on one side.',
              'Describes softer lighting and natural light.',
            ),
            illustrative(
              'Exam rooms use regular overhead lights, a bit brighter than the lobby.',
              'Notes brighter lighting in exam rooms.',
              { stance: 'contrasts' },
            ),
          ],
          disagreement:
            'One illustrative item notes brighter overhead lighting in exam rooms compared with the waiting area.',
        },
        crowding: {
          score: 75,
          confidence: 'medium',
          summary: 'Usually spacious, though it can fill up in the late morning.',
          evidence: [
            illustrative(
              'Plenty of room to spread out when I arrived at 1 pm.',
              'Describes low crowding in the early afternoon.',
            ),
            illustrative(
              'Around 11 it got fairly full and a few people were standing.',
              'Describes higher crowding in the late morning.',
              { stance: 'contrasts' },
            ),
          ],
        },
        seating: {
          score: 88,
          confidence: 'high',
          summary: 'Cushioned chairs with armrests, spaced apart, and a few seats along a quieter wall.',
          evidence: [
            illustrative(
              'Comfortable padded chairs, and they are not squeezed together.',
              'Describes comfortable, spaced seating.',
            ),
            illustrative(
              'There is a row of chairs along the back wall that feels tucked away.',
              'Describes seating away from the entrance.',
            ),
          ],
        },
        smells: limited(),
      },
    },
  },
  {
    id: 'alder-creek-community-hospital',
    name: 'Alder Creek Community Hospital',
    type: 'hospital',
    neighborhood: 'Centerville area',
    city: 'Fremont, CA',
    description: 'A fictional community hospital used to illustrate mixed evidence and disagreement between sources.',
    keywords: ['hospital', 'outpatient labs', 'imaging', 'specialists', 'emergency'],
    dataMode: 'demo',
    profile: {
      overallExplanation:
        'Illustrative evidence is mixed: the lobby is described as bright and comfortable, while the main reception can be loud and crowded at midday.',
      lastReviewedLabel: 'Demo profile',
      arrivalProcess:
        'The demo profile describes registration at a central front desk, followed by directions to a department-specific waiting area.',
      hourly: null,
      waitingOptions: [
        { id: 'quiet-room', label: 'Dedicated quiet room', status: 'unconfirmed' },
        {
          id: 'alt-waiting',
          label: 'Alternative waiting arrangements',
          status: 'documented',
          detail: 'The demo profile mentions smaller department waiting areas beyond the main lobby.',
        },
        { id: 'outdoor', label: 'Outdoor waiting option', status: 'unconfirmed' },
        { id: 'wait-outside', label: 'Wait outside until called', status: 'unconfirmed' },
      ],
      factors: {
        noise: {
          score: 60,
          confidence: 'medium',
          summary: 'Quieter in department waiting areas; the main reception can be loud at midday.',
          evidence: [
            illustrative(
              'The lab waiting area upstairs was calm and fairly quiet.',
              'Describes lower noise in a department waiting area.',
            ),
            illustrative(
              'Main lobby at lunchtime was loud — overhead pages and lots of conversations.',
              'Describes overhead announcements and conversation noise.',
              { stance: 'contrasts' },
            ),
          ],
          disagreement:
            'Illustrative items disagree: department areas are described as calm, while the main lobby is described as loud at midday.',
        },
        lighting: {
          score: 78,
          confidence: 'medium',
          summary: 'Bright but even lighting, with a daylight atrium in the lobby.',
          evidence: [
            illustrative(
              'Big skylight in the lobby, so it feels like daylight rather than harsh tubes.',
              'Describes natural lighting in the main lobby.',
            ),
          ],
        },
        crowding: {
          score: 55,
          confidence: 'medium',
          summary: 'Often busy around reception; department areas are smaller and calmer.',
          evidence: [
            illustrative(
              'The check-in line can get long and the lobby fills up quickly.',
              'Describes crowding at reception.',
            ),
            illustrative(
              'Once I was sent to radiology the waiting room only had a few people.',
              'Describes lower crowding in a department waiting area.',
              { stance: 'contrasts' },
            ),
          ],
        },
        seating: {
          score: 82,
          confidence: 'medium',
          summary: 'Plenty of seating, including some quieter benches in the atrium.',
          evidence: [
            illustrative(
              'Lots of seating options, including benches by the windows.',
              'Describes a range of seating choices.',
            ),
          ],
        },
        smells: {
          score: 70,
          confidence: 'low',
          summary: 'Occasional cleaning-product smell near entrances; otherwise rarely mentioned.',
          evidence: [
            illustrative(
              'A bit of a disinfectant smell right at the entrance, fine further in.',
              'Describes a cleaning-product smell near the entrance.',
            ),
          ],
        },
      },
    },
  },
  {
    id: 'juniper-lane-outpatient-center',
    name: 'Juniper Lane Outpatient Center',
    type: 'outpatient',
    neighborhood: 'Irvington area',
    city: 'Fremont, CA',
    description:
      'A fictional outpatient center used to illustrate a partial profile without enough evidence for an overall score.',
    keywords: ['outpatient', 'therapy', 'physical therapy', 'specialists', 'pediatrics'],
    dataMode: 'demo',
    profile: {
      overallExplanation:
        'Only two factors have enough illustrative evidence, so an overall score is not shown. Lighting, crowding, and smells remain unknown.',
      lastReviewedLabel: 'Demo profile',
      arrivalProcess: null,
      hourly: null,
      waitingOptions: [
        { id: 'quiet-room', label: 'Dedicated quiet room', status: 'unconfirmed' },
        { id: 'wait-outside', label: 'Wait outside until called', status: 'unconfirmed' },
        { id: 'low-traffic-seating', label: 'Seating away from high-traffic areas', status: 'unconfirmed' },
      ],
      factors: {
        noise: {
          score: 74,
          confidence: 'low',
          summary: 'A small number of items describe a fairly quiet waiting room.',
          evidence: [
            illustrative(
              'Quiet enough that I could read while I waited.',
              'Describes a reasonably quiet waiting environment.',
            ),
          ],
        },
        lighting: limited(),
        crowding: limited(),
        seating: {
          score: 68,
          confidence: 'low',
          summary: 'Standard chairs; one item mentions limited seating during busy times.',
          evidence: [
            illustrative(
              'Chairs were okay, but there were not many of them.',
              'Describes a limited number of standard chairs.',
            ),
          ],
        },
        smells: limited(),
      },
    },
  },
  {
    id: 'northgate-urgent-care',
    name: 'Northgate Urgent Care',
    type: 'urgent-care',
    neighborhood: 'Warm Springs area',
    city: 'Fremont, CA',
    description: 'A fictional walk-in urgent care used to illustrate a less favorable sensory profile.',
    keywords: ['urgent care', 'walk-in', 'same day', 'minor injuries'],
    dataMode: 'demo',
    profile: {
      overallExplanation:
        'Illustrative evidence describes a compact, busy waiting room with a television and bright overhead lighting. Smells could not be assessed.',
      lastReviewedLabel: 'Demo profile',
      arrivalProcess:
        'The demo profile describes walk-in registration at a front window. Wait times are not shown in this demo.',
      hourly: null,
      waitingOptions: [
        { id: 'quiet-room', label: 'Dedicated quiet room', status: 'unconfirmed' },
        {
          id: 'wait-outside',
          label: 'Wait outside until called',
          status: 'documented',
          detail: 'The demo profile mentions a phone call when an exam room is ready.',
        },
        { id: 'outdoor', label: 'Outdoor waiting option', status: 'unconfirmed' },
      ],
      factors: {
        noise: {
          score: 38,
          confidence: 'medium',
          summary: 'A television and front-desk phone are frequently mentioned; some find it manageable.',
          evidence: [
            illustrative(
              'TV was on pretty loud and the phone kept ringing at the desk.',
              'Describes television and phone noise.',
            ),
            illustrative(
              'Late evening it was much quieter than I expected.',
              'Describes quieter conditions late in the day.',
              { stance: 'contrasts' },
            ),
          ],
          disagreement:
            'Most illustrative items describe a noisy waiting room, but one describes quieter conditions in the late evening.',
        },
        lighting: {
          score: 45,
          confidence: 'low',
          summary: 'Bright overhead fluorescent lighting is mentioned; no daylight described.',
          evidence: [
            illustrative(
              'Very bright white ceiling lights, no windows in the waiting area.',
              'Describes intense overhead lighting.',
            ),
          ],
        },
        crowding: {
          score: 32,
          confidence: 'medium',
          summary: 'Small waiting room that is often full, especially on weekends.',
          evidence: [
            illustrative(
              'Every chair was taken on Saturday and people waited by the door.',
              'Describes crowding on a weekend.',
            ),
            illustrative(
              'Small room, you end up sitting close to other people.',
              'Describes limited personal space.',
            ),
          ],
        },
        seating: {
          score: 58,
          confidence: 'low',
          summary: 'Hard plastic chairs placed close together.',
          evidence: [
            illustrative(
              'Plastic chairs in rows, nothing padded.',
              'Describes basic, closely spaced seating.',
            ),
          ],
        },
        smells: limited(),
      },
    },
  },
  {
    id: 'lakeview-rehabilitation-studio',
    name: 'Lakeview Rehabilitation Studio',
    type: 'other',
    neighborhood: 'Niles area',
    city: 'Fremont, CA',
    description:
      'A fictional rehabilitation studio used to illustrate a facility that can be found but has no sensory evidence yet.',
    keywords: ['rehabilitation', 'physical therapy', 'occupational therapy'],
    dataMode: 'demo',
    profile: null,
  },
]
