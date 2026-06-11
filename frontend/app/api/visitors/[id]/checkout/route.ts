import { NextRequest } from "next/server";
import { handler as checkoutVisitorHandler } from "@/backend/handlers/checkoutVisitor";
import { handleLambdaProxy } from "@/lib/lambdaProxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleLambdaProxy(checkoutVisitorHandler, req, resolvedParams);
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return handleLambdaProxy(checkoutVisitorHandler, req, resolvedParams);
}
