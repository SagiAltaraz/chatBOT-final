import type { Request, Response } from 'express';

export const chatClearController = {
   clearChat(req: Request, res: Response) {
      // Clear conversation cookie
      res.clearCookie('conversationId');

      // Return success response
      res.json({
         message: 'Chat history cleared successfully',
         success: true,
      });
   },
};
