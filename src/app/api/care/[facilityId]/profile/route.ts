import { successResponse } from "../../../../../api/response";
import { careError, careJson } from "../../../../../care/http";
import { getCareProfile } from "../../../../../care/profile";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ facilityId: string }> }): Promise<Response> {
  try {
    return careJson(successResponse(await getCareProfile((await context.params).facilityId)));
  } catch (error) { return careError(error); }
}
