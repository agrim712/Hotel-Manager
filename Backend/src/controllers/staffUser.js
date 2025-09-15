import pkg from "@prisma/client";
const { PrismaClient } = pkg;

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const staffUser = async(req,res)=> {
      const { name, email, password, role, hotelId } = req.body;

  if (!name || !email || !password || !role || !hotelId)
    return res.status(400).json({ message: "Missing fields" });

  const exists = await prisma.staffUser.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const staff = await prisma.staffUser.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      hotelId,
    },
  });

  res.status(201).json({ staff });
}