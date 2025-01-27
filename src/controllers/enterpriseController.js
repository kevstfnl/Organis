const { Request, Response } = require("express");
const { Role, TokenType, PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
prisma.$extends(hashPassword);

/**
 * Handle enterprise register with administrator account.
 * @param {Request} req - Request HTTP
 * @param {Response} res - Response HTTP
 **/
function soon(req, res) {

}
