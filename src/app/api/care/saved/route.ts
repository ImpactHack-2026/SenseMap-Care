import { successResponse } from "../../../../api/response";
import { careError, careJson } from "../../../../care/http";
import { savedFacilities } from "../../../../care/saved";

export const dynamic = "force-dynamic";
export async function GET(request: Request): Promise<Response> {
  try { return careJson(successResponse({ items: await savedFacilities(request, "list") })); }
  catch (error) { return careError(error); }
}
