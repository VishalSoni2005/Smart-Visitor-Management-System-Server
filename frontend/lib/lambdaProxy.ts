import { NextRequest, NextResponse } from "next/server";
import { APIGatewayProxyResult } from "aws-lambda";

export async function handleLambdaProxy(
  handlerFn: (event: any) => Promise<APIGatewayProxyResult>,
  req: NextRequest,
  params?: Record<string, string>
) {
  let bodyText = "";
  let isBase64Encoded = false;
  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const buffer = await req.arrayBuffer();
        bodyText = Buffer.from(buffer).toString("base64");
        isBase64Encoded = true;
      } else {
        bodyText = await req.text();
      }
    } catch (e) {
      bodyText = "";
    }
  }

  // Extract headers
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Create mock API Gateway Proxy event
  const mockEvent = {
    body: bodyText,
    headers,
    httpMethod: req.method,
    pathParameters: params || null,
    queryStringParameters: req.nextUrl.searchParams.size > 0 
      ? Object.fromEntries(req.nextUrl.searchParams.entries()) 
      : null,
    requestContext: {} as any,
    resource: "",
    stageVariables: null,
    isBase64Encoded,
    path: req.nextUrl.pathname,
  };

  try {
    const result = await handlerFn(mockEvent);
    
    // Parse result body
    let parsedBody;
    try {
      parsedBody = JSON.parse(result.body);
    } catch {
      parsedBody = result.body;
    }

    // Forward API Gateway headers to Next.js response
    const responseHeaders = new Headers();
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, val]) => {
        responseHeaders.set(key, String(val));
      });
    }

    return NextResponse.json(parsedBody, {
      status: result.statusCode,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Lambda Proxy execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error during Lambda execution",
      },
      { status: 500 }
    );
  }
}
