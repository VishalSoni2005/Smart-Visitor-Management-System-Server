import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Visitor, Admin } from "../../shared/types";

const REGION = process.env.DYNAMODB_REGION || "ap-south-1";
const VISITORS_TABLE = process.env.VISITORS_TABLE || "visitors";
const ADMINS_TABLE = process.env.ADMINS_TABLE || "admins";

// DynamoDB client (lazy loaded)
let docClient: DynamoDBDocumentClient | null = null;
function getDocClient() {
  if (!docClient) {
    const client = new DynamoDBClient({ region: REGION });
    docClient = DynamoDBDocumentClient.from(client);
  }
  return docClient;
}

export async function getVisitorById(visitorId: string): Promise<Visitor | null> {
  try {
    const command = new GetCommand({
      TableName: VISITORS_TABLE,
      Key: { visitorId },
    });
    const response = await getDocClient().send(command);
    return (response.Item as Visitor) || null;
  } catch (error) {
    console.error("DynamoDB getVisitorById error:", error);
    throw error;
  }
}

export async function getVisitorByToken(visitorToken: string): Promise<Visitor | null> {
  try {
    const command = new ScanCommand({
      TableName: VISITORS_TABLE,
      FilterExpression: "visitorToken = :token",
      ExpressionAttributeValues: {
        ":token": visitorToken,
      },
    });
    const response = await getDocClient().send(command);
    if (response.Items && response.Items.length > 0) {
      return response.Items[0] as Visitor;
    }
    return null;
  } catch (error) {
    console.error("DynamoDB getVisitorByToken error:", error);
    throw error;
  }
}

export async function saveVisitor(visitor: Visitor): Promise<void> {
  try {
    const command = new PutCommand({
      TableName: VISITORS_TABLE,
      Item: visitor,
    });
    await getDocClient().send(command);
  } catch (error) {
    console.error("DynamoDB saveVisitor error:", error);
    throw error;
  }
}

export async function scanVisitors(): Promise<Visitor[]> {
  try {
    const command = new ScanCommand({
      TableName: VISITORS_TABLE,
    });
    const response = await getDocClient().send(command);
    return (response.Items as Visitor[]) || [];
  } catch (error) {
    console.error("DynamoDB scanVisitors error:", error);
    throw error;
  }
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const command = new GetCommand({
      TableName: ADMINS_TABLE,
      Key: { email },
    });
    const response = await getDocClient().send(command);
    return (response.Item as Admin) || null;
  } catch (error) {
    console.error("DynamoDB getAdminByEmail error:", error);
    throw error;
  }
}

export async function saveAdmin(admin: Admin): Promise<void> {
  try {
    const command = new PutCommand({
      TableName: ADMINS_TABLE,
      Item: admin,
    });
    await getDocClient().send(command);
  } catch (error) {
    console.error("DynamoDB saveAdmin error:", error);
    throw error;
  }
}
