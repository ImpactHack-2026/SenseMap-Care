import { successResponse } from "../../../../../api/response";
import { careError, careJson } from "../../../../../care/http";
import { selectEvidenceProvider } from "../../../../../evidence/select-provider";
import { validateFacilityId } from "../../../../../validation/input";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ facilityId: string }> }): Promise<Response> {
  try {
    const id = validateFacilityId((await context.params).facilityId);
    const result = await selectEvidenceProvider(id).collect(id);
    return careJson(successResponse(result));
  } catch (error) { return careError(error); }
}
