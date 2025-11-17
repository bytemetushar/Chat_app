import Router from 'express'
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import { getMessages, getUsersforSidebar, sendMessages } from '../controllers/message.controller.js';

const router = Router();

router.get('/user', isLoggedIn, getUsersforSidebar);
router.get('/:id',isLoggedIn, getMessages);

router.post('/send/:id', isLoggedIn, sendMessages);

export default router;