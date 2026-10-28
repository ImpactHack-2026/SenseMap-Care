import { successResponse } from "../../../../api/response";
import { careError, careJson } from "../../../../care/http";
import { selectCareProvider } from "../../../../care/select-provider";
import { validateFacilitySearch } from "../../../../validation/input";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams;
    const input = validateFacilitySearch({
      query: params.get("query") ?? undefined,
      facilityType: params.get("facilityType") ?? undefined,
      page: params.get("page") ?? undefined,
      pageSize: params.get("pageSize") ?? undefined,
    });
    return careJson(successResponse(await selectCareProvider().search(input)));
  } catch (error) { return careError(error); }
}
