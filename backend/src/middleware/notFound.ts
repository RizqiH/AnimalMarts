import { Request, Response } from "express";
import { ApiResponse } from "../types/common";

export const notFound = (req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: "ROUTE_NOT_FOUND",
  };

  res.status(404).json(response);
};
