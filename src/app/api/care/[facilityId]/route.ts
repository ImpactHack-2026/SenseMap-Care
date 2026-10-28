import { AppError, successResponse } from "../../../../api/response";
import { DemoCareProvider } from "../../../../care/demo";
import { careError, careJson } from "../../../../care/http";
import { selectCareProvider } from "../../../../care/select-provider";
import { validateFacilityId } from "../../../../validation/input";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ facilityId: string }> }): Promise<Response> {
  try {
    const id = validateFacilityId((await context.params).facilityId);
    // Demo IDs remain resolvable after live mode is enabled and are always labeled demo.
    const provider = id.startsWith("demo-") ? new DemoCareProvider() : selectCareProvider();
    const facility = await provider.getFacility(id);
    if (!facility) throw new AppError("NOT_FOUND", "Facility not found.");
    return careJson(successResponse(facility));
  } catch (error) { return careError(error); }
}
