import { Request, Response } from "express";
import { CartCondDTO, CartCondDTOSchema, CartCreateDTO, CartCreateSchema, CartUpdateDTO, CartUpdateSchema } from "../../model/dto";
import { ICartUseCase } from "../../interface";
import { PagingDTO, PagingDTOSchema } from "../../../../share/model/paging";

export class CartHttpServiceAPI {
    constructor(private readonly useCase: ICartUseCase) { }

    // async createCartItemAPI(req: Request, res: Response) {
    //     const userId = req.userId || req.body?.userId;
    //     const bodyWithUser = {
    //         ...req.body,
    //         userId,
    //     };
    //     const { success, data, error } = CartCreateSchema.safeParse(bodyWithUser);

    //     if (!success) {
    //         return res.status(400).json({
    //             error: error.message
    //         });
    //     }
    //     try {
    //         const result = await this.useCase.createCartItem(data);
    //         res.status(201).json({
    //             data: result
    //         });
    //     } catch (err) {
    //         res.status(400).json({
    //             error: (err as Error).message
    //         });
    //     }
    // }
async createCartItemAPI(req: Request, res: Response): Promise<void> {
        try {
            // Lấy userId trực tiếp từ token đã được giải mã qua authMiddleware
            const userId = req.requester?.sub;
            if (!userId) {
                res.status(401).json({ message: "Unauthorized: Missing user identity" });
                return;
            }

            const data: CartCreateDTO = {
                userId,
                productId: req.body.productId,
                attribute: req.body.attribute,
                quantity: req.body.quantity || 1,
            };

            const newId = await this.useCase.createCartItem(data);
            res.status(201).json({ data: newId });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
    
    // async getCartItemAPI(req: Request, res: Response) {
    //     const { id } = req.params;

    //     if (typeof id !== "string") {
    //         return res.status(400).json({
    //             error: "Invalid cart item id"
    //         });
    //     }

    //     try {
    //         const result = await this.useCase.getCartItem(id);
    //         res.status(200).json({
    //             data: result
    //         });
    //     } catch (err) {
    //         res.status(404).json({
    //             error: (err as Error).message
    //         });
    //     }
    // }
    async getCartItemAPI(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (typeof id !== "string") {
                res.status(400).json({ message: "Invalid ID format" });
                return;
            }
            const item = await this.useCase.getCartItem(id);
            res.status(200).json({ data: item });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
    // async updateCartItemAPI(req: Request, res: Response) {
    //     const { id } = req.params;
    //     const { success, data, error } = CartUpdateSchema.safeParse(req.body);

    //     if (typeof id !== "string") {
    //         return res.status(400).json({
    //             error: "Invalid cart item id"
    //         });
    //     }

    //     if (!success) {
    //         return res.status(400).json({
    //             error: error.message
    //         });
    //     }

    //     try {
    //         const result = await this.useCase.updateCartItem(id, data);
    //         res.status(200).json({
    //             data: result
    //         });
    //     } catch (err) {
    //         res.status(400).json({
    //             error: (err as Error).message
    //         });
    //     }
    // }
    async updateCartItemAPI(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (typeof id !== "string") {
                res.status(400).json({ message: "Invalid ID format" });
                return;
            }
            const data: CartUpdateDTO = req.body;
            const success = await this.useCase.updateCartItem(id, data);
            res.status(200).json({ data: success });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // async deleteCartItemAPI(req: Request, res: Response) {
    //     const { id } = req.params;

    //     if (typeof id !== "string") {
    //         return res.status(400).json({
    //             error: "Invalid cart item id"
    //         });
    //     }

    //     try {
    //         const result = await this.useCase.deleteCartItem(id);
    //         res.status(200).json({
    //             data: result
    //         });
    //     } catch (err) {
    //         res.status(400).json({
    //             error: (err as Error).message
    //         });
    //     }
    // }

    async deleteCartItemAPI(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            if (typeof id !== "string") {
                res.status(400).json({ message: "Invalid ID format" });
                return;
            }
            const success = await this.useCase.deleteCartItem(id);
            res.status(200).json({ data: success });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    // async listCartItemsAPI(req: Request, res: Response) {
    //     const pagingResult = PagingDTOSchema.safeParse(req.query);

    //     if (!pagingResult.success) {
    //         return res.status(400).json({
    //             error: pagingResult.error.message
    //         });
    //     }

    //     const userId = req.userId || (req.query.userId as string);
    //     const queryWithUser = {
    //         ...req.query,
    //         userId,
    //     };

    //     const condResult = CartCondDTOSchema.safeParse(queryWithUser);
    //     if (!condResult.success) {
    //         return res.status(400).json({
    //             error: condResult.error.message
    //         });
    //     }

    //     try {
    //         const paging = pagingResult.data;
    //         const cond = condResult.data;
    //         const result = await this.useCase.listCartItems(cond, paging);

    //         res.status(200).json({
    //             data: result,
    //             paging,
    //             filter: cond
    //         });
    //     } catch (err) {
    //         res.status(500).json({
    //             error: (err as Error).message
    //         });
    //     }
    // }
    async listCartItemsAPI(req: Request, res: Response): Promise<void> {
        try {
            // const userId = req.requester?.sub;
            
            // 👇 Thêm dòng log này để kiểm tra terminal in ra gì
            console.log("DEBUG req.requester:", req.requester);
            console.log("DEBUG req.user:", req.user);

            // Cho phép Controller đọc linh hoạt mọi trường định danh có thể có
            const userId = req.requester?.sub || req.requester?.id || req.requester?.userId || req.user?.sub || req.user?.id || req.user?.userId;

            // Kiểm tra an toàn: Đảm bảo userId tồn tại trước khi sử dụng
            if (!userId) {
            res.status(401).json({ message: "Unauthorized: Missing user identity" });
            return;
        }
            // Ép buộc lọc giỏ hàng theo đúng user đang đăng nhập để bảo mật dữ liệu
            const cond: CartCondDTO = { 
                ...req.query, 
                userId 
            }; 

            const paging: PagingDTO = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
            };

            const result = await this.useCase.listCartItems(cond, paging);
            res.status(200).json({ data: result });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}