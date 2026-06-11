import { NextRequest } from "next/server";
import { handler as adminLoginHandler } from "@/backend/handlers/adminLogin";
import { handleLambdaProxy } from "@/lib/lambdaProxy";

export async function POST(req: NextRequest) {
  return handleLambdaProxy(adminLoginHandler, req);
}

export async function OPTIONS(req: NextRequest) {
  return handleLambdaProxy(adminLoginHandler, req);
}
