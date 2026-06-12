 ~/De/Smart-Visitor-Management-System-Server/backend  on dev !7108  serverless deploy                       1 ✘  took 2m 11s  at 13:29:06 

Deploying "visitor-management-backend" to stage "dev" (ap-south-1)

✔ Service deployed to stack visitor-management-backend-dev (26s)

endpoints:
  POST - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/auth/login
  POST - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors
  GET - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors
  GET - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors/{id}
  PATCH - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors/{id}/checkout
functions:
  adminLogin: visitor-management-backend-dev-adminLogin (26 kB)
  createVisitor: visitor-management-backend-dev-createVisitor (26 kB)
  getVisitors: visitor-management-backend-dev-getVisitors (26 kB)
  getVisitorById: visitor-management-backend-dev-getVisitorById (26 kB)
  checkoutVisitor: visitor-management-backend-dev-checkoutVisitor (26 kB)

 ~/De/Smart-Visitor-Management-System-Server/backend  on dev !7108         