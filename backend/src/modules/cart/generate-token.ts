import jwt from "jsonwebtoken";
import { config } from "dotenv";

config(); // Load biến môi trường từ .env

// Đảm bảo khớp với biến môi trường JWT_SECRET trong file .env
const jwtSecret = process.env.JWT_SECRET || "just_jwt_secret_key";

const mockToken = jwt.sign(
    {
        id: "user-uuid-b865-4f3b-9c21-123456789abc",       // Thêm id
        userId: "user-uuid-b865-4f3b-9c21-123456789abc",   // Thêm userId
        sub: "user-uuid-b865-4f3b-9c21-123456789abc",     // ID giả lập của user
        role: "customer",
    },
    jwtSecret,
    { expiresIn: "1h" }
);

console.log("==========================================");
console.log("YOUR MOCK JWT TOKEN:");
console.log(mockToken);
console.log("==========================================");