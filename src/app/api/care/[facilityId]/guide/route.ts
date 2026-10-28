import { AppError, successResponse } from "../../../../../api/response";
import { generatePreparationGuide } from "../../../../../care/guide";
import { careError, careJson } from "../../../../../care/http";
import { getCareProfile } from "../../../../../care/profile";
import { validateGuideRequest } from "../../../../../validation/guide";

export const dynamic = "force-dynamic";
const MAX_BODY_BYTES = 4096;

export async function POST(request: Request, context: { params: Promise<{ facilityId: string }> }): Promise<Response> {
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new AppError("VALIDATION_ERROR", "Request body must be valid JSON.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new AppError("VALIDATION_ERROR", "Request body is too large.");
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let body: unknown;
    try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
    catch { throw new AppError("VALIDATION_ERROR", "Request body must be valid JSON."); }
    const input = validateGuideRequest(body);
    const profile = await getCareProfile((await context.params).facilityId);
    return careJson(successResponse(generatePreparationGuide(profile, input)));
  } catch (error) { return careError(error); }
}
