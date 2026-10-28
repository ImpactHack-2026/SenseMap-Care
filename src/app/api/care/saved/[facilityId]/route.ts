import { successResponse } from "../../../../../api/response";
import { careError, careJson } from "../../../../../care/http";
import { savedFacilities } from "../../../../../care/saved";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ facilityId: string }> };
async function change(request: Request, context: Context, operation: "save" | "remove"): Promise<Response> {
  try {
    await savedFacilities(request, operation, (await context.params).facilityId);
    return careJson(successResponse({ saved: operation === "save" }));
  } catch (error) { return careError(error); }
}
export async function PUT(request: Request, context: Context): Promise<Response> { return change(request, context, "save"); }
export async function DELETE(request: Request, context: Context): Promise<Response> { return change(request, context, "remove"); }
