import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getVisitorById } from "../lib/dynamo";

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
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Visitor ID is required",
        }),
      };
    }

    const visitor = await getVisitorById(id);

    if (!visitor) {
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({
          success: false,
          error: "Visitor not found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        success: true,
        data: visitor,
      }),
    };
  } catch (error: any) {
    console.error("Get Visitor By ID Error:", error);
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
