import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getVisitorById, getVisitorByToken, saveVisitor } from "../lib/dynamo";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
};

// Helper to format duration in hours and minutes
function formatDuration(checkIn: string, checkOut: string): string {
  const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? "" : "s"}`;
  }
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (mins === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  
  return `${hours} hour${hours === 1 ? "" : "s"} ${mins} minute${mins === 1 ? "" : "s"}`;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: HEADERS, body: "" };
  }

  try {
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Visitor ID or Token is required",
        }),
      };
    }

    // Try finding by UUID (visitorId) first, then by visitorToken
    let visitor = await getVisitorById(id);
    if (!visitor) {
      visitor = await getVisitorByToken(id.toUpperCase());
    }

    if (!visitor) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Visitor not found. Please verify the token.",
        }),
      };
    }

    const now = new Date().toISOString();

    // Update if not already checked out
    if (visitor.status !== "checked-out") {
      visitor.status = "checked-out";
      visitor.checkOutTime = now;
      await saveVisitor(visitor);
    }

    const durationText = formatDuration(visitor.checkInTime, visitor.checkOutTime || now);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        data: {
          visitor,
          durationText,
        },
      }),
    };
  } catch (error: any) {
    console.error("Checkout Visitor Error:", error);
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
