import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { scanVisitors } from "../lib/dynamo";
import { verifyToken } from "../lib/jwt";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "" };
  }

  try {
    // JWT Authentication check
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Unauthorized: Missing token",
        }),
      };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Unauthorized: Invalid or expired token",
        }),
      };
    }

    // Scan all visitors
    const visitors = await scanVisitors();

    // Sort by check-in time descending (newest first)
    visitors.sort(
      (a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        data: visitors,
      }),
    };
  } catch (error: any) {
    console.error("Get Visitors Error:", error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
    };
  }
};
