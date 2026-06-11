import { NextRequest } from "next/server";
import { handler as getVisitorByIdHandler } from "@/backend/handlers/getVisitorById";
import { handleLambdaProxy } from "@/lib/lambdaProxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleLambdaProxy(getVisitorByIdHandler, req, resolvedParams);
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleLambdaProxy(getVisitorByIdHandler, req, resolvedParams);
}
