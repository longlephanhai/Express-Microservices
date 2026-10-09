import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Express Microservices API",
    version: "1.0.0",
    description: "API Documentation for Express Microservices (Category, Brand, Product, User Identity)",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "Categories",
      description: "Category management APIs",
    },
    {
      name: "Brands",
      description: "Brand management APIs",
    },
    {
      name: "Products",
      description: "Product management APIs",
    },
    {
      name: "User Identities",
      description: "User sign-in identity management APIs",
    },
  ],
  paths: {
    "/v1/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get list of categories",
        description: "Retrieve a paginated list of categories with filtering options",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20, minimum: 1, maximum: 100 },
            description: "Number of items per page",
          },
          {
            name: "name",
            in: "query",
            schema: { type: "string" },
            description: "Filter categories by name",
          },
          {
            name: "parentId",
            in: "query",
            schema: { type: "string", format: "uuid" },
            description: "Filter categories by parent ID",
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["active", "inactive", "deleted"] },
            description: "Filter categories by status",
          },
        ],
        responses: {
          200: {
            description: "List of categories retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                      },
                    },
                  },
                },
              },
            },
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Category" },
                  },
                  paging: { $ref: "#/components/schemas/Paging" },
                  filter: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Categories"],
      summary: "Create a new category",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryCreateRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Category created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string", description: "Created category ID" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or invalid input data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/v1/categories/{id}": {
    get: {
      tags: ["Categories"],
      summary: "Get category details",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Category ID",
        },
      ],
      responses: {
        200: {
          description: "Category details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/Category" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid category ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "Category not found",
        },
      },
    },
    patch: {
      tags: ["Categories"],
      summary: "Update category",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Category ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryUpdateRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Category updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or invalid input data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Categories"],
      summary: "Delete category",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Category ID",
        },
      ],
      responses: {
        200: {
          description: "Category deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid category ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/v1/brands": {
    get: {
      tags: ["Brands"],
      summary: "Get list of brands",
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1, minimum: 1 },
          description: "Page number",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
          description: "Number of items per page",
        },
      ],
      responses: {
        200: {
          description: "List of brands retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Brand" },
                  },
                  paging: { $ref: "#/components/schemas/Paging" },
                  filter: { type: "object" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid paging query",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["Brands"],
      summary: "Create a new brand",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BrandCreateRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Brand created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "string", description: "Created brand ID" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or invalid input data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  "/v1/brands/{id}": {
    get: {
      tags: ["Brands"],
      summary: "Get brand details",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Brand ID",
        },
      ],
      responses: {
        200: {
          description: "Brand details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { $ref: "#/components/schemas/Brand" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid brand ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    patch: {
      tags: ["Brands"],
      summary: "Update brand",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Brand ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/BrandUpdateRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Brand updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "Validation error or invalid input data",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Brands"],
      summary: "Delete brand",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Brand ID",
        },
      ],
      responses: {
        200: {
          description: "Brand deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "boolean" },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid brand ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/v1/user-identities": {
    get: {
      tags: ["User Identities"],
      summary: "List identities for a user",
      parameters: [
        { name: "userId", in: "query", required: true, schema: { type: "string", format: "uuid" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1, minimum: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10, minimum: 1, maximum: 100 } },
        { name: "identifier", in: "query", schema: { type: "string", maxLength: 150 } },
        { name: "type", in: "query", schema: { type: "string", enum: ["email_password", "facebook", "google"] } },
        { name: "status", in: "query", schema: { type: "string", enum: ["active", "pending", "inactive", "banned", "deleted"] } },
      ],
      responses: {
        200: {
          description: "User identities retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/UserIdentity" } },
                  paging: { $ref: "#/components/schemas/Paging" },
                  filter: { type: "object" },
                },
              },
            },
          },
        },
        400: { description: "Invalid query parameters", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    post: {
      tags: ["User Identities"],
      summary: "Create a user identity",
      description: "Email/password identities require an email identifier and password. OAuth identities must omit password.",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/UserIdentityCreateRequest" } } },
      },
      responses: {
        201: {
          description: "User identity created successfully",
          content: {
            "application/json": { schema: { type: "object", properties: { data: { type: "object", properties: { id: { type: "string", format: "uuid" } } } } } },
          },
          400: { description: "Invalid identity data", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/user-identities/{id}": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      get: {
        tags: ["User Identities"],
        summary: "Get a user identity",
        responses: {
          200: { description: "User identity retrieved successfully", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/UserIdentity" } } } } } },
          404: { description: "User identity not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      patch: {
        tags: ["User Identities"],
        summary: "Update a user identity",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserIdentityUpdateRequest" } } },
        },
        responses: {
          200: { description: "User identity updated successfully", content: { "application/json": { schema: { type: "object", properties: { data: { type: "boolean" } } } } } },
          400: { description: "Invalid update data", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          404: { description: "User identity not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["User Identities"],
        summary: "Soft-delete a user identity",
        responses: {
          200: { description: "User identity deleted successfully", content: { "application/json": { schema: { type: "object", properties: { data: { type: "boolean" } } } } } },
          404: { description: "User identity not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/v1/products": {
      get: {
        tags: ["Products"],
        summary: "Get list of products",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
            description: "Number of items per page",
          },
          {
            name: "fromPrice",
            in: "query",
            schema: { type: "number", minimum: 0 },
            description: "Filter products from minimum price",
          },
          {
            name: "toPrice",
            in: "query",
            schema: { type: "number", minimum: 0 },
            description: "Filter products up to maximum price",
          },
          {
            name: "brandId",
            in: "query",
            schema: { type: "string", format: "uuid" },
            description: "Filter products by brand ID",
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "string", format: "uuid" },
            description: "Filter products by category ID",
          },
        ],
        responses: {
          200: {
            description: "List of products retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                    paging: { $ref: "#/components/schemas/Paging" },
                    filter: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a new product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductCreateRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "string", description: "Created product ID" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or invalid input data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product details",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Product ID",
          },
        ],
        responses: {
          200: {
            description: "Product details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid product ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Products"],
        summary: "Update product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Product ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductUpdateRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "boolean" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or invalid input data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Product ID",
          },
        ],
        responses: {
          200: {
            description: "Product deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "boolean" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid product ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Paging: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 100 },
        },
      },
      UserIdentity: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          identifier: { type: "string", maxLength: 150 },
          type: { type: "string", enum: ["email_password", "facebook", "google"] },
          status: { type: "string", enum: ["active", "pending", "inactive", "banned", "deleted"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserIdentityCreateRequest: {
        type: "object",
        required: ["userId", "identifier", "type"],
        properties: {
          userId: { type: "string", format: "uuid" },
          identifier: { type: "string", maxLength: 150, example: "user@example.com" },
          password: { type: "string", minLength: 8, maxLength: 100, writeOnly: true },
          type: { type: "string", enum: ["email_password", "facebook", "google"] },
        },
      },
      UserIdentityUpdateRequest: {
        type: "object",
        minProperties: 1,
        properties: {
          identifier: { type: "string", maxLength: 150 },
          password: { type: "string", minLength: 8, maxLength: 100, writeOnly: true },
          status: { type: "string", enum: ["active", "pending", "inactive", "banned", "deleted"] },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Invalid input" },
          message: { type: "string", example: "Error message" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Electronics" },
          image: { type: "string", nullable: true, example: "https://example.com/category.png" },
          description: { type: "string", nullable: true, example: "Electronic devices and gadgets" },
          position: { type: "integer", example: 0 },
          parentId: { type: "string", format: "uuid", nullable: true },
          status: { type: "string", enum: ["active", "inactive", "deleted"], example: "active" },
          children: {
            type: "array",
            items: { $ref: "#/components/schemas/Category" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryCreateRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 3, example: "Laptops" },
          image: { type: "string", nullable: true, example: "https://example.com/laptop.png" },
          description: { type: "string", nullable: true, example: "Gaming and work laptops" },
          position: { type: "integer", minimum: 0, default: 0, example: 1 },
          parentId: { type: "string", format: "uuid", nullable: true },
        },
      },
      CategoryUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, example: "Gaming Laptops" },
          image: { type: "string", nullable: true, example: "https://example.com/laptop2.png" },
          description: { type: "string", maxLength: 255, nullable: true, example: "Updated description" },
          position: { type: "integer", minimum: 0, example: 2 },
          parentId: { type: "string", format: "uuid", nullable: true },
          status: { type: "string", enum: ["active", "inactive", "deleted"], example: "active" },
        },
      },
      Brand: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Apple" },
          image: { type: "string", example: "https://example.com/apple.png" },
          description: { type: "string", example: "Consumer electronics and software" },
          tagLine: { type: "string", example: "Think different" },
          status: { type: "string", enum: ["active", "inactive", "deleted"], example: "active" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      BrandCreateRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 2, example: "Sony" },
          image: { type: "string", example: "https://example.com/sony.png" },
          description: { type: "string", example: "Consumer electronics" },
          tagLine: { type: "string", example: "Be Moved" },
        },
      },
      BrandUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, example: "Sony Global" },
          image: { type: "string", example: "https://example.com/sony-updated.png" },
          description: { type: "string", example: "Electronics & Entertainment" },
          tagLine: { type: "string", example: "Make.Believe" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "MacBook Pro 16" },
          gender: { type: "string", enum: ["male", "female", "unisex"], example: "unisex" },
          price: { type: "number", example: 2499.99 },
          salePrice: { type: "number", example: 2299.99 },
          colors: { type: "string", example: "Space Gray, Silver" },
          quantity: { type: "integer", example: 50 },
          brandId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          content: { type: "string", example: "High performance laptop with M-series chip" },
          description: { type: "string", example: "Detailed product description" },
          rating: { type: "number", minimum: 0, maximum: 5, example: 4.8 },
          saleCount: { type: "integer", example: 120 },
          status: { type: "string", enum: ["active", "inactive", "deleted"], example: "active" },
          category: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string", example: "Laptops" },
            },
          },
          brand: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string", example: "Apple" },
            },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductCreateRequest: {
        type: "object",
        required: ["name", "gender", "price", "salePrice", "quantity"],
        properties: {
          name: { type: "string", minLength: 2, example: "MacBook Pro 16" },
          gender: { type: "string", enum: ["male", "female", "unisex"], example: "unisex" },
          price: { type: "number", minimum: 0.01, example: 2499.99 },
          salePrice: { type: "number", minimum: 0, example: 2299.99 },
          colors: { type: "string", example: "Space Gray, Silver" },
          quantity: { type: "integer", minimum: 0, example: 50 },
          brandId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          content: { type: "string", example: "High performance laptop" },
          description: { type: "string", example: "Apple MacBook Pro" },
        },
      },
      ProductUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, example: "MacBook Pro 16 M3" },
          price: { type: "number", minimum: 0.01, example: 2599.99 },
          salePrice: { type: "number", minimum: 0, example: 2399.99 },
          quantity: { type: "integer", minimum: 0, example: 45 },
          brandId: { type: "string", format: "uuid" },
          categoryId: { type: "string", format: "uuid" },
          content: { type: "string", example: "Updated product details" },
          description: { type: "string", example: "Updated description" },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  // Serve Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Serve OpenAPI specification in JSON format
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });
};

