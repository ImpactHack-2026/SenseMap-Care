import 'server-only'
import { headers } from 'next/headers'
import type { CareFacility as BackendFacility } from '../../../src/types/healthcare'
import type { CareProfile as BackendProfile } from '../../../src/types/analysis'
import type { DataMode, Facility, FacilityType, FactorKey, SensoryFactor } from './types'

type Envelope<T> = { success: true; data: T } | { success: false; error: { message: string } }

async function api<T>(path: string): Promise<T | null> {
  await headers()
  // The same Next.js process hosts the backend routes. Avoid forwarding user-provided host headers.
  const port = process.env.PORT || '3000'
  if (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error('Invalid server port')
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(20000) })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Facility data is temporarily unavailable. Please try again.')
  const body = await response.json() as Envelope<T>
  if (!body.success) throw new Error('Facility data is temporarily unavailable. Please try again.')
  return body.data
}

function mapFacility(facility: BackendFacility, profile?: BackendProfile['analysis']): Facility {
  const types: Record<BackendFacility['type'], FacilityType> = { clinic: 'clinic', hospital: 'hospital', urgent_care: 'urgent-care', primary_care: 'outpatient', specialist: 'outpatient' }
  const factors = profile && Object.fromEntries(profile.factors.map((factor) => [factor.category, {
    score: factor.score,
    confidence: factor.confidence,
    summary: factor.explanation,
    evidence: factor.evidence.map((item, index) => ({
      id: `${factor.category}-${index}`, excerpt: item.excerpt, isIllustrative: item.sourceType === 'illustrative_demo',
      sourceUrl: item.sourceUrl || undefined, sourceType: item.sourceType, sourceLabel: item.provenance.sourceName,
      publishedAt: item.provenance.publishedAt, relevance: `Mentions ${factor.category}.`, stance: 'unknown' as const,
    })),
  }])) as Record<FactorKey, SensoryFactor> | undefined
  const address = facility.address?.formatted || ''
  const website = facility.website && /^https?:\/\//i.test(facility.website) ? facility.website : undefined
  return {
    id: facility.id, name: facility.name, type: types[facility.type] || 'other',
    neighborhood: address || 'Address unavailable', city: facility.address?.city || '',
    description: facility.dataMode === 'demo' ? 'Fictional facility for demonstration only.' : 'Facility information provided by search results; confirm details before visiting.',
    keywords: facility.specialties || [], dataMode: facility.dataMode, phone: facility.phone, website,
    profile: profile && factors ? { factors, overallExplanation: profile.disclaimer, hourly: null, waitingOptions: [], arrivalProcess: null } : null,
  }
}

export async function listFacilities(query = ''): Promise<{ facilities: Facility[]; mode: DataMode; hasMore: boolean }> {
  const search = new URLSearchParams({ query: query.trim() || 'healthcare', pageSize: '20' })
  const data = await api<{ items: BackendFacility[]; dataMode: DataMode; hasMore: boolean }>(`/api/care/search?${search}`)
  if (!data) throw new Error('Facility search is unavailable.')
  return { facilities: data.items.map((item) => mapFacility(item)), mode: data.dataMode, hasMore: data.hasMore }
}

export async function getFacility(id: string): Promise<Facility | null> {
  const result = await api<BackendProfile>(`/api/care/${encodeURIComponent(id)}/profile`)
  return result ? mapFacility(result.facility, result.analysis) : null
}
