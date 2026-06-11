import { NextRequest } from "next/server";
import { handler as createVisitorHandler } from "@/backend/handlers/createVisitor";
import { handler as getVisitorsHandler } from "@/backend/handlers/getVisitors";
import { handleLambdaProxy } from "@/lib/lambdaProxy";

export async function POST(req: NextRequest) {
  return handleLambdaProxy(createVisitorHandler, req);
}

export async function GET(req: NextRequest) {
  return handleLambdaProxy(getVisitorsHandler, req);
}

export async function OPTIONS(req: NextRequest) {
  // Can use either handler to return OPTIONS CORS response
  return handleLambdaProxy(createVisitorHandler, req);
}
