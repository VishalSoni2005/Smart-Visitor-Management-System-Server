endpoints:
  POST - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/auth/login
  POST - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors
  GET - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors
  GET - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors/{id}
  PATCH - https://1dbpb43860.execute-api.ap-south-1.amazonaws.com/dev/visitors/{id}/checkout
functions:
  adminLogin: visitor-management-backend-dev-adminLogin (12 MB)
  createVisitor: visitor-management-backend-dev-createVisitor (12 MB)
  getVisitors: visitor-management-backend-dev-getVisitors (12 MB)
  getVisitorById: visitor-management-backend-dev-getVisitorById (12 MB)
  checkoutVisitor: visitor-management-backend-dev-checkoutVisitor (12 MB)