import axios from "axios";
import type { ProductService } from "../../../interface";

export class ProductRPCRepository implements ProductService {
    async exists(productId: string): Promise<boolean> {
        try {
            const { data } = await axios.get(
                `http://localhost:3000/v1/products/${productId}`,
            );

            return data.data !== null && data.data !== undefined;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return false;
            }

            // Lỗi kết nối hoặc lỗi server không đồng nghĩa với sản phẩm không tồn tại.
            throw error;
        }
    }
}